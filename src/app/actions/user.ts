'use server';

import connectToDatabase from '@/lib/db/mongoose';
import User from '@/models/User';
import AuditLog from '@/models/AuditLog';
import { verifyToken } from '@/lib/auth/jwt';
import { cookies } from 'next/headers';
import { resolveUserPermissions } from '@/lib/rbac';

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
  } catch (error: unknown) {
    console.error(`Audit action failed: ${action}`, error);
    throw error;
  }
}

// Note: For atom-based permission toggling from UI, it's better to use the robust
// /api/permissions/update route directly. We'll leave these Server Actions as wrappers
// for backward compatibility, but they will fetch the route to ensure standard validation.
export async function grantPermissions(targetUserId: string, unverifiedPermissions: string[]) {
  const cookieStore = await cookies();
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/permissions/update`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // We must pass the cookie forward to the API route so it can verify the token
      Cookie: `refreshToken=${cookieStore.get('refreshToken')?.value}`
    },
    body: JSON.stringify({
      targetUserId,
      action: 'grant',
      permissions: unverifiedPermissions
    })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to grant permissions');
  return data;
}

export async function revokePermissions(targetUserId: string, permissionsToRevoke: string[]) {
  const cookieStore = await cookies();
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/permissions/update`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: `refreshToken=${cookieStore.get('refreshToken')?.value}`
    },
    body: JSON.stringify({
      targetUserId,
      action: 'revoke',
      permissions: permissionsToRevoke
    })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to revoke permissions');
  return data;
}

export async function toggleUserStatus(targetUserId: string, newStatus: 'active' | 'suspended' | 'banned') {
  await connectToDatabase();
  const actor = await getActor();
  
  // Need explicit permission to manage users
  const actorPermissions = await resolveUserPermissions(actor.userId);
  if (!actorPermissions.includes('write:users')) {
    throw new Error('You do not have permission to change user statuses.');
  }

  return withAudit(
    actor.userId,
    'CHANGE_USER_STATUS',
    targetUserId,
    `Changed user status to ${newStatus}`,
    async () => {
      const targetUser = await User.findById(targetUserId);
      if (!targetUser) throw new Error('Target user not found');
      
      // Prevent self-modification
      if (targetUserId === actor.userId) throw new Error('Cannot change your own status');

      targetUser.status = newStatus;
      await targetUser.save();

      return { success: true, status: targetUser.status };
    }
  );
}
