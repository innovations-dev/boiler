import { NextRequest, NextResponse } from 'next/server';
import type { Session } from 'better-auth';

import { auth } from '@/lib/auth';
import { logger } from '@/lib/logger';

// Define a type for our custom session data

/**
 * API endpoint for debugging session state
 * This provides detailed information about the current session
 */
export async function GET(req: NextRequest) {
  try {
    // Get all cookies for debugging
    const allCookies = req.cookies.getAll();
    const sessionCookie = allCookies.find((cookie) =>
      cookie.name.startsWith('better-auth.session_token')
    );

    // Get raw cookie header
    const cookieHeader = req.headers.get('cookie');

    // Log request information
    logger.info('Debug session request received', {
      component: 'DebugSessionAPI',
      hasSessionCookie: !!sessionCookie,
      cookieName: sessionCookie?.name || 'none',
      hasCookieHeader: !!cookieHeader,
      allCookies: allCookies.map((c) => c.name),
    });

    // Collect errors for debugging
    const errors: string[] = [];

    // Result object
    const result = {
      timestamp: new Date().toISOString(),
      cookieLength: sessionCookie ? sessionCookie.value.length : 0,
      hasCookieHeader: !!cookieHeader,
      cookieHeaderLength: cookieHeader ? cookieHeader.length : 0,
      allCookies: allCookies.map((c) => c.name),
      serverValidation: {
        success: false,
        error: null as string | null,
        data: null as any,
      },
      apiSession: {
        success: false,
        error: null as string | null,
        data: null as any,
      },
      errors,
    };

    // Method 1: Try to validate session using authClient
    try {
      if (sessionCookie) {
        logger.info('Attempting to validate session with authClient', {
          component: 'DebugSessionAPI',
          cookieName: sessionCookie.name,
        });

        // Create a mock request with the session cookie
        const mockHeaders = new Headers();
        mockHeaders.set(
          'Cookie',
          `${sessionCookie.name}=${sessionCookie.value}`
        );

        const mockRequest = new Request('http://localhost', {
          headers: mockHeaders,
        });

        // Validate the session
        const session = await auth.api.getSession({
          headers: mockHeaders,
        });

        if (session) {
          result.serverValidation.success = true;
          result.serverValidation.data = {
            userId: session.user?.id,
            email: session.user?.email,
            sessionId: session.session?.id,
            expiresAt: session.session?.expiresAt,
          };

          logger.info('Session validated successfully with authClient', {
            component: 'DebugSessionAPI',
            userId: session.user?.id,
          });
        } else {
          result.serverValidation.success = false;
          result.serverValidation.error = 'Session validation returned null';
          errors.push('Session validation returned null');

          logger.info('Session validation returned null', {
            component: 'DebugSessionAPI',
          });
        }
      } else {
        result.serverValidation.error = 'No session cookie found';
        errors.push('No session cookie found');

        logger.info('No session cookie found for validation', {
          component: 'DebugSessionAPI',
        });
      }
    } catch (error) {
      result.serverValidation.success = false;
      result.serverValidation.error =
        error instanceof Error ? error.message : String(error);
      errors.push(`Server validation error: ${result.serverValidation.error}`);

      logger.error(
        'Error validating session with authClient',
        {
          component: 'DebugSessionAPI',
          error: error instanceof Error ? error.message : String(error),
        },
        error
      );
    }

    // Method 2: Try to get session using auth.api.getSession
    try {
      if (sessionCookie) {
        logger.info('Attempting to get session with auth.api', {
          component: 'DebugSessionAPI',
          cookieName: sessionCookie.name,
        });

        const headers = new Headers();
        headers.set('Cookie', `${sessionCookie.name}=${sessionCookie.value}`);

        // @ts-ignore - Better-Auth types are not up to date
        const session = await auth.api.getSession({ headers });

        if (session?.user) {
          result.apiSession.success = true;
          result.apiSession.data = {
            userId: session.user.id,
            email: session.user.email,
            sessionId: session.session?.id,
            expiresAt: session.session?.expiresAt,
            activeOrganizationId: session.session?.activeOrganizationId,
          };

          logger.info('Session retrieved successfully with auth.api', {
            component: 'DebugSessionAPI',
            userId: session.user.id,
          });
        } else {
          result.apiSession.success = false;
          result.apiSession.error = 'Session returned null or has no user';
          errors.push('API session returned null or has no user');

          logger.info('Session returned null or has no user', {
            component: 'DebugSessionAPI',
            sessionKeys: session ? Object.keys(session) : [],
          });
        }
      } else {
        result.apiSession.error = 'No session cookie found';
        errors.push('No session cookie found for API session');

        logger.info('No session cookie found for API session', {
          component: 'DebugSessionAPI',
        });
      }
    } catch (error) {
      result.apiSession.success = false;
      result.apiSession.error =
        error instanceof Error ? error.message : String(error);
      errors.push(`API session error: ${result.apiSession.error}`);

      logger.error(
        'Error getting session with auth.api',
        {
          component: 'DebugSessionAPI',
          error: error instanceof Error ? error.message : String(error),
        },
        error
      );
    }

    // Try fallback with raw cookie header if both methods failed
    if (
      !result.serverValidation.success &&
      !result.apiSession.success &&
      cookieHeader
    ) {
      try {
        logger.info('Attempting fallback with raw cookie header', {
          component: 'DebugSessionAPI',
        });

        const rawHeaders = new Headers();
        rawHeaders.set('Cookie', cookieHeader);

        // @ts-ignore - Better-Auth types are not up to date
        const rawSession = await auth.api.getSession({ headers: rawHeaders });

        if (rawSession?.user) {
          result.apiSession.success = true;
          result.apiSession.data = {
            userId: rawSession.user.id,
            email: rawSession.user.email,
            sessionId: rawSession.session?.id,
            expiresAt: rawSession.session?.expiresAt,
            activeOrganizationId: rawSession.activeOrganizationId,
            note: 'Retrieved using raw cookie header fallback',
          };

          logger.info('Fallback session validation successful', {
            component: 'DebugSessionAPI',
            userId: rawSession.user.id,
          });

          errors.push(
            'Session validation succeeded only with raw cookie header fallback'
          );
        }
      } catch (fallbackError) {
        logger.debug('Fallback session validation failed', {
          component: 'DebugSessionAPI',
          error:
            fallbackError instanceof Error
              ? fallbackError.message
              : String(fallbackError),
        });

        errors.push('Fallback validation also failed');
      }
    }

    // Return the result
    return NextResponse.json(result);
  } catch (error) {
    logger.error(
      'Debug session API error',
      {
        component: 'DebugSessionAPI',
        error: error instanceof Error ? error.message : String(error),
      },
      error
    );

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
