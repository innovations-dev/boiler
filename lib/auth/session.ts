import { type NextRequest } from 'next/server';
import { betterFetch } from '@better-fetch/fetch';

import { AppError } from '@/lib/errors';
import { ERROR_CODES } from '@/lib/types/responses/error';

export interface Session {
  user: {
    id: string;
    email: string;
  };
  sessionId?: string; // Optional as it might not always be available from Better-Auth
}

export async function validateSession(req: NextRequest): Promise<Session> {
  try {
    const { data: session } = await betterFetch<Session>(
      '/api/auth/get-session',
      {
        baseURL: req.nextUrl.origin,
        headers: {
          cookie: req.headers.get('cookie') || '',
        },
      }
    );

    if (!session?.user) {
      throw new AppError('Invalid session', {
        code: ERROR_CODES.UNAUTHORIZED,
        status: 401,
      });
    }

    return session;
  } catch (error) {
    throw new AppError('Failed to validate session', {
      code: ERROR_CODES.UNAUTHORIZED,
      status: 401,
      cause: error,
    });
  }
}
