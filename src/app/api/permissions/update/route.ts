import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongoose';
import UserPermission from '@/models/UserPermission';
import AuditLog from '@/models/AuditLog';
import { verifyToken } from '@/lib/auth/jwt';
import { resolveUserPermissions, canGrant } from '@/lib/rbac';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const token = (await cookies()).get('refreshToken')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload?.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { targetUserId, action, permissions } = await req.json();

    if (!targetUserId || !permissions || !Array.isArray(permissions) || !['grant', 'revoke'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 });
    }
    
    // Prevent self-modification for security
    if (payload.userId === targetUserId) {
       return NextResponse.json({ error: 'Cannot modify your own permissions directly' }, { status: 403 });
    }

    await connectToDatabase();

    // 1. Verify Grant Ceiling (Actor must hold the atoms)
    const actorPermissions = await resolveUserPermissions(payload.userId);
    
    if (!canGrant(actorPermissions, permissions)) {
      return NextResponse.json({ 
        error: 'Grant Ceiling Violation: You can only ' + action + ' permissions you currently possess.', 
        actorPermissions 
      }, { status: 403 });
    }

    // 2. Fetch or Create Target User's Permission Doc
    let userPermDoc = await UserPermission.findOne({ userId: targetUserId });
    if (!userPermDoc) {
      userPermDoc = new UserPermission({ userId: targetUserId, grantedPermissions: [], revokedPermissions: [] });
    }

    // 3. Apply the changes
    const targetBasePerms = await resolveUserPermissions(targetUserId);

    if (action === 'grant') {
      for (const perm of permissions) {
        if (!userPermDoc.grantedPermissions.includes(perm)) {
           userPermDoc.grantedPermissions.push(perm);
        }
        // If it was previously revoked, un-revoke it
        userPermDoc.revokedPermissions = userPermDoc.revokedPermissions.filter((r: string) => r !== perm);
      }
    } else if (action === 'revoke') {
        for (const perm of permissions) {
        if (!userPermDoc.revokedPermissions.includes(perm)) {
           userPermDoc.revokedPermissions.push(perm);
        }
        // If it was previously granted explicitly, remove from granted
        userPermDoc.grantedPermissions = userPermDoc.grantedPermissions.filter((g: string) => g !== perm);
      }
    }

    await userPermDoc.save();

    // 4. Audit Trail
    await AuditLog.create({
      actorId: payload.userId,
      targetUserId,
      action: action.toUpperCase() + '_PERMISSION',
      details: `Permissions [${permissions.join(', ')}] were ${action}ed.`,
    });

    const newFinalPermissions = await resolveUserPermissions(targetUserId);

    return NextResponse.json({ 
      success: true, 
      permissions: newFinalPermissions,
      message: `Permissions successfully ${action}ed.` 
    });

  } catch (error) {
    console.error('Permission update error', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
