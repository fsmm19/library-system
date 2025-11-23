import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the request is for a dashboard route
  if (pathname.startsWith('/dashboard')) {
    // Get auth data from cookies or headers
    // In a real app, you'd verify the JWT here
    // For now, we'll rely on the client-side auth and just set up the structure

    // We can't directly access localStorage in middleware (server-side)
    // So we need to use cookies for server-side route protection
    const token = request.cookies.get('auth_token')?.value;
    const userRole = request.cookies.get('user_role')?.value;

    // If no token, redirect to auth page
    if (!token && pathname !== '/dashboard') {
      const url = request.nextUrl.clone();
      url.pathname = '/auth';
      return NextResponse.redirect(url);
    }

    // Role-based access control
    if (userRole) {
      // Librarian trying to access member routes
      if (userRole === 'LIBRARIAN' && pathname.startsWith('/dashboard/member')) {
        const url = request.nextUrl.clone();
        url.pathname = '/dashboard/librarian';
        return NextResponse.redirect(url);
      }

      // Member trying to access librarian routes
      if (userRole === 'MEMBER' && pathname.startsWith('/dashboard/librarian')) {
        const url = request.nextUrl.clone();
        url.pathname = '/dashboard/member';
        return NextResponse.redirect(url);
      }
    }
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
};
