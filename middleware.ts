import { NextResponse, type NextRequest } from 'next/server';

import { validateSession } from '@/lib/auth/session';
import { AppError } from '@/lib/errors';
import { ERROR_CODES } from '@/lib/types/responses/error';

/**
 * Middleware for handling organization routes authentication and context
 * Leverages Better-Auth for session validation while keeping organization logic separate
 */
export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Only handle organization-specific routes
  if (
    pathname.startsWith('/api/organizations') ||
    pathname.startsWith('/dashboard/organizations')
  ) {
    try {
      // Use Better-Auth's session validation
      const session = await validateSession(req);

      if (!session?.user) {
        return NextResponse.json(
          {
            message: 'Authentication required',
            code: ERROR_CODES.UNAUTHORIZED,
            status: 401,
          },
          { status: 401 }
        );
      }

      // For organization routes, add our custom context
      if (pathname.includes('/organizations/')) {
        const organizationSlug = pathname
          .split('/organizations/')[1]
          ?.split('/')[0];

        if (organizationSlug) {
          // Add organization context headers
          const requestHeaders = new Headers(req.headers);
          requestHeaders.set('x-organization-slug', organizationSlug);
          // Add user context headers
          requestHeaders.set('x-user-id', session.user.id);
          // Add session tracking header for metrics
          requestHeaders.set('x-session-id', session.sessionId || '');

          return NextResponse.next({
            request: {
              headers: requestHeaders,
            },
          });
        }
      }

      return NextResponse.next();
    } catch (error) {
      if (error instanceof AppError) {
        return NextResponse.json(
          {
            message: error.message,
            code: error.code,
            status: error.status,
          },
          { status: error.status }
        );
      }
      throw error;
    }
  }

  return NextResponse.next();
}

// Only match organization routes - let Better-Auth handle its own routes
export const config = {
  matcher: ['/api/organizations/:path*', '/dashboard/organizations/:path*'],
};
