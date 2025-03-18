import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { logger } from '@/lib/logger';

/**
 * API endpoint to debug Better-Auth sessions
 * Uses only native Better-Auth methods
 */
export async function GET(req: NextRequest) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const results: Record<string, any> = {
    timestamp: new Date().toISOString(),
    cookies: {},
    headers: {},
    session: null,
    error: null,
  };

  try {
    // Log all cookies for debugging
    const allCookies = req.cookies.getAll();
    results.cookies = {
      count: allCookies.length,
      names: allCookies.map((c) => c.name),
      hasSessionCookie: allCookies.some((c) =>
        c.name.startsWith('better-auth.session_token')
      ),
    };

    // Log relevant headers
    const relevantHeaders = [
      'cookie',
      'authorization',
      'x-session-id',
      'x-user-id',
    ];

    relevantHeaders.forEach((header) => {
      results.headers[header] = req.headers.get(header) ? 'present' : 'missing';
    });

    // Get session using Better-Auth's native method
    const session = await auth.api.getSession({
      headers: req.headers,
      query: {
        disableCookieCache: true,
      },
    });

    if (session?.user) {
      results.session = {
        userId: session.user.id,
        email: session.user.email,
        sessionId: session.session?.id,
        expiresAt: session.session?.expiresAt,
        activeOrganizationId: session.activeOrganizationId || null,
        hasUser: true,
        hasSession: true,
      };

      // Log success
      logger.info('Session retrieved successfully', {
        component: 'AuthDebug',
        userId: session.user.id,
        sessionId: session.session?.id,
      });
    } else {
      results.session = {
        hasUser: false,
        hasSession: false,
      };

      // Log failure
      logger.info('No session found', {
        component: 'AuthDebug',
        cookies: results.cookies,
      });
    }

    // Try to get multi-session info if available
    try {
      if (typeof auth.api.listSessions === 'function') {
        const sessions = await auth.api.listSessions({
          headers: req.headers,
        });

        // Define an interface for the session with isActive property
        interface SessionWithActive {
          id: string;
          createdAt: Date;
          updatedAt: Date;
          userId: string;
          expiresAt: Date;
          token: string;
          ipAddress?: string | null;
          userAgent?: string | null;
          isActive?: boolean;
        }

        if (sessions && Array.isArray(sessions)) {
          results.multiSession = {
            count: sessions.length,
            sessions: sessions.map((s) => ({
              id: s.id,
              isActive: !!(s as SessionWithActive).isActive,
              createdAt: s.createdAt,
              expiresAt: s.expiresAt,
              userId: s.userId,
            })),
          };
        }
      }
    } catch (multiSessionError) {
      results.multiSessionError =
        multiSessionError instanceof Error
          ? multiSessionError.message
          : String(multiSessionError);
    }

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    logger.error(
      'Error in auth debug endpoint',
      {
        component: 'AuthDebug',
        path: req.nextUrl.pathname,
      },
      error
    );

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
        cookies: results.cookies,
        headers: results.headers,
      },
      { status: 500 }
    );
  }
}
