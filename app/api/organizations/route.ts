import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { and, eq, inArray } from 'drizzle-orm';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { member, organization } from '@/lib/db/schema';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    // Get the current session
    const headersList = headers();
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the user's organizations directly from the database
    const memberships = await db
      .select()
      .from(member)
      .where(eq(member.userId, session.user.id));

    // If no memberships, return empty array
    if (memberships.length === 0) {
      return NextResponse.json([]);
    }

    // Get all organizations the user is a member of
    const orgIds = memberships.map((m) => m.organizationId);
    const orgs = await db
      .select()
      .from(organization)
      .where(
        orgIds.length === 1
          ? eq(organization.id, orgIds[0])
          : inArray(organization.id, orgIds)
      );

    // Combine with role information
    const result = orgs.map((org) => {
      const membership = memberships.find((m) => m.organizationId === org.id);
      return {
        ...org,
        role: membership?.role || 'MEMBER',
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    logger.error('Error fetching organizations', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      { error: 'Failed to fetch organizations' },
      { status: 500 }
    );
  }
}
