/**
 * Session debugging utility
 * This file provides functions to debug and test the session handling flow
 */

import { cookies, headers } from 'next/headers';
import { NextRequest } from 'next/server';

import { auth } from '@/lib/auth';
import { authClient } from '@/lib/auth/client';
import { logger } from '@/lib/logger';

// Define a type for our custom session data
interface CustomSessionData {
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
    [key: string]: any;
  };
  user: {
    id: string;
    email: string;
    [key: string]: any;
  };
  activeOrganizationId?: string | null;
  [key: string]: any;
}

// Define cookie type
interface Cookie {
  name: string;
  value: string;
  expires?: string;
  [key: string]: any;
}

interface DebugSessionInfo {
  hasSession: boolean;
  hasSessionCookie: boolean;
  sessionId?: string;
  userId?: string;
  email?: string;
  expiresAt?: string | Date;
  error?: string;
}

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

/**
 * Debug session information using Better-Auth's native methods
 * This function is meant to be used in server components
 */
export async function debugSession() {
  const results: Record<string, any> = {
    timestamp: new Date().toISOString(),
    cookies: {},
    headers: {},
    session: null,
    error: null,
  };

  try {
    // Get headers for session validation
    const headersList = await headers();
    const headersObj = new Headers();

    // Log relevant headers
    const relevantHeaders = [
      'cookie',
      'authorization',
      'x-session-id',
      'x-user-id',
    ];

    for (const header of relevantHeaders) {
      const value = headersList.get(header);
      results.headers[header] = value ? 'present' : 'missing';
      if (value) headersObj.set(header, value);
    }

    // Get session using Better-Auth's native method
    // @ts-ignore - Better-Auth types are not up to date
    const session = await auth.api.getSession({
      headers: headersObj,
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
        // @ts-ignore - Better-Auth types don't include activeOrganizationId but it may exist at runtime
        activeOrganizationId: session.activeOrganizationId || null,
        hasUser: true,
        hasSession: true,
      };

      // Log success
      logger.info('Session retrieved successfully', {
        component: 'SessionDebug',
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
        component: 'SessionDebug',
        headers: results.headers,
      });
    }

    // Try to get multi-session info if available
    try {
      // @ts-ignore - Better-Auth types are not up to date
      if (typeof auth.api.listSessions === 'function') {
        // @ts-ignore - Better-Auth types are not up to date
        const sessions = await auth.api.listSessions({
          headers: headersObj,
        });

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

    return results;
  } catch (error) {
    logger.error(
      'Error in debug session',
      {
        component: 'SessionDebug',
      },
      error
    );

    return {
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
      headers: results.headers,
    };
  }
}

/**
 * Get cookie information from request headers
 * This function is meant to be used in server components
 */
export async function getDebugCookieInfo() {
  try {
    const headersList = await headers();
    const cookieHeader = headersList.get('cookie');

    if (!cookieHeader) {
      return {
        count: 0,
        names: [],
        hasSessionCookie: false,
        raw: null,
      };
    }

    const cookies = cookieHeader.split(';').map((c: string) => c.trim());
    const cookieNames = cookies.map((c: string) => c.split('=')[0]);

    return {
      count: cookies.length,
      names: cookieNames,
      hasSessionCookie: cookieNames.some((name: string) =>
        name.startsWith('better-auth.session_token')
      ),
      raw:
        cookieHeader.length > 100
          ? `${cookieHeader.substring(0, 100)}...`
          : cookieHeader,
    };
  } catch (error) {
    logger.error(
      'Error getting cookie info',
      {
        component: 'SessionDebug',
      },
      error
    );

    return {
      count: 0,
      names: [],
      hasSessionCookie: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Debug utility to log session information to the console
 * This is useful for server-side debugging
 */
export function logSessionDebug(
  info: Record<string, any>,
  prefix = 'SESSION_DEBUG'
) {
  const timestamp = new Date().toISOString();
  console.log(`[${prefix}][${timestamp}]`, JSON.stringify(info, null, 2));
}

/**
 * Debug the current session state
 * Call this from a server component or server action to inspect the session
 */
export async function debugSessionState() {
  try {
    // Get the current session from the auth instance
    // @ts-ignore - Better-Auth types are not up to date
    const sessionData = (await auth.api.getSession()) as CustomSessionData;

    // Log session details
    logger.info('Session debug info', {
      component: 'SessionDebug',
      hasSession: !!sessionData,
      sessionId: sessionData?.session?.id || 'none',
      userId: sessionData?.session?.userId || 'none',
      expiresAt: sessionData?.session?.expiresAt
        ? new Date(sessionData.session.expiresAt).toISOString()
        : 'none',
      // Custom session data
      activeOrganizationId: sessionData?.activeOrganizationId || 'none',
    });

    // Check all cookies to find session cookie
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll() as Cookie[];

    // Look for Better-Auth session cookie - it uses a dynamic name pattern
    const sessionCookie = allCookies.find((cookie: Cookie) =>
      cookie.name.startsWith('better-auth.session_token')
    );

    logger.info('Cookie debug info', {
      component: 'SessionDebug',
      allCookieNames: allCookies.map((c: Cookie) => c.name),
      hasCookie: !!sessionCookie,
      cookieName: sessionCookie?.name || 'none',
      cookieValue: sessionCookie ? '***redacted***' : 'none',
      cookieExpires: sessionCookie?.expires || 'none',
    });

    return {
      hasSession: !!sessionData,
      hasSessionCookie: !!sessionCookie,
      sessionId: sessionData?.session?.id || null,
      allCookies: allCookies.map((c: Cookie) => c.name),
    };
  } catch (error) {
    logger.error(
      'Error debugging session',
      {
        component: 'SessionDebug',
      },
      error
    );

    return {
      hasSession: false,
      hasSessionCookie: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Debug a request's session
 * Use this in middleware or API routes to inspect the session from a request
 */
export async function debugRequestSession(req: NextRequest) {
  try {
    // Check for session cookie - log all cookies to find the right one
    const allCookies = req.cookies.getAll();

    // Look for Better-Auth session cookie - it uses a dynamic name pattern
    const sessionCookie = allCookies.find((cookie) =>
      cookie.name.startsWith('better-auth.session_token')
    );

    // Try to validate the request
    let validSession = null;
    let validationError = null;

    try {
      // @ts-ignore - Better-Auth types are not up to date
      validSession = (await authClient.validateRequest(
        req
      )) as CustomSessionData;
    } catch (error) {
      validationError = error;
    }

    logger.info('Request session debug info', {
      component: 'SessionDebug',
      path: req.nextUrl.pathname,
      allCookieNames: allCookies.map((c) => c.name),
      hasCookie: !!sessionCookie,
      cookieName: sessionCookie?.name || 'none',
      cookieValue: sessionCookie ? '***redacted***' : 'none',
      validSession: !!validSession,
      validationError: validationError
        ? validationError instanceof Error
          ? validationError.message
          : String(validationError)
        : null,
    });

    return {
      hasCookie: !!sessionCookie,
      validSession: !!validSession,
      sessionData: validSession,
      allCookies: allCookies.map((c) => c.name),
    };
  } catch (error) {
    logger.error(
      'Error debugging request session',
      {
        component: 'SessionDebug',
        path: req.nextUrl.pathname,
      },
      error
    );

    return {
      hasCookie: false,
      validSession: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
