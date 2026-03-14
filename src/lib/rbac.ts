import User from '@/models/User';
import Role from '@/models/Role';
import UserPermission from '@/models/UserPermission';

/**
 * Evaluates whether an actor with a set of permissions can grant
 * a specific list of target permissions.
 *
 * Grant Ceiling Rule: A user can only grant permissions that they themselves possess.
 *
 * @param actorPermissions The permissions the acting user currently holds
 * @param requestedPermissions The permissions the actor is trying to grant
 * @returns Boolean representing if the action is authorized
 */
export function canGrant(actorPermissions: string[], requestedPermissions: string[]): boolean {
  if (!Array.isArray(actorPermissions) || !Array.isArray(requestedPermissions)) {
    return false;
  }
  
  // The actor must have EVERY permission they are trying to grant
  return requestedPermissions.every((perm) => actorPermissions.includes(perm));
}

/**
 * Calculates the final active permission atoms for a user.
 * Formula: (Role.basePermissions ∪ UserPermission.grantedPermissions) - UserPermission.revokedPermissions
 */
export async function resolveUserPermissions(userId: string): Promise<string[]> {
  const user = await User.findById(userId).lean();
  if (!user) return [];

  const role = await Role.findOne({ name: user.role }).lean();
  const basePermissions = role?.permissions || [];

  const userPermsDoc = await UserPermission.findOne({ userId }).lean();
  
  const granted = userPermsDoc?.grantedPermissions || [];
  const revoked = userPermsDoc?.revokedPermissions || [];

  // Combine base and granted (using Set for uniqueness)
  const combined = new Set([...basePermissions, ...granted]);

  // Remove revoked permissions
  for (const r of revoked) {
    combined.delete(r);
  }

  return Array.from(combined);
}
