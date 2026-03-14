import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  // In a real app we'd also remove the specific RT from the DB user document
  const cookieStore = await cookies();
  cookieStore.delete('refreshToken');
  
  return NextResponse.json({ success: true });
}
