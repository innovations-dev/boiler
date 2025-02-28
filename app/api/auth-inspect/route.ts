import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { logger } from '@/lib/logger';

/**
 * API route to inspect the Better-Auth session structure
 * This endpoint provides detailed information about the session
 */
export async function GET(req: NextRequest) {
  try {
    // Check for session cookie
    const allCookies = req.cookies.getAll();
    const sessionCookie = allCookies.find((cookie) =>
      cookie.name.startsWith('better-auth.session_token')
    );

    // Log all cookies for debugging
    logger.info('Auth inspect request received', {
      component: 'AuthInspectAPI',
      allCookies: allCookies.map((c) => c.name),
      hasSessionCookie: !!sessionCookie,
      cookieName: sessionCookie?.name || 'none',
    });

    // Even if no session cookie is found, we'll return information about the cookies
    // instead of returning a 401 error
    if (!sessionCookie) {
      return NextResponse.json(
        {
          error: 'No session cookie found',
          cookies: {
            all: allCookies.map((c) => c.name),
            count: allCookies.length,
          },
          message:
            'You are not currently logged in. Please sign in to see session details.',
        },
        { status: 200 }
      ); // Return 200 instead of 401 to make debugging easier
    }

    // Create headers with the session cookie
    const headers = new Headers();
    headers.set('Cookie', `${sessionCookie.name}=${sessionCookie.value}`);

    // Get the session
    let session;
    try {
      logger.info('Attempting to validate session', {
        component: 'AuthInspectAPI',
        cookieName: sessionCookie.name,
      });

      session = await auth.api.getSession({ headers });

      logger.info('Session validation result', {
        component: 'AuthInspectAPI',
        success: !!session,
        hasUser: !!session?.user,
        hasSessionObject: !!session?.session,
      });
    } catch (error) {
      // Log the error but continue to return useful information
      logger.error(
        'Session validation error',
        {
          component: 'AuthInspectAPI',
          cookieName: sessionCookie.name,
          error: error instanceof Error ? error.message : String(error),
        },
        error
      );

      // Return information about the cookie even though validation failed
      return NextResponse.json(
        {
          error: 'Session validation failed',
          errorDetails: error instanceof Error ? error.message : String(error),
          cookie: {
            name: sessionCookie.name,
            length: sessionCookie.value.length,
          },
          message:
            'Your session cookie exists but could not be validated. It may be expired or invalid.',
        },
        { status: 200 }
      ); // Return 200 instead of 401 to make debugging easier
    }

    // If session is null but no error was thrown
    if (!session) {
      return NextResponse.json(
        {
          error: 'Session is null',
          cookie: {
            name: sessionCookie.name,
            length: sessionCookie.value.length,
          },
          message:
            'Your session cookie exists but returned a null session. It may be expired.',
        },
        { status: 200 }
      ); // Return 200 instead of 401 to make debugging easier
    }

    // Log the session structure for debugging
    logger.info('Session structure', {
      component: 'AuthInspectAPI',
      topLevelKeys: Object.keys(session),
      hasUser: !!session.user,
      hasSession: !!session.session,
      userKeys: session.user ? Object.keys(session.user) : [],
      sessionObjectKeys: session.session ? Object.keys(session.session) : [],
    });

    // Return detailed session information
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      cookie: {
        name: sessionCookie.name,
        length: sessionCookie.value.length,
      },
      session: {
        // Include all session properties except sensitive data
        structure: {
          topLevelKeys: Object.keys(session),
          userKeys: session.user ? Object.keys(session.user) : [],
          sessionKeys: session.session ? Object.keys(session.session) : [],
        },
        user: session.user
          ? {
              id: session.user.id,
              email: session.user.email,
              // Include other non-sensitive user properties
              ...Object.entries(session.user)
                .filter(([key]) => !['id', 'email', 'password'].includes(key))
                .reduce(
                  (obj, [key, value]) => {
                    obj[key] = value;
                    return obj;
                  },
                  {} as Record<string, any>
                ),
            }
          : null,
        sessionInfo: session.session
          ? {
              id: session.session.id,
              expiresAt: session.session.expiresAt,
              // Include other non-sensitive session properties
              ...Object.entries(session.session)
                .filter(([key]) => !['id', 'expiresAt', 'token'].includes(key))
                .reduce(
                  (obj, [key, value]) => {
                    obj[key] = value;
                    return obj;
                  },
                  {} as Record<string, any>
                ),
            }
          : null,
        // Include other top-level properties that might be useful
        ...Object.entries(session)
          .filter(([key]) => !['user', 'session'].includes(key))
          .reduce(
            (obj, [key, value]) => {
              obj[key] = value;
              return obj;
            },
            {} as Record<string, any>
          ),
      },
    });
  } catch (error) {
    logger.error(
      'Auth inspect API error',
      {
        component: 'AuthInspectAPI',
        path: req.nextUrl.pathname,
      },
      error
    );

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : String(error),
        message: 'An unexpected error occurred while inspecting the session.',
      },
      { status: 500 }
    );
  }
}
