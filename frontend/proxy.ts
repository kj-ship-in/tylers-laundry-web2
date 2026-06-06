// proxy.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function proxy(req: NextRequest) {
  console.log('Proxy running for', req.nextUrl.pathname);

  const { pathname } = req.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/signup', '/verify-email'];

  // Check if route is public
  const isPublicRoute = publicRoutes.some(
    route => pathname === route || pathname.startsWith(route + '/'),
  );

  // Skip processing for Next.js internal routes, static files, and NextAuth
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/images') ||
    pathname.startsWith('/api/verify-email') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Allow public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Get session token from NextAuth
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Check if user is authenticated
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const userRole = token.role as string;

  // Role-based route protection
  const roleBasedRoutes: Record<string, string[]> = {
    '/admin': ['ADMIN'],
    '/staff': ['STAFF'],
    '/customer': ['USER'],
  };

  // Check role-based access
  for (const [route, allowedRoles] of Object.entries(roleBasedRoutes)) {
    if (pathname.startsWith(route)) {
      if (!allowedRoles.includes(userRole)) {
        // Redirect based on user role
        const redirectPath =
          userRole === 'ADMIN'
            ? '/admin/dashboard'
            : userRole === 'STAFF'
              ? '/staff/dashboard'
              : userRole === 'USER'
                ? '/customer/dashboard'
                : '/login';

        return NextResponse.redirect(new URL(redirectPath, req.url));
      }
      break;
    }
  }

  // Check API route access
  if (pathname.startsWith('/api/user')) {
    if (!['ADMIN', 'STAFF', 'USER'].includes(userRole)) {
      return new NextResponse('Forbidden', { status: 403 });
    }
  }

  return NextResponse.next();
}

// Configure which paths the proxy should run on
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
