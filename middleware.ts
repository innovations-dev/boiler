import { NextResponse, type NextRequest } from 'next/server';
import { betterFetch } from '@better-fetch/fetch';
import type { Session } from 'better-auth';

import { auditLogger } from './lib/audit';
import { corecedSessionSelectSchema } from './lib/db/_schema';
import { handleUnknownError } from './lib/errors';
import { logger } from './lib/logger';

/**
 * Middleware for handling authentication, logging, and error handling
 */
export default async function middleware(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  try {
    // Log incoming request
    logger.info('Incoming request', {
      component: 'Middleware',
      method: request.method,
      path: request.nextUrl.pathname,
      requestId,
      userAgent: request.headers.get('user-agent'),
      referer: request.headers.get('referer'),
    });

    // Attempt to get session
    const { data: session } = await betterFetch<Session>(
      '/api/auth/get-session',
      {
        baseURL: request.nextUrl.origin,
        headers: {
          cookie: request.headers.get('cookie') || '',
        },
      }
    );

    const parsedSession = corecedSessionSelectSchema.safeParse(session);

    if (!parsedSession.success) {
      logger.warn('Invalid session', {
        component: 'Middleware',
        requestId,
        error: parsedSession.error,
      });

      // Create audit log for failed authentication
      auditLogger.logAuth('user.login', {
        status: 'failure',
        requestId,
        path: request.nextUrl.pathname,
        errorType: 'INVALID_SESSION',
      });

      return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    // Log successful authentication
    auditLogger.logAuth('user.login', {
      status: 'success',
      requestId,
      userId: parsedSession.data.userId,
      path: request.nextUrl.pathname,
    });

    const response = NextResponse.next();

    // Add request ID to response headers for tracing
    response.headers.set('X-Request-ID', requestId);

    return response;
  } catch (error) {
    const appError = handleUnknownError(error);

    // Log error
    logger.error(
      'Middleware error',
      {
        component: 'Middleware',
        requestId,
        path: request.nextUrl.pathname,
        errorCode: appError.code,
        errorStatus: appError.status,
      },
      appError
    );

    // Create audit log for error
    auditLogger.logAuth(
      'user.login',
      {
        status: 'failure',
        requestId,
        path: request.nextUrl.pathname,
        errorType: appError.code,
        errorMessage: appError.message,
      },
      appError
    );

    return NextResponse.redirect(new URL('/sign-in', request.url));
  } finally {
    // Log request completion
    const duration = Date.now() - startTime;
    logger.info('Request completed', {
      component: 'Middleware',
      requestId,
      duration,
      path: request.nextUrl.pathname,
    });
  }
}

export const config = {
  matcher: [
    // "/((?!api|_next/static|_next/image|favicon.ico).*)",
    '/dashboard',
    '/admin',
  ],
};
