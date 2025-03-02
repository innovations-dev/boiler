// lib/auth/organization/get-organization-access.ts
import { headers } from 'next/headers';

import { auth } from '@/lib/auth';
import { withOrganizationContext } from '@/lib/logger';

import { checkOrganizationAccess } from './access';

/**
 * Get organization access for a user
 * @param organizationSlug The slug of the organization to check access for
 * @returns True if the user has access, false otherwise
 *
 * @example
 * const { hasAccess, session } = await getOrganizationAccess('my-org');
 * if (hasAccess) {
 *   console.log('User has access to organization');
 * } else {
 *   console.log('User does not have access to organization');
 * }
 *
 * @throws {AppError} If the user is not authenticated
 * @throws {AppError} If the organization is not found
 * @throws {AppError} If the user is not a member of the organization
 *
 */

export async function getOrganizationAccess(organizationSlug: string) {
  const orgLogger = withOrganizationContext(organizationSlug);

  try {
    orgLogger.debug('Starting organization access check', {
      organizationSlug,
      timestamp: new Date().toISOString(),
    });

    // Get session from cookies
    const headersList = await headers();
    orgLogger.debug('Headers received for access check', {
      headerKeys: Array.from(headersList.keys()),
      hasCookie: headersList.has('cookie'),
    });

    const session = await auth.api.getSession({ headers: headersList });

    orgLogger.debug('getOrganizationAccess ~ session result:', {
      hasSession: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
    });

    if (!session?.user) {
      orgLogger.debug('No valid session for organization access check', {
        organizationSlug,
      });
      return { hasAccess: false, session: null };
    }

    orgLogger.debug('Session found, checking organization membership', {
      userId: session.user.id,
      organizationSlug,
    });

    // Check organization access
    const hasAccess = await checkOrganizationAccess(
      session.user.id,
      organizationSlug
    );

    if (hasAccess) {
      orgLogger.debug('User has access to organization', {
        userId: session.user.id,
        organizationSlug,
      });
    } else {
      orgLogger.debug('User does not have access to organization', {
        userId: session.user.id,
        organizationSlug,
      });
    }

    return { hasAccess, session } as const;
  } catch (error) {
    orgLogger.error('Error checking organization access', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      organizationSlug,
    });
    return { hasAccess: false, session: null };
  }
}
