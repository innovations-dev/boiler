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
    orgLogger.debug('Checking organization access');

    // Get session from cookies
    const session = await auth.api.getSession({ headers: await headers() });

    orgLogger.debug('getOrganizationAccess ~ session:', { session });

    if (!session?.user) {
      orgLogger.debug('No valid session for organization access check');
      return { hasAccess: false, session: null };
    }

    orgLogger.debug('Session found, checking organization membership', {
      userId: session.user.id,
    });

    // Check organization access
    const hasAccess = await checkOrganizationAccess(
      session.user.id,
      organizationSlug
    );

    if (hasAccess) {
      orgLogger.debug('User has access to organization', {
        userId: session.user.id,
      });
    } else {
      orgLogger.debug('User does not have access to organization', {
        userId: session.user.id,
      });
    }

    return { hasAccess, session } as const;
  } catch (error) {
    orgLogger.error('Error checking organization access', {
      error,
    });
    return { hasAccess: false, session: null };
  }
}
