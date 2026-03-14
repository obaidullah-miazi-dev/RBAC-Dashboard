import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongoose';
import User from '@/models/User';
import { signAccessToken, signRefreshToken, verifyToken } from '@/lib/auth/jwt';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('refreshToken')?.value;

    if (!token) {
      return NextResponse.json({ error: 'No refresh token provided' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    
    if (!payload?.userId) {
      return NextResponse.json({ error: 'Invalid refresh token' }, { status: 403 });
    }

    await connectToDatabase();
    // Validate RT exists in DB
    const user = await User.findById(payload.userId);
    if (!user || !user.isActive || !user.refreshTokens.includes(token)) {
      return NextResponse.json({ error: 'Refresh token revoked or user inactive' }, { status: 403 });
    }

    // Refresh token rotation
    const newRefreshToken = await signRefreshToken(user._id.toString(), user.permissions);
    const newAccessToken = await signAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      permissions: user.permissions,
    });

    // Remove old RT and push new one
    user.refreshTokens = user.refreshTokens.filter((rt: string) => rt !== token);
    user.refreshTokens.push(newRefreshToken);
    await user.save();

    cookieStore.set({
      name: 'refreshToken',
      value: newRefreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return NextResponse.json({ 
      accessToken: newAccessToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        permissions: user.permissions,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Refresh error', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
