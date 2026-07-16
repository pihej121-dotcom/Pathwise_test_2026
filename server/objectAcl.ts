/**
 * Object ACL — PostgreSQL-backed access control for Supabase Storage objects.
 *
 * Ownership and visibility are stored in the `file_metadata` table so that
 * all serverless instances share the same state (no in-memory maps).
 */
import { db } from "./db";
import { fileMetadata, insertFileMetadataSchema } from "@shared/schema";
import { eq } from "drizzle-orm";

export const ACL_POLICY_METADATA_KEY = "custom:aclPolicy";

// ── Types ──────────────────────────────────────────────────────────────────

export enum ObjectAccessGroupType {}

export interface ObjectAccessGroup {
  type: ObjectAccessGroupType;
  id: string;
}

export enum ObjectPermission {
  READ = "read",
  WRITE = "write",
}

export interface ObjectAclRule {
  group: ObjectAccessGroup;
  permission: ObjectPermission;
}

export interface ObjectAclPolicy {
  owner: string;
  visibility: "public" | "private";
  aclRules?: Array<ObjectAclRule>;
}

// ── Internal helpers ───────────────────────────────────────────────────────

function isPermissionAllowed(
  requested: ObjectPermission,
  granted: ObjectPermission,
): boolean {
  if (requested === ObjectPermission.READ) {
    return [ObjectPermission.READ, ObjectPermission.WRITE].includes(granted);
  }
  return granted === ObjectPermission.WRITE;
}

abstract class BaseObjectAccessGroup implements ObjectAccessGroup {
  constructor(
    public readonly type: ObjectAccessGroupType,
    public readonly id: string,
  ) {}
  public abstract hasMember(userId: string): Promise<boolean>;
}

function createObjectAccessGroup(group: ObjectAccessGroup): BaseObjectAccessGroup {
  switch (group.type) {
    default:
      throw new Error(`Unknown access group type: ${group.type}`);
  }
}

// ── Public policy helpers (accept a pre-loaded policy, no DB call) ─────────

export async function canAccessObjectByPolicy({
  userId,
  aclPolicy,
  requestedPermission,
}: {
  userId?: string;
  aclPolicy: ObjectAclPolicy | null;
  requestedPermission: ObjectPermission;
}): Promise<boolean> {
  if (!aclPolicy) return false;

  if (
    aclPolicy.visibility === "public" &&
    requestedPermission === ObjectPermission.READ
  ) {
    return true;
  }

  if (!userId) return false;
  if (aclPolicy.owner === userId) return true;

  for (const rule of aclPolicy.aclRules || []) {
    const accessGroup = createObjectAccessGroup(rule.group);
    if (
      (await accessGroup.hasMember(userId)) &&
      isPermissionAllowed(requestedPermission, rule.permission)
    ) {
      return true;
    }
  }

  return false;
}

// ── DB-backed shims (keyed by object path) ─────────────────────────────────

/**
 * Upserts the ACL policy for an object path in the `file_metadata` table.
 */
export async function setObjectAclPolicy(
  objectPath: string,
  aclPolicy: ObjectAclPolicy,
): Promise<void> {
  await db
    .insert(fileMetadata)
    .values({
      objectPath,
      ownerUserId: aclPolicy.owner,
      visibility: aclPolicy.visibility,
      uploadStatus: "completed",
    })
    .onConflictDoUpdate({
      target: fileMetadata.objectPath,
      set: { visibility: aclPolicy.visibility },
    });
}

/**
 * Reads the ACL policy for an object path from the `file_metadata` table.
 * Returns null if no record exists.
 */
export async function getObjectAclPolicy(
  objectPath: string,
): Promise<ObjectAclPolicy | null> {
  const [row] = await db
    .select()
    .from(fileMetadata)
    .where(eq(fileMetadata.objectPath, objectPath))
    .limit(1);

  if (!row) return null;

  return {
    owner: row.ownerUserId,
    visibility: row.visibility,
  };
}

/**
 * Checks whether a user can access an object, loading the policy from the DB.
 */
export async function canAccessObject({
  userId,
  objectPath,
  requestedPermission,
}: {
  userId?: string;
  objectPath: string;
  requestedPermission: ObjectPermission;
}): Promise<boolean> {
  const aclPolicy = await getObjectAclPolicy(objectPath);
  return canAccessObjectByPolicy({ userId, aclPolicy, requestedPermission });
}
