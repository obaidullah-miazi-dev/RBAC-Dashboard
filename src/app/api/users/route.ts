import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongoose';
import User from '@/models/User';
import UserPermission from '@/models/UserPermission';
import AuditLog from '@/models/AuditLog';
import { verifyToken } from '@/lib/auth/jwt';
import { resolveUserPermissions } from '@/lib/rbac';
import { cookies } from 'next/headers';

import bcrypt from 'bcryptjs';

const ROLE_HIERARCHY: Record<string, number> = {
  admin: 100,
  manager: 50,
  agent: 10,
  customer: 1,
};

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

    const { name, email, password, role, status } = await req.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectToDatabase();

    // 1. Verify standard write access
    const actorPermissions = await resolveUserPermissions(payload.userId);
    if (!actorPermissions.includes('write:users')) {
      return NextResponse.json({ error: 'Forbidden: Missing write:users permission' }, { status: 403 });
    }

    // 2. Verify Role Hierarchy (Grant Ceiling logic for role assignment)
    const actor = await User.findById(payload.userId);
    if (!actor) {
      return NextResponse.json({ error: 'Actor user not found' }, { status: 404 });
    }
    
    const actorRoleWeight = ROLE_HIERARCHY[actor.role] || 0;
    const targetRoleWeight = ROLE_HIERARCHY[role] || 0;

    if (actorRoleWeight < targetRoleWeight) {
       return NextResponse.json({ 
         error: `Hierarchy Violation: A ${actor.role} cannot create a user with ${role} privileges.` 
       }, { status: 403 });
    }

    // 3. Create the User
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }

    // Hash the password securely
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email: email.toLowerCase().trim(),
      passwordHash: hashedPassword,
      role,
      status: status || 'active',
      managerId: actor.role === 'manager' ? actor._id : null,
      refreshTokens: [],
    });

    await newUser.save();

    // 4. Create the empty UserPermission document so they only have base Role perms initially
    const newUserPerm = new UserPermission({
      userId: newUser._id,
      grantedPermissions: [],
      revokedPermissions: [],
    });

    await newUserPerm.save();

    // 5. Audit Trail
    await AuditLog.create({
      actorId: payload.userId,
      targetUserId: newUser._id.toString(),
      action: 'CREATE_USER',
      details: `Created new user ${email} with role ${role}.`,
    });

    const finalPermissions = await resolveUserPermissions(newUser._id.toString());

    return NextResponse.json({ 
      success: true, 
      user: {
        _id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
        permissions: finalPermissions
      }
    });

  } catch (error) {
    console.error('User creation error', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
