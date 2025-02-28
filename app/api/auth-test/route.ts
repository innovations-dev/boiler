import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { authClient } from '@/lib/auth/client';
import { logger } from '@/lib/logger';

/**
 * API endpoint to test all available auth methods
 * This is useful for debugging session issues
 */
export async function GET(req: NextRequest) {
  const results: Record<string, any> = {
    timestamp: new Date().toISOString(),
    methods: {},
    cookies: {},
    headers: {},
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

    // Test 1: validateRequest
    try {
      results.methods.validateRequest = { status: 'pending' };
      // @ts-ignore - Better-Auth types are not up to date
      const validationResult = await authClient.validateRequest(req);
      results.methods.validateRequest = {
        status: 'success',
        hasSession: !!validationResult,
        userId: validationResult?.user?.id || null,
        sessionId: validationResult?.session?.id || null,
      };
    } catch (error) {
      results.methods.validateRequest = {
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
      };
    }

    // Test 2: getSession
    try {
      results.methods.getSession = { status: 'pending' };

      // Create headers object from request
      const headersObj = new Headers();
      req.headers.forEach((value, key) => {
        headersObj.set(key, value);
      });

      // @ts-ignore - Better-Auth types are not up to date
      const sessionResult = await auth.api.getSession({
        headers: headersObj,
        query: {
          disableCookieCache: true,
        },
      });

      results.methods.getSession = {
        status: 'success',
        hasSession: !!sessionResult,
        userId: sessionResult?.user?.id || null,
        sessionId: sessionResult?.session?.id || null,
      };
    } catch (error) {
      results.methods.getSession = {
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
      };
    }

    // Test 3: listSessions (if available)
    try {
      results.methods.listSessions = { status: 'pending' };

      // @ts-ignore - Better-Auth types are not up to date
      if (typeof auth.api.listSessions === 'function') {
        // Create headers object from request
        const headersObj = new Headers();
        req.headers.forEach((value, key) => {
          headersObj.set(key, value);
        });

        // @ts-ignore - Better-Auth types are not up to date
        const sessionsResult = await auth.api.listSessions({
          headers: headersObj,
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

        results.methods.listSessions = {
          status: 'success',
          available: true,
          count: Array.isArray(sessionsResult) ? sessionsResult.length : 0,
          hasActiveSessions: Array.isArray(sessionsResult)
            ? sessionsResult.some((s) => !!(s as SessionWithActive).isActive)
            : false,
          sessions: Array.isArray(sessionsResult)
            ? sessionsResult.map((s) => ({
                id: s.id,
                isActive: !!(s as SessionWithActive).isActive,
                createdAt: s.createdAt,
                expiresAt: s.expiresAt,
              }))
            : [],
        };
      } else {
        results.methods.listSessions = {
          status: 'skipped',
          available: false,
          reason: 'Method not available',
        };
      }
    } catch (error) {
      results.methods.listSessions = {
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
      };
    }

    // Test 4: validateSession from our custom utility
    try {
      results.methods.validateSession = { status: 'pending' };

      // Use Better-Auth's native getSession method directly
      // @ts-ignore - Better-Auth types are not up to date
      const validationResult = await auth.api.getSession({
        headers: req.headers,
        query: {
          disableCookieCache: true,
        },
      });

      results.methods.validateSession = {
        status: 'success',
        hasSession: !!validationResult?.user,
        userId: validationResult?.user?.id || null,
        email: validationResult?.user?.email || null,
        sessionId: validationResult?.session?.id || null,
      };
    } catch (error) {
      results.methods.validateSession = {
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
      };
    }

    // Log the results for server-side debugging
    logger.info('Auth test results', {
      component: 'AuthTest',
      path: req.nextUrl.pathname,
      results,
    });

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    logger.error(
      'Error in auth test endpoint',
      {
        component: 'AuthTest',
        path: req.nextUrl.pathname,
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
