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
    logger.debug('Checking organization access', { userId, orgSlug });

    // Get the organization by slug
    logger.debug('Querying organization by slug', { orgSlug });
    const org = await db.query.organization.findFirst({
      where: eq(organization.slug, orgSlug),
    });

    if (!org) {
      logger.debug('Organization not found', { orgSlug });
      return false;
    }

    logger.debug('Organization found', {
      orgId: org.id,
      orgName: org.name,
      orgSlug: org.slug,
    });

    // Check if the user is a member of the organization
    logger.debug('Checking user membership', { userId, orgId: org.id });
    const membership = await db.query.member.findFirst({
      where: and(eq(member.userId, userId), eq(member.organizationId, org.id)),
    });

    logger.debug('Membership check result', {
      hasMembership: !!membership,
      role: membership?.role,
      userId,
      orgId: org.id,
    });

    return !!membership;
  } catch (error) {
    logger.error('Error checking organization access', {
      userId,
      orgSlug,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      query: 'organization.findFirst and member.findFirst',
    });

    // Log the organization and member tables for debugging
    try {
      logger.debug('Attempting to query all organizations for debugging');
      const allOrgs = await db.query.organization.findMany({
        limit: 5,
      });
      logger.debug('Organizations in database', {
        count: allOrgs.length,
        samples: allOrgs.map((o) => ({ id: o.id, slug: o.slug })),
      });
    } catch (dbError) {
      logger.error('Error querying organizations for debugging', {
        error: dbError instanceof Error ? dbError.message : String(dbError),
      });
    }

    return false;
  }
}
