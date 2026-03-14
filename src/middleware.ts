import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';

// Define the route permissions mapping (atoms)
const routePermissions: Record<string, string[]> = {
  '/dashboard/leads': ['read:leads'],
  '/dashboard/tasks': ['read:tasks'],
  '/dashboard/reports': ['read:reports'],
  '/dashboard/audit-log': ['read:audit'],
  '/dashboard/customer-portal': ['read:portal'],
  '/dashboard/settings': ['read:settings'],
  '/dashboard': ['read:dashboard'],
  '/admin/users': ['read:users', 'write:users'],
};

// Next.js Middleware runs on the Edge runtime, allowing for high-performance JWT validation.
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Public paths don't need auth
  const isPublicPath = path === '/login' || path === '/register' || path.startsWith('/api/auth');
  
  if (isPublicPath) {
    return NextResponse.next();
  }

  // The access token is ONLY in memory in the client, so middleware cannot see it.
  // We rely on the HTTP-only Refresh Token to determine baseline authentication.
  const token = request.cookies.get('refreshToken')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const payload = await verifyToken(token);
    
    if (!payload?.userId) {
      // Clean up invalid RT
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('refreshToken');
      return response;
    }

    const userPermissions: string[] = Array.isArray(payload.permissions) ? payload.permissions : [];

    // Now let's do RBAC checks
    let requiresPermissions: string[] = [];
    
    for (const [route, perms] of Object.entries(routePermissions)) {
      if (path.startsWith(route)) {
        requiresPermissions = perms;
        break;
      }
    }

    if (requiresPermissions.length > 0) {
      // Check if user has ALL required permissions (or you could design it as ANY, but typically it specifies exact atoms)
      const hasAccess = requiresPermissions.every((perm) => userPermissions.includes(perm));
      
      if (!hasAccess) {
        return NextResponse.redirect(new URL('/403', request.url));
      }
    }
    
    return NextResponse.next();

  } catch (error) {
    console.error('Middleware error', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
