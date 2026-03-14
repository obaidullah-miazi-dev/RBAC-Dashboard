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
