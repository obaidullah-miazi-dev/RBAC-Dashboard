import { SignJWT, jwtVerify, JWTPayload } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-me-in-prod';
const key = new TextEncoder().encode(JWT_SECRET);

export interface TokenPayload extends JWTPayload {
  userId: string;
  email: string;
  role: string;
  permissions: string[]; // Atoms e.g., ['read:users', 'write:reports']
}

export async function signAccessToken(payload: Omit<TokenPayload, 'exp' | 'iat' | 'nbf'>) {
  return await new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m') // 15 mins for AT
    .sign(key);
}

export async function signRefreshToken(userId: string, permissions: string[]) {
  return await new SignJWT({ userId, permissions })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d') // 7 days for RT
    .sign(key);
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ['HS256'],
    });
    return payload as TokenPayload;
  } catch (error) {
    return null; // Invalid or expired
  }
}
