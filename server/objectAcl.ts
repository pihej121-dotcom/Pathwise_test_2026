/**
 * Object ACL — storage-agnostic access control types and helpers.
 *
 * Policies are stored as plain JSON; the storage backend (Supabase Storage,
 * S3, GCS, etc.) is responsible for persisting them in object metadata or a
 * separate store.
 */

const ACL_POLICY_METADATA_KEY = "custom:aclPolicy";
export { ACL_POLICY_METADATA_KEY };

// The type of the access group.
export enum ObjectAccessGroupType {}

// The logical user group that can access the object.
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

// The ACL policy of the object.
export interface ObjectAclPolicy {
  owner: string;
  visibility: "public" | "private";
  aclRules?: Array<ObjectAclRule>;
}

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

function createObjectAccessGroup(
  group: ObjectAccessGroup,
): BaseObjectAccessGroup {
  switch (group.type) {
    default:
      throw new Error(`Unknown access group type: ${group.type}`);
  }
}

/**
 * Checks if a user can access an object given a resolved ACL policy.
 * The caller is responsible for loading the policy from storage.
 */
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

// ---------------------------------------------------------------------------
// Legacy shims — kept so existing callers don't break while being migrated.
// These operate on a string objectPath rather than a GCS File object.
// ---------------------------------------------------------------------------

/** In-process ACL cache. Replace with a DB-backed store for multi-instance deployments. */
const _aclStore = new Map<string, ObjectAclPolicy>();

export async function setObjectAclPolicy(
  objectPath: string,
  aclPolicy: ObjectAclPolicy,
): Promise<void> {
  _aclStore.set(objectPath, aclPolicy);
}

export async function getObjectAclPolicy(
  objectPath: string,
): Promise<ObjectAclPolicy | null> {
  return _aclStore.get(objectPath) ?? null;
}

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
