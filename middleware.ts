import { NextResponse, type NextRequest } from 'next/server';
import { betterFetch } from '@better-fetch/fetch';
import type { Session } from 'better-auth';

// import { auth } from '@/lib/auth';
import { AppError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { ERROR_CODES } from '@/lib/types/responses/error';

/**
 * Middleware configuration for the application
 * Leverages Better-Auth for session validation while keeping organization logic separate
 */
export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  logger.debug('Middleware called', {
    pathname,
    method: req.method,
    headers: Object.fromEntries(req.headers.entries()),
  });

  if (req.nextUrl.pathname.startsWith('/api/auth')) {
    // Skip middleware for public paths
    logger.debug('Skipping middleware for auth path', { pathname });
    return NextResponse.next();
  }

  if (
    // Only handle organization-specific routes
    pathname.startsWith('/api/organizations') ||
    pathname.startsWith('/dashboard/organizations')
  ) {
    try {
      logger.debug('Validating request for organization route', { pathname });
      // const session = await auth.api.getSession(req);
      const { data: session } = await betterFetch<Session>(
        '/api/auth/get-session',
        {
          baseURL: req.nextUrl.origin,
          headers: {
            //get the cookie from the request
            cookie: req.headers.get('cookie') || '',
          },
        }
      );

      if (!session?.user) {
        logger.debug('No valid session found', { pathname });
        return NextResponse.json(
          {
            message: 'Authentication required',
            code: ERROR_CODES.UNAUTHORIZED,
            status: 401,
          },
          { status: 401 }
        );
      }

      logger.debug('Valid session found', {
        pathname,
        userId: session.user.id,
        sessionId: session.id,
      });

      // For organization routes, add our custom context
      if (pathname.includes('/organizations/')) {
        const organizationSlug = pathname
          .split('/organizations/')[1]
          ?.split('/')[0];

        if (organizationSlug) {
          logger.debug('Adding organization context', {
            pathname,
            organizationSlug,
            userId: session.user.id,
            sessionId: session?.id,
            // set active organization id
            activeOrganizationId: session.activeOrganizationId,
          });

          // Add organization context headers
          const requestHeaders = new Headers(req.headers);
          requestHeaders.set('x-organization-slug', organizationSlug);
          // Add user context headers
          requestHeaders.set('x-user-id', session.user.id);
          if (session?.id) {
            // Add session tracking header for metrics
            requestHeaders.set('x-session-id', session.id);
          }

          if (session.activeOrganizationId) {
            // set active organization id
            requestHeaders.set(
              'x-active-organization-id',
              session.activeOrganizationId
            );
          }

          return NextResponse.next({
            request: {
              headers: requestHeaders,
            },
          });
        }
      }

      return NextResponse.next();
    } catch (error) {
      logger.error('Error in middleware', {
        pathname,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });

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

  logger.debug('Passing through middleware', { pathname });
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/organizations/:path*', '/dashboard/organizations/:path*'],
};
