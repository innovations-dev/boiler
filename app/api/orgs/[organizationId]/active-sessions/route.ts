import { NextRequest } from 'next/server';
import { and, eq, gt, sql } from 'drizzle-orm';

import { db } from '@/lib/db';
import { member, organization, session } from '@/lib/db/schema';
import { AppError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { ERROR_CODES } from '@/lib/types/responses/error';

// 1 minute cache time for active sessions
const ACTIVE_SESSIONS_CACHE_TIME = 60 * 1000;
const sessionsCache = new Map<string, { data: any; timestamp: number }>();

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ organizationId: string }> }
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
    const { organizationId } = resolvedParams;

    // Get organization and validate access
    const org = await db.query.organization.findFirst({
      where: eq(organization.id, organizationId),
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
    const cacheKey = `active-sessions:${organization.id}`;
    const cached = sessionsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < ACTIVE_SESSIONS_CACHE_TIME) {
      return Response.json(cached.data);
    }

    // Get active sessions data efficiently
    const [metrics] = await db
      .select({
        activeSessions: sql<number>`count(distinct ${session.id})`,
        lastActivityAt: sql<string>`max(${session.updatedAt})`,
      })
      .from(session)
      .where(
        and(
          eq(session.activeOrganizationId, organization.id),
          gt(session.expiresAt, new Date())
        )
      );

    const result = {
      activeSessions: metrics?.activeSessions ?? 0,
      lastActivityAt: metrics?.lastActivityAt ?? new Date().toISOString(),
    };

    // Cache the results
    sessionsCache.set(cacheKey, {
      data: result,
      timestamp: Date.now(),
    });

    // Track metrics access for analytics
    if (sessionId) {
      logger.info('Active sessions accessed', {
        type: 'active_sessions_accessed',
        organizationId: organization.id,
        userId,
        sessionId,
        memberRole: organization.members[0].role,
      });
    }

    return Response.json(result);
  } catch (error) {
    // Get organizationId from params for error logging, handling the Promise
    let organizationId = 'unknown';
    try {
      const resolvedParams = await params;
      organizationId = resolvedParams.organizationId;
    } catch (paramsError) {
      logger.error('Error resolving params', { error: paramsError });
    }

    logger.error('Error fetching active sessions', {
      error,
      organizationId,
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
