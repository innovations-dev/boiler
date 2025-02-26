import { type NextRequest } from 'next/server';

import { authClient } from '@/lib/auth/client';
import { AppError } from '@/lib/errors';

export interface Session {
  user: {
    id: string;
    email: string;
  };
  sessionId?: string; // Optional as it might not always be available from Better-Auth
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
    // @ts-ignore - Better-Auth types are not up to date
    const session = await authClient.validateRequest(req);

    if (!session?.user) {
      return null;
    }

    return {
      user: {
        id: session.user.id,
        email: session.user.email,
      },
      sessionId: session.sessionId,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    return null;
  }
}
