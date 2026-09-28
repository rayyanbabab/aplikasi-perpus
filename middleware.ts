import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
  });

  const isLoggedIn = !!token;
  const isAdmin = token?.role === 'admin';

  const isAdminRoute = pathname.startsWith('/admin');
  const isMemberRoute = pathname.startsWith('/member');
  const isAuthRoute = pathname === '/login' || pathname === '/register';

  // Sudah login → redirect dari auth routes
  if (isLoggedIn && isAuthRoute) {
    if (isAdmin) return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    return NextResponse.redirect(new URL('/member/katalog', request.url));
  }

  // Admin route → hanya admin
  if (isAdminRoute) {
    if (!isLoggedIn) return NextResponse.redirect(new URL('/login', request.url));
    if (!isAdmin) return NextResponse.redirect(new URL('/member/katalog', request.url));
  }

  // Member route → harus login
  if (isMemberRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/member/:path*',
    '/login',
    '/register',
  ],
};
