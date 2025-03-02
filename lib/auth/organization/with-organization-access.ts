/**
 * @fileoverview Utility functions for organization access control in routes and components
 * This module provides a higher-order function to handle organization access checks consistently
 */

import { redirect } from 'next/navigation';
import { NextRequest, NextResponse } from 'next/server';

import { withOrganizationContext } from '@/lib/logger';

import { getOrganizationAccess } from './get-organization-access';

/**
 * Higher-order function for server components to handle organization access checks
 * @param slug The organization slug
 * @param handler The handler function to execute if access is granted
 * @param options Configuration options
 * @returns The result of the handler function or redirects if access is denied
 */
export async function withOrganizationAccess<T>(
  slug: string,
  handler: (session: any) => Promise<T>,
  options: {
    redirectToSignIn?: boolean;
    redirectToOrganizations?: boolean;
  } = {
    redirectToSignIn: true,
    redirectToOrganizations: true,
  }
): Promise<T> {
  const orgLogger = withOrganizationContext(slug);
  const { hasAccess, session } = await getOrganizationAccess(slug);

  // Handle no session
  if (!session && options.redirectToSignIn) {
    const redirectUrl = `/sign-in?callbackUrl=/organizations/${slug}`;
    orgLogger.debug('No session, redirecting to sign-in', { redirectUrl });
    redirect(redirectUrl);
  }

  // Handle no access
  if (!hasAccess && options.redirectToOrganizations) {
    orgLogger.debug('No access, redirecting to organizations', {
      userId: session?.user?.id,
    });
    redirect('/organizations');
  }

  // Execute handler if access is granted
  return handler(session);
}

/**
 * Higher-order function for API routes to handle organization access checks
 * @param request The Next.js request object
 * @param slug The organization slug
 * @param handler The handler function to execute if access is granted
 * @returns The result of the handler function or an error response if access is denied
 */
export async function withOrganizationApiAccess(
  request: NextRequest,
  slug: string,
  handler: (session: any) => Promise<Response>
): Promise<Response> {
  const orgLogger = withOrganizationContext(slug);
  const { hasAccess, session } = await getOrganizationAccess(slug);

  // Handle no session
  if (!session) {
    orgLogger.warn('Unauthenticated access attempt', {
      path: request.nextUrl.pathname,
      ip: request.headers.get('x-real-ip') || 'unknown',
    });

    return NextResponse.json(
      { message: 'Authentication required' },
      { status: 401 }
    );
  }

  // Handle no access
  if (!hasAccess) {
    orgLogger.warn('Unauthorized access attempt', {
      userId: session.user.id,
      path: request.nextUrl.pathname,
    });

    return NextResponse.json(
      { message: 'You do not have access to this organization' },
      { status: 403 }
    );
  }

  // Execute handler if access is granted
  orgLogger.info('Authorized access', { userId: session.user.id });
  return handler(session);
}
