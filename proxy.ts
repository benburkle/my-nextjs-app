import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function proxy(request: NextRequest) {
  const token = await getToken({ 
    req: request,
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  });

  // Allow access to auth routes
  if (request.nextUrl.pathname.startsWith('/auth') || 
      request.nextUrl.pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // Protect API routes
  if (request.nextUrl.pathname.startsWith('/api/studies') ||
      request.nextUrl.pathname.startsWith('/api/guides') ||
      request.nextUrl.pathname.startsWith('/api/resources') ||
      request.nextUrl.pathname.startsWith('/api/sessions') ||
      request.nextUrl.pathname.startsWith('/api/schedules')) {
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  // Protect page routes
  if (request.nextUrl.pathname.startsWith('/setup') ||
      request.nextUrl.pathname.startsWith('/study')) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/setup/:path*',
    '/study/:path*',
    '/api/studies/:path*',
    '/api/guides/:path*',
    '/api/resources/:path*',
    '/api/sessions/:path*',
    '/api/schedules/:path*',
  ],
};

