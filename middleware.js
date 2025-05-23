import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;

  // Protected routes
  const protectedRoutes = ["/",'/profile', '/checkout', '/dashboard'];
  const isProtected = protectedRoutes.icludes(pathname);

  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Admin routes
  const adminRoutes = ['/admin'];
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  if (isAdminRoute && token?.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}