import { NextResponse, type NextRequest } from 'next/server';
import { getSessionCookie } from 'better-auth';

import { logger, withOrganizationContext } from '@/lib/logger';

/**
 * Middleware configuration for the application
 * Leverages Better-Auth for session validation while keeping organization logic separate
 */
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip middleware for auth paths
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // Only check protected routes
  if (
    pathname.startsWith('/api/organizations') ||
    pathname.startsWith('/organizations')
  ) {
    // Check for session cookie existence (lightweight)
    const sessionCookie = getSessionCookie(request);

    if (!sessionCookie) {
      logger.debug('No session cookie found', { pathname });

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
        });

        // Add organization context headers
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-organization-slug', organizationSlug);

        return NextResponse.next({
          request: { headers: requestHeaders },
        });
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/organizations/:path*', '/organizations/:path*'],
};
