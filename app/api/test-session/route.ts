import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { validateSession } from '@/lib/auth/session';
import { logger } from '@/lib/logger';

/**
 * API route to test session creation and validation
 * This endpoint will check for an existing session and validate it
 */
export async function GET(req: NextRequest) {
  try {
    // Check for existing session
    const allCookies = req.cookies.getAll();
    const sessionCookie = allCookies.find((cookie) =>
      cookie.name.startsWith('better-auth.session_token')
    );

    // Try to validate the request using the proper server-side method
    let validSession = null;
    let validationError = null;

    try {
      validSession = await validateSession(req);
    } catch (error) {
      validationError = error;
      logger.error(
        'Session validation error',
        {
          component: 'TestSessionAPI',
          path: req.nextUrl.pathname,
        },
        error
      );
    }

    // Return session information
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      request: {
        path: req.nextUrl.pathname,
        method: req.method,
        cookies: {
          all: allCookies.map((c) => c.name),
          hasSessionCookie: !!sessionCookie,
          sessionCookieName: sessionCookie?.name || null,
        },
      },
      session: {
        valid: !!validSession,
        error: validationError
          ? validationError instanceof Error
            ? validationError.message
            : String(validationError)
          : null,
        data: validSession
          ? {
              // Don't expose sensitive data
              hasUser: true,
              userId: validSession.user?.id,
              email: validSession.user?.email,
            }
          : null,
      },
    });
  } catch (error) {
    logger.error(
      'Test session API error',
      {
        component: 'TestSessionAPI',
        path: req.nextUrl.pathname,
      },
      error
    );

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
