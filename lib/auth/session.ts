/**
 * @fileoverview Session validation and management for Next.js
 *
 * This module provides utilities for validating and managing user sessions
 * in Next.js applications using Better-Auth.
 */

import { headers } from 'next/headers';
import { type NextRequest } from 'next/server';

import { auth } from '@/lib/auth';
import { logger } from '@/lib/logger';

export interface Session {
  user: {
    id: string;
    email: string;
  };
  sessionId?: string; // Optional as it might not always be available from Better-Auth
}

// Define a type for device sessions
interface DeviceSession {
  id: string;
  userId: string;
  isActive?: boolean;
  [key: string]: any;
}

/**
 * Get headers from the request for authentication
 *
 * @param req The Next.js request object
 * @param sessionCookie The session cookie if available
 * @returns Headers object with authentication information
 */
function getAuthHeadersFromRequest(
  req: NextRequest,
  sessionCookie?: { name: string; value: string }
): Headers {
  const headersList = new Headers();

  // Copy all headers from the request
  req.headers.forEach((value, key) => {
    headersList.set(key, value);
  });

  // Ensure the cookie header is set correctly
  if (!headersList.has('cookie') && sessionCookie) {
    headersList.set('Cookie', `${sessionCookie.name}=${sessionCookie.value}`);
  }

  return headersList;
}

/**
 * Validates the session from the request
 * @param req The Next.js request object
 * @returns The session if valid, null otherwise
 */
export async function validateSession(
  req: NextRequest
): Promise<Session | null> {
  const { pathname } = req.nextUrl;

  // Skip validation for auth verification routes
  if (
    pathname.startsWith('/api/auth/verify') ||
    pathname.startsWith('/api/auth/callback') ||
    pathname.startsWith('/api/auth/magic-link') ||
    // Also skip validation for the magic link verification route
    pathname.includes('magic-link/verify')
  ) {
    return null;
  }

  try {
    // Check if there's a session cookie (just for logging purposes)
    const allCookies = req.cookies.getAll();
    const sessionCookie = allCookies.find((cookie) =>
      cookie.name.startsWith('better-auth.session_token')
    );

    if (!sessionCookie) {
      logger.debug('No session cookie found', {
        component: 'SessionValidation',
        path: pathname,
        allCookies: allCookies.map((c) => c.name),
      });
      return null;
    }

    logger.debug('Found session cookie', {
      component: 'SessionValidation',
      path: pathname,
      cookieName: sessionCookie.name,
      cookieValueLength: sessionCookie.value.length,
    });

    // Following Better-Auth's recommended approach for session validation
    try {
      logger.debug('Validating session with auth.api.getSession', {
        component: 'SessionValidation',
        path: pathname,
      });

      // Get headers from the request
      const headersList = getAuthHeadersFromRequest(req, sessionCookie);

      // Use auth.api.getSession as recommended in the documentation
      const session = await auth.api.getSession({
        headers: headersList,
        // Disable cookie cache to ensure we're getting the latest session data
        query: {
          disableCookieCache: true,
        },
      });

      if (session?.user) {
        logger.debug('Session validated successfully', {
          component: 'SessionValidation',
          path: pathname,
          userId: session.user.id,
        });

        return {
          user: {
            id: session.user.id,
            email: session.user.email,
          },
          sessionId: session.session?.id,
        };
      } else {
        logger.debug('Session validation failed - no user in session', {
          component: 'SessionValidation',
          path: pathname,
          sessionKeys: session ? Object.keys(session) : [],
        });
      }
    } catch (error) {
      logger.error(
        'Error validating session',
        {
          component: 'SessionValidation',
          path: pathname,
          error: error instanceof Error ? error.message : String(error),
        },
        error
      );

      // If we get here, try one more approach - use the multi-session API if available
      try {
        logger.debug('Trying multi-session API', {
          component: 'SessionValidation',
          path: pathname,
        });

        // Check if listSessions method exists (for multi-session support)
        // @ts-ignore - Better-Auth types are not up to date
        if (typeof auth.api.listSessions === 'function') {
          // @ts-ignore - Better-Auth types are not up to date
          const sessions = await auth.api.listSessions({
            headers: req.headers,
          });

          if (sessions && Array.isArray(sessions) && sessions.length > 0) {
            // Find the active session
            const activeSession = sessions.find(
              (session: DeviceSession) => session.isActive
            );

            if (activeSession) {
              logger.debug('Found active multi-session', {
                component: 'SessionValidation',
                path: pathname,
                sessionId: activeSession.id,
              });

              // Get user information - we need to make a separate call to get user details
              try {
                // @ts-ignore - Better-Auth types are not up to date
                const userInfo = await auth.api.getUser({
                  headers: req.headers,
                });

                if (userInfo) {
                  return {
                    user: {
                      id: userInfo.id,
                      email: userInfo.email || 'unknown',
                    },
                    sessionId: activeSession.id,
                  };
                }
              } catch (userError) {
                logger.debug('Failed to get user info', {
                  component: 'SessionValidation',
                  path: pathname,
                  error:
                    userError instanceof Error
                      ? userError.message
                      : String(userError),
                });

                // Fallback to just using the session ID
                return {
                  user: {
                    id: activeSession.userId,
                    email: 'unknown@example.com', // We don't have the email
                  },
                  sessionId: activeSession.id,
                };
              }
            }
          }
        }
      } catch (multiSessionError) {
        logger.debug('Multi-session approach failed', {
          component: 'SessionValidation',
          path: pathname,
          error:
            multiSessionError instanceof Error
              ? multiSessionError.message
              : String(multiSessionError),
        });
      }
    }

    return null;
  } catch (error) {
    logger.error(
      'Session validation error',
      {
        path: req.nextUrl.pathname,
        error: error instanceof Error ? error.message : String(error),
      },
      error
    );
    return null;
  }
}
