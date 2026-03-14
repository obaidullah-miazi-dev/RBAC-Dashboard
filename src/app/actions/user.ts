'use server';

import connectToDatabase from '@/lib/db/mongoose';
import User from '@/models/User';
import AuditLog from '@/models/AuditLog';
import { canGrant } from '@/lib/rbac';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/jwt';

// Helper to get current authenticated user's payload in Server Actions
async function getActor() {
  const cookieStore = await cookies();
  const token = cookieStore.get('refreshToken')?.value;
  if (!token) throw new Error('Unauthorized');
  
  const payload = await verifyToken(token);
  if (!payload || !payload.userId) throw new Error('Unauthorized');

  return payload;
}

// Wrapper for Audit Logging
async function withAudit(actorId: string, action: string, targetUserId: string, details: string, operation: () => Promise<any>) {
  try {
    const result = await operation();
    
    // Log success
    await AuditLog.create({
      actorId,
      action,
      targetUserId,
      details,
    });
    
    return result;
  } catch (error: any) {
    // We could log failures here too if desired
    console.error(`Audit action failed: ${action}`, error);
    throw error;
  }
}

export async function grantPermissions(targetUserId: string, unverifiedPermissions: string[]) {
  await connectToDatabase();
  const actor = await getActor();
  const actorPermissions = Array.isArray(actor.permissions) ? actor.permissions : [];

  const requestedPermissions = Array.isArray(unverifiedPermissions) ? unverifiedPermissions : [];

  if (!canGrant(actorPermissions, requestedPermissions)) {
    throw new Error('Grant Ceiling Exceeded: You cannot grant permissions you do not possess.');
  }

  return withAudit(
    actor.userId, 
    'GRANT_PERMISSIONS', 
    targetUserId, 
    `Granted permissions: ${requestedPermissions.join(', ')}`,
    async () => {
      const targetUser = await User.findById(targetUserId);
      if (!targetUser) throw new Error('Target user not found');

      // Add permissions that the target user doesn't already have
      const existingPerms = new Set(targetUser.permissions);
      requestedPermissions.forEach(p => existingPerms.add(p));
      
      targetUser.permissions = Array.from(existingPerms);
      await targetUser.save();

      return { success: true, permissions: targetUser.permissions };
    }
  );
}

export async function revokePermissions(targetUserId: string, permissionsToRevoke: string[]) {
  await connectToDatabase();
  const actor = await getActor();
  
  // The prompt only explicitly specified a Grant Ceiling, but usually a Revoke Ceiling exists too.
  // "A user (like a Manager) can only grant permissions to their subordinates that the Manager themselves possesses."
  // To be safe, we might apply the same ceiling to revoking, or assume they can only revoke what they have.
  // For simplicity and matching verbatim instructions, we'll enforce the same ceiling on revokes.
  const actorPermissions = Array.isArray(actor.permissions) ? actor.permissions : [];
  if (!canGrant(actorPermissions, permissionsToRevoke)) {
    throw new Error('Revoke Ceiling Exceeded: You cannot revoke permissions you do not possess.');
  }

  return withAudit(
    actor.userId,
    'REVOKE_PERMISSIONS',
    targetUserId,
    `Revoked permissions: ${permissionsToRevoke.join(', ')}`,
    async () => {
      const targetUser = await User.findById(targetUserId);
      if (!targetUser) throw new Error('Target user not found');

      targetUser.permissions = targetUser.permissions.filter((p: string) => !permissionsToRevoke.includes(p));
      await targetUser.save();

      return { success: true, permissions: targetUser.permissions };
    }
  );
}

export async function toggleUserSuspension(targetUserId: string, suspend: boolean) {
  await connectToDatabase();
  const actor = await getActor();
  
  // Need explicit permission to suspend users
  const actorPermissions = Array.isArray(actor.permissions) ? actor.permissions : [];
  if (!actorPermissions.includes('write:users')) {
    throw new Error('You do not have permission to suspend/activate users.');
  }

  return withAudit(
    actor.userId,
    suspend ? 'SUSPEND_USER' : 'ACTIVATE_USER',
    targetUserId,
    `${suspend ? 'Suspended' : 'Activated'} user account`,
    async () => {
      const targetUser = await User.findById(targetUserId);
      if (!targetUser) throw new Error('Target user not found');
      
      // Prevent self-suspension
      if (targetUserId === actor.userId) throw new Error('Cannot suspend yourself');

      targetUser.isActive = !suspend;
      await targetUser.save();

      return { success: true, isActive: targetUser.isActive };
    }
  );
}
