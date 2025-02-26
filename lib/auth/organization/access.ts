/**
 * @fileoverview Utilities for organization access control
 * This module provides functions to check if a user has access to an organization
 */

import { and, eq } from 'drizzle-orm';

import { db } from '@/lib/db';
import { member, organization } from '@/lib/db/schema';
import { logger } from '@/lib/logger';

/**
 * Checks if a user has access to an organization
 * @param userId The user ID
 * @param orgSlug The organization slug
 * @returns True if the user has access, false otherwise
 */
export async function checkOrganizationAccess(
  userId: string,
  orgSlug: string
): Promise<boolean> {
  try {
    // Get the organization by slug
    const org = await db.query.organization.findFirst({
      where: eq(organization.slug, orgSlug),
    });

    if (!org) {
      logger.debug('Organization not found', { orgSlug });
      return false;
    }

    // Check if the user is a member of the organization
    const membership = await db.query.member.findFirst({
      where: and(eq(member.userId, userId), eq(member.organizationId, org.id)),
    });

    return !!membership;
  } catch (error) {
    logger.error('Error checking organization access', {
      userId,
      orgSlug,
      error,
    });
    return false;
  }
}
