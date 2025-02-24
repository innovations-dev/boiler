import { NextResponse, type NextRequest } from 'next/server';
import { betterFetch } from '@better-fetch/fetch';
import type { Session } from 'better-auth';

import { corecedSessionSelectSchema } from './lib/db/schemas';

export default async function authMiddleware(request: NextRequest) {
  try {
    const { data: session } = await betterFetch<Session>(
      '/api/auth/get-session',
      {
        baseURL: request.nextUrl.origin,
        headers: {
          //get the cookie from the request
          cookie: request.headers.get('cookie') || '',
        },
      }
    );

    console.log('🚀 ~ authMiddleware ~ session:', session);

    const parsedSession = corecedSessionSelectSchema.safeParse(session);
    console.log(
      '🚀 ~ authMiddleware ~ parsedSession:',
      parsedSession,
      parsedSession.data,
      parsedSession.error
    );
    if (!parsedSession.success) {
      console.log('Middleware: No session found, redirecting to sign-in');
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
  } catch (error) {
    console.error('Middleware: Error fetching session', error);
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }
}

export const config = {
  matcher: [
    // "/((?!api|_next/static|_next/image|favicon.ico).*)",
    '/dashboard',
    '/admin',
  ],
};
