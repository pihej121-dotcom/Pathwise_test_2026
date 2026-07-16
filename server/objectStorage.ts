/**
 * Object Storage — Supabase Storage implementation.
 *
 * Replaces the previous Replit-proprietary GCS sidecar implementation.
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.
 *
 * Security properties:
 * - Only authenticated users may request a signed upload URL.
 * - The server generates object paths that embed the owner's user ID.
 * - Ownership is recorded in `file_metadata` before the upload URL is issued.
 * - Downloads require an ownership check against `file_metadata`.
 * - The SUPABASE_SERVICE_ROLE_KEY is never sent to the client.
 */
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import { Response } from "express";
import { db } from "./db";
import { fileMetadata } from "@shared/schema";
import { eq } from "drizzle-orm";
import {
  ObjectAclPolicy,
  ObjectPermission,
  canAccessObjectByPolicy,
  getObjectAclPolicy,
  setObjectAclPolicy,
} from "./objectAcl";

// ── Supabase client ────────────────────────────────────────────────────────

function getSupabaseClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set for file storage. " +
        "Find these in your Supabase project → Settings → API."
    );
  }
  return createClient(url, key);
}

function getBucket(): string {
  return process.env.SUPABASE_STORAGE_BUCKET || "resumes";
}

// ── Errors ─────────────────────────────────────────────────────────────────

export class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

export class ObjectForbiddenError extends Error {
  constructor() {
    super("Access denied");
    this.name = "ObjectForbiddenError";
    Object.setPrototypeOf(this, ObjectForbiddenError.prototype);
  }
}

// ── Service ────────────────────────────────────────────────────────────────

export class ObjectStorageService {
  /**
   * Generates a signed upload URL for direct client-side upload to Supabase Storage.
   *
   * The object path embeds the owner's userId to prevent cross-user path collisions.
   * A `pending` DB record is created immediately; call `markUploadCompleted` after
   * confirming the file arrived.
   *
   * @param userId  Authenticated user's ID (from the session).
   * @returns       `{ signedUrl, objectPath }` — return both to the client so it can
   *                send objectPath back when creating the resume record.
   */
  async getObjectEntityUploadURL(userId: string): Promise<{ signedUrl: string; objectPath: string }> {
    const supabase = getSupabaseClient();
    const objectPath = `uploads/${userId}/${randomUUID()}`;

    const { data, error } = await supabase.storage
      .from(getBucket())
      .createSignedUploadUrl(objectPath);

    if (error) {
      throw new Error(`Failed to create signed upload URL: ${error.message}`);
    }

    return { signedUrl: data.signedUrl, objectPath };
  }

  /**
   * Creates a `pending` ownership record in `file_metadata`.
   * Must be called before the signed URL is returned to the client.
   */
  async createPendingUploadRecord(params: {
    objectPath: string;
    ownerUserId: string;
    originalFilename: string;
    mimeType?: string | null;
    fileSizeBytes?: number | null;
  }): Promise<void> {
    await db
      .insert(fileMetadata)
      .values({
        objectPath: params.objectPath,
        ownerUserId: params.ownerUserId,
        visibility: "private",
        originalFilename: params.originalFilename,
        mimeType: params.mimeType ?? null,
        fileSizeBytes: params.fileSizeBytes ?? null,
        uploadStatus: "pending",
      })
      .onConflictDoUpdate({
        target: fileMetadata.objectPath,
        set: { uploadStatus: "pending" },
      });
  }

  /**
   * Transitions a `pending` record to `completed` once the client confirms upload.
   * Abandoned `pending` records do not imply a completed upload.
   */
  async markUploadCompleted(objectPath: string): Promise<void> {
    await db
      .update(fileMetadata)
      .set({ uploadStatus: "completed" })
      .where(eq(fileMetadata.objectPath, objectPath));
  }

  /**
   * Marks a record as `failed` (e.g. client reported upload error).
   */
  async markUploadFailed(objectPath: string): Promise<void> {
    await db
      .update(fileMetadata)
      .set({ uploadStatus: "failed" })
      .where(eq(fileMetadata.objectPath, objectPath));
  }

  /**
   * Generates a short-lived signed download URL (15-minute TTL).
   * Does NOT enforce ACL — callers must check ownership first.
   */
  async getSignedDownloadURL(objectPath: string): Promise<string> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.storage
      .from(getBucket())
      .createSignedUrl(objectPath, 900);

    if (error) throw new Error(`Failed to sign download URL: ${error.message}`);
    return data.signedUrl;
  }

  /**
   * Downloads an object to the HTTP response.
   * Checks ownership via `file_metadata` before serving.
   * Pass `requestingUserId` to enforce private-object access control.
   */
  async downloadObject(
    objectPath: string,
    res: Response,
    requestingUserId?: string,
    cacheTtlSec = 3600
  ): Promise<void> {
    try {
      const aclPolicy = await getObjectAclPolicy(objectPath);

      const allowed = await canAccessObjectByPolicy({
        userId: requestingUserId,
        aclPolicy,
        requestedPermission: ObjectPermission.READ,
      });

      if (!allowed) {
        if (!res.headersSent) {
          res.status(403).json({ error: "Access denied" });
        }
        return;
      }

      const isPublic = aclPolicy?.visibility === "public";

      const supabase = getSupabaseClient();
      const { data, error } = await supabase.storage
        .from(getBucket())
        .download(objectPath);

      if (error) throw new ObjectNotFoundError();

      const buffer = Buffer.from(await data.arrayBuffer());

      res.set({
        "Content-Type": data.type || "application/octet-stream",
        "Content-Length": buffer.length,
        "Cache-Control": `${isPublic ? "public" : "private"}, max-age=${cacheTtlSec}`,
      });
      res.end(buffer);
    } catch (error) {
      console.error("Error downloading file:", error);
      if (!res.headersSent) {
        if (error instanceof ObjectNotFoundError) {
          res.status(404).json({ error: "Object not found" });
        } else if (error instanceof ObjectForbiddenError) {
          res.status(403).json({ error: "Access denied" });
        } else {
          res.status(500).json({ error: "Error downloading file" });
        }
      }
    }
  }

  /**
   * Sets an ACL policy for an object path (writes to `file_metadata`).
   */
  async trySetObjectEntityAclPolicy(
    objectPath: string,
    aclPolicy: ObjectAclPolicy
  ): Promise<string> {
    await setObjectAclPolicy(objectPath, aclPolicy);
    return objectPath;
  }

  /**
   * Checks whether a user can access an object entity.
   */
  async canAccessObjectEntity({
    userId,
    objectPath,
    requestedPermission,
  }: {
    userId?: string;
    objectPath: string;
    requestedPermission?: ObjectPermission;
  }): Promise<boolean> {
    const aclPolicy = await getObjectAclPolicy(objectPath);
    return canAccessObjectByPolicy({
      userId,
      aclPolicy,
      requestedPermission: requestedPermission ?? ObjectPermission.READ,
    });
  }

  /**
   * Verifies that an objectPath legitimately belongs to a user.
   * Path format: uploads/{userId}/{uuid}
   */
  static isOwnerPath(objectPath: string, userId: string): boolean {
    return objectPath.startsWith(`uploads/${userId}/`);
  }
}
