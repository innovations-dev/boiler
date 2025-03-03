import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { validateSession } from '@/lib/auth/session';
import { DbOrganizationExtensionsRepository } from '@/lib/domains/organization/repository-impl';
import { OrganizationExtensionsServiceImpl } from '@/lib/domains/organization/service-impl';
import {
  PermissionLevel,
  ResourceType,
} from '@/lib/domains/organization/types';
import { logger } from '@/lib/logger';

// Define cache revalidation time (2 minutes)
export const revalidate = 120;

export async function GET(
  request: NextRequest,
  { params }: { params: { organizationId: string } }
) {
  try {
    // Get the session using the validateSession helper
    const session = await validateSession(request);

    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { organizationId } = params;

    // Initialize the repository and service
    const repository = new DbOrganizationExtensionsRepository();
    const service = new OrganizationExtensionsServiceImpl(repository);

    // Check if user has permission to view organization metrics
    const hasPermission = await service.hasPermission(
      session.user.id,
      organizationId,
      ResourceType.ORGANIZATION,
      organizationId,
      PermissionLevel.VIEWER
    );

    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get the metrics
    const metrics = await service.getMetrics(organizationId);

    // Return the response with cache headers
    return NextResponse.json(metrics, {
      headers: {
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    logger.error('Error fetching organization metrics', {
      error: error instanceof Error ? error.message : String(error),
      params,
    });

    return NextResponse.json(
      { error: 'Failed to fetch organization metrics' },
      { status: 500 }
    );
  }
}
