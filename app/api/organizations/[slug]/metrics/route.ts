import { NextRequest } from 'next/server';
import { and, eq, gt, sql } from 'drizzle-orm';

import { db } from '@/lib/db';
import { invitation, member, organization, session } from '@/lib/db/schema';
import { AppError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { organizationMetricsSchema } from '@/lib/types/organization';
import { ERROR_CODES } from '@/lib/types/responses/error';

// 5 minutes cache time for metrics
const METRICS_CACHE_TIME = 5 * 60 * 1000;
const metricsCache = new Map<string, { data: any; timestamp: number }>();

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const userId = req.headers.get('x-user-id');
    const sessionId = req.headers.get('x-session-id');

    if (!userId) {
      throw new AppError('User ID not found in request', {
        code: ERROR_CODES.UNAUTHORIZED,
        status: 401,
      });
    }

    // Get organization and validate access
    const org = await db.query.organization.findFirst({
      where: eq(organization.slug, slug!),
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

    // Check cache first
    const cacheKey = `metrics:${org.id}`;
    const cached = metricsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < METRICS_CACHE_TIME) {
      return Response.json(cached.data);
    }

    // Get metrics data efficiently with a single query
    const [metrics] = await db
      .select({
        totalMembers: sql<number>`count(distinct ${member.id})`,
        activeSessions: sql<number>`count(distinct ${session.id})`,
        pendingInvitations: sql<number>`count(distinct case when ${invitation.status} = 'pending' then ${invitation.id} end)`,
        lastActivityAt: sql<string>`max(${session.updatedAt})`,
      })
      .from(member)
      .leftJoin(
        session,
        and(
          eq(session.activeOrganizationId, member.organizationId),
          gt(session.expiresAt, new Date())
        )
      )
      .leftJoin(
        invitation,
        and(
          eq(invitation.organizationId, member.organizationId),
          eq(invitation.status, 'pending')
        )
      )
      .where(eq(member.organizationId, org.id))
      .groupBy(member.organizationId);

    const result = {
      totalMembers: metrics?.totalMembers ?? 0,
      activeSessions: metrics?.activeSessions ?? 0,
      pendingInvitations: metrics?.pendingInvitations ?? 0,
      lastActivityAt: metrics?.lastActivityAt
        ? new Date(metrics.lastActivityAt)
        : new Date(),
      lastUpdated: new Date(),
    };

    // Cache the results
    metricsCache.set(cacheKey, {
      data: result,
      timestamp: Date.now(),
    });

    // Track metrics access for analytics
    if (sessionId) {
      logger.info('Organization metrics accessed', {
        type: 'organization_metrics_accessed',
        organizationId: org.id,
        userId,
        sessionId,
        memberRole: org.members[0].role,
      });
    }

    return Response.json(organizationMetricsSchema.parse(result));
  } catch (error) {
    logger.error('Error fetching organization metrics', {
      error,
    });

    if (error instanceof AppError) {
      return Response.json(
        { message: error.message, code: error.code },
        { status: error.status }
      );
    }
    throw error;
  }
}
