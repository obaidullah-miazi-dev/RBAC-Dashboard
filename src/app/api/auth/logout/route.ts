import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectToDatabase from '@/lib/db/mongoose';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth/jwt';

export async function POST() {
  let cookieStore;
  let refreshToken;

  try {
    cookieStore = await cookies();
    refreshToken = cookieStore.get('refreshToken')?.value;
  } catch (error) {
    console.error('Error accessing cookies:', error);
    // Proceed to clear cookie even if there was an error accessing it
  }

  if (refreshToken) {
    try {
      const payload = await verifyToken(refreshToken);
      if (payload?.userId) {
        await connectToDatabase();
        await User.updateOne(
          { _id: payload.userId },
          { $pull: { refreshTokens: refreshToken } }
        );
      }
    } catch (error) {
      console.error('Logout error during DB token invalidation', error);
      // Even if it fails, we still want to clear the cookie and log them out client-side
    }
  }

  if (cookieStore) {
    cookieStore.delete('refreshToken');
  }
  
  return NextResponse.json({ success: true });
}
