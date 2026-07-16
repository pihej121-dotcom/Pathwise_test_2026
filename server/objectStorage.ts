/**
 * Object Storage — Supabase Storage implementation.
 *
 * Replaces the previous Replit-proprietary GCS sidecar implementation.
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.
 */
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import { Response } from "express";
import {
  ObjectAclPolicy,
  ObjectPermission,
  canAccessObjectByPolicy,
  getObjectAclPolicy,
  setObjectAclPolicy,
} from "./objectAcl";

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

export class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

export class ObjectStorageService {
  private getBucket(): string {
    return process.env.SUPABASE_STORAGE_BUCKET || "resumes";
  }

  /**
   * Returns a short-lived signed upload URL (PUT) that the client can use
   * to upload a file directly to Supabase Storage without exposing credentials.
   * TTL: 15 minutes.
   */
  async getObjectEntityUploadURL(): Promise<string> {
    const supabase = getSupabaseClient();
    const objectName = `uploads/${randomUUID()}`;

    const { data, error } = await supabase.storage
      .from(this.getBucket())
      .createSignedUploadUrl(objectName);

    if (error) {
      throw new Error(`Failed to create signed upload URL: ${error.message}`);
    }
    return data.signedUrl;
  }

  /**
   * Generates a signed download URL for a private object (15-min TTL).
   */
  async getSignedDownloadURL(objectPath: string): Promise<string> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.storage
      .from(this.getBucket())
      .createSignedUrl(objectPath, 900);

    if (error) throw new Error(`Failed to sign download URL: ${error.message}`);
    return data.signedUrl;
  }

  /**
   * Streams a private object to the HTTP response.
   * Checks the ACL policy (by object path) before serving.
   */
  async downloadObject(
    objectPath: string,
    res: Response,
    cacheTtlSec: number = 3600
  ): Promise<void> {
    try {
      const aclPolicy = await getObjectAclPolicy(objectPath);
      const isPublic = aclPolicy?.visibility === "public";

      const supabase = getSupabaseClient();
      const { data, error } = await supabase.storage
        .from(this.getBucket())
        .download(objectPath);

      if (error) throw new ObjectNotFoundError();

      const arrayBuffer = await data.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

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
        } else {
          res.status(500).json({ error: "Error downloading file" });
        }
      }
    }
  }

  /**
   * Normalizes a raw Supabase Storage URL to a short object path.
   * e.g. "https://[project].supabase.co/storage/v1/object/sign/resumes/uploads/abc"
   *   → "uploads/abc"
   */
  normalizeObjectEntityPath(rawPath: string): string {
    const supabaseUrl = process.env.SUPABASE_URL;
    if (!supabaseUrl || !rawPath.startsWith(supabaseUrl)) {
      return rawPath;
    }
    // Strip the storage URL prefix to get just the object name
    const marker = `/object/`;
    const idx = rawPath.indexOf(marker);
    if (idx === -1) return rawPath;
    const afterMarker = rawPath.slice(idx + marker.length);
    // afterMarker is like: "sign/resumes/uploads/abc?token=..." or "public/resumes/uploads/abc"
    // Remove query string then bucket prefix
    const withoutQuery = afterMarker.split("?")[0];
    const bucket = this.getBucket();
    const bucketPrefix = `${withoutQuery.includes("/") ? withoutQuery.split("/")[0] : ""}/${bucket}/`;
    if (withoutQuery.includes(`/${bucket}/`)) {
      return withoutQuery.slice(withoutQuery.indexOf(`/${bucket}/`) + bucket.length + 2);
    }
    return withoutQuery;
  }

  /**
   * Sets an ACL policy for an object entity (by normalized path).
   */
  async trySetObjectEntityAclPolicy(
    rawPath: string,
    aclPolicy: ObjectAclPolicy
  ): Promise<string> {
    const normalizedPath = this.normalizeObjectEntityPath(rawPath);
    await setObjectAclPolicy(normalizedPath, aclPolicy);
    return normalizedPath;
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
}
