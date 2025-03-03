// lib/auth/organization/get-organization-access.ts
/**
 * @fileoverview Utility for checking organization access
 * This module provides a function to check if a user has access to an organization
 * It uses Better-Auth for checking organization access, with a fallback to legacy database queries.
 */

import { headers } from 'next/headers';

import { auth } from '@/lib/auth';
import { organizationService } from '@/lib/better-auth/organization';
import { withOrganizationContext } from '@/lib/logger';

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

    // Check organization access using Better-Auth
    let hasAccess = false;
    try {
      // Get the organization by slug
      const organization =
        await organizationService.getFullOrganization(organizationSlug);

      // Check if the user is a member of the organization
      const isMember = organization.members.some(
        (member) => member.userId === session.user.id
      );

      hasAccess = isMember;

      orgLogger.debug('Better-Auth organization access check result', {
        hasAccess,
        userId: session.user.id,
        organizationId: organization.id,
        memberCount: organization.members.length,
      });
    } catch (betterAuthError) {
      orgLogger.error('Error checking organization access with Better-Auth', {
        error:
          betterAuthError instanceof Error
            ? betterAuthError.message
            : String(betterAuthError),
        stack:
          betterAuthError instanceof Error ? betterAuthError.stack : undefined,
        organizationSlug,
        userId: session.user.id,
        errorDetails: betterAuthError,
      });

      // Check if the error is an authentication error
      const isAuthError =
        (betterAuthError instanceof Error &&
          betterAuthError.message.includes('not authorized')) ||
        (betterAuthError as any)?.code === 'UNAUTHORIZED';

      if (isAuthError) {
        orgLogger.warn(
          'Authentication error with Better-Auth, user may need to re-authenticate',
          {
            userId: session.user.id,
            organizationSlug,
          }
        );
        return { hasAccess: false, session };
      }

      // Fall back to legacy access check if Better-Auth fails
      orgLogger.debug('Falling back to legacy access check', {
        organizationSlug,
        userId: session.user.id,
      });

      try {
        // Import the legacy access check function dynamically to avoid circular dependencies
        const { checkOrganizationAccess } = await import('./access');
        hasAccess = await checkOrganizationAccess(
          session.user.id,
          organizationSlug
        );

        orgLogger.debug('Legacy access check result', {
          hasAccess,
          userId: session.user.id,
          organizationSlug,
        });
      } catch (legacyError) {
        orgLogger.error('Legacy access check also failed', {
          error:
            legacyError instanceof Error
              ? legacyError.message
              : String(legacyError),
          stack: legacyError instanceof Error ? legacyError.stack : undefined,
          userId: session.user.id,
          organizationSlug,
        });

        // Default to no access if both checks fail
        hasAccess = false;
      }
    }

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
