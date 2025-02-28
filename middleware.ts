import { NextResponse, type NextRequest } from 'next/server';

import { auth } from '@/lib/auth';
import { logger, withOrganizationContext } from '@/lib/logger';

/**
 * Middleware configuration for the application
 * Leverages Better-Auth for session validation
 */
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip middleware for public routes and API endpoints that don't require auth
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname === '/api/auth-inspect' ||
    pathname === '/api/auth-test' ||
    pathname === '/api/auth-debug' ||
    pathname === '/api/webhooks' ||
    pathname === '/sign-in' ||
    pathname === '/sign-up' ||
    pathname === '/reset-password' ||
    pathname === '/verify' ||
    pathname === '/debug-session' ||
    pathname.startsWith('/static')
  ) {
    return NextResponse.next();
  }

  // Only check protected routes
  if (
    pathname.startsWith('/api/organizations') ||
    pathname.startsWith('/organizations')
  ) {
    try {
      // Use Better-Auth's native session validation
      // @ts-ignore - Better-Auth types are not up to date
      const session = await auth.api.getSession({
        headers: request.headers,
        query: {
          disableCookieCache: true,
        },
      });

      if (!session?.user) {
        // Log all cookies for debugging
        const allCookies = request.cookies.getAll();
        const cookieNames = allCookies.map((c) => c.name);

        logger.debug('No valid session found', {
          pathname,
          userAgent: request.headers.get('user-agent') || 'unknown',
          allCookies: cookieNames,
        });

        // Handle API routes
        if (pathname.startsWith('/api/')) {
          return NextResponse.json(
            { message: 'Authentication required' },
            { status: 401 }
          );
        }

        // Redirect to sign-in for non-API routes
        const url = request.nextUrl.clone();
        url.pathname = '/sign-in';
        url.searchParams.set('callbackUrl', pathname + request.nextUrl.search);
        return NextResponse.redirect(url);
      }

      // For organization-specific routes, add headers for downstream use
      if (pathname.includes('/organizations/')) {
        const organizationSlug = pathname
          .split('/organizations/')[1]
          ?.split('/')[0];

        if (organizationSlug) {
          // Use organization-specific logger
          const orgLogger = withOrganizationContext(organizationSlug);
          orgLogger.debug('Processing organization route in middleware', {
            path: pathname,
            userId: session.user.id,
          });

          // Add organization context headers
          const requestHeaders = new Headers(request.headers);
          requestHeaders.set('x-organization-slug', organizationSlug);
          requestHeaders.set('x-user-id', session.user.id);

          return NextResponse.next({
            request: { headers: requestHeaders },
          });
        }
      }

      // For other protected routes, just add the user ID header
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', session.user.id);

      return NextResponse.next({
        request: { headers: requestHeaders },
      });
    } catch (error) {
      logger.error('Middleware error', {
        pathname,
        error: error instanceof Error ? error.message : String(error),
      });

      // Handle API routes
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { message: 'Authentication error' },
          { status: 500 }
        );
      }

      // Redirect to sign-in for non-API routes with error
      const url = request.nextUrl.clone();
      url.pathname = '/sign-in';
      url.searchParams.set('error', 'session_error');
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
    '/api/organizations/:path*',
    '/organizations/:path*',
  ],
};
