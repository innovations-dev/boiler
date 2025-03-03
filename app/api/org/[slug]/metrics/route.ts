import { NextRequest, NextResponse } from 'next/server';
import { and, eq, sql } from 'drizzle-orm';

import { getOrganizationAccess } from '@/lib/auth/organization/get-organization-access';
import { db } from '@/lib/db';
import { organizationMetricsSchema } from '@/lib/db/_schema/organization';
import {
  invitation,
  member,
  organization,
  session as sessionTable,
} from '@/lib/db/schema';
import { AppError } from '@/lib/errors';
import { logger, withOrganizationContext } from '@/lib/logger';
import { ERROR_CODES } from '@/lib/types/responses/error';

// Define cache configuration
export const dynamic = 'force-dynamic'; // Or use 'auto' if you want Next.js to decide
export const revalidate = 300; // 5 minutes (300 seconds) cache time

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const userId = req.headers.get('x-user-id');
    const sessionId = req.headers.get('x-session-id');

    if (!userId) {
      throw new AppError('User ID not found in request', {
        code: ERROR_CODES.UNAUTHORIZED,
        status: 401,
      });
    }

    // Await params before using its properties
    const resolvedParams = await params;
    const { slug } = resolvedParams;

    const orgLogger = withOrganizationContext(slug);

    orgLogger.debug('Fetching organization metrics');

    const { hasAccess, session } = await getOrganizationAccess(slug);

    if (!session) {
      orgLogger.warn('Unauthenticated metrics access attempt');
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!hasAccess) {
      orgLogger.warn('Unauthorized metrics access attempt', {
        userId: session.user.id,
      });
      return NextResponse.json(
        { message: 'You do not have access to this organization' },
        { status: 403 }
      );
    }

    const org = await db.query.organization.findFirst({
      where: eq(organization.slug, slug),
      with: {
        members: {
          where: eq(member.userId, userId),
        },
      },
    });

    if (!org) {
      throw new AppError('Organization not found', {
        code: ERROR_CODES.NOT_FOUND,
        status: 404,
      });
    }

    if (!org.members.length) {
      throw new AppError('Not a member of this organization', {
        code: ERROR_CODES.FORBIDDEN,
        status: 403,
      });
    }

    const metrics = {
      totalMembers: 0,
      activeSessions: 0,
      pendingInvitations: 0,
      lastActivityAt: new Date(),
      lastUpdated: new Date(),
    };

    const [memberCount, invitationCount, sessionData] = await Promise.all([
      db
        .select({ count: sql<number>`count(*)` })
        .from(member)
        .where(eq(member.organizationId, org.id)),

      db
        .select({ count: sql<number>`count(*)` })
        .from(invitation)
        .where(
          and(
            eq(invitation.organizationId, org.id),
            eq(invitation.status, 'pending')
          )
        ),

      db
        .select({
          count: sql<number>`count(*)`,
          lastActivity: sql<string>`max(${sessionTable.updatedAt})`,
        })
        .from(sessionTable)
        .where(
          and(
            eq(sessionTable.activeOrganizationId, org.id),
            sql`${sessionTable.expiresAt} > datetime('now')`
          )
        )
        .catch((error) => {
          orgLogger.error('Error fetching session data', {}, error);
          return [{ count: 0, lastActivity: null }];
        }),
    ]);

    metrics.totalMembers = memberCount[0]?.count || 0;
    metrics.pendingInvitations = invitationCount[0]?.count || 0;
    metrics.activeSessions = sessionData[0]?.count || 0;
    metrics.lastActivityAt = sessionData[0]?.lastActivity
      ? new Date(sessionData[0].lastActivity)
      : new Date();

    const result = {
      ...metrics,
      lastUpdated: new Date(),
    };

    if (sessionId) {
      logger.info('Organization metrics accessed', {
        type: 'organization_metrics_accessed',
        organizationId: org.id,
        userId,
        sessionId,
        memberRole: org.members[0].role,
      });
    }

    orgLogger.info('Metrics accessed successfully', {
      userId: session.user.id,
    });

    return Response.json(organizationMetricsSchema.parse(result));
  } catch (error) {
    // Get slug from params for error logging, handling the Promise
    let slug = 'unknown';
    try {
      const resolvedParams = await params;
      slug = resolvedParams.slug;
    } catch (paramsError) {
      logger.error('Error resolving params', { error: paramsError });
    }

    logger.error('Error fetching organization metrics', {
      error,
      slug,
    });

    if (error instanceof AppError) {
      return Response.json(
        { message: error.message, code: error.code },
        { status: error.status }
      );
    }
    return Response.json(
      { message: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}
