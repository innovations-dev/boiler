import { NextRequest, NextResponse } from 'next/server';

import { validateSession } from '@/lib/auth/session';
import { DbOrganizationExtensionsRepository } from '@/lib/domains/organization/repository-impl';
import { OrganizationExtensionsServiceImpl } from '@/lib/domains/organization/service-impl';
import {
  PermissionLevel,
  ResourceType,
} from '@/lib/domains/organization/types';
import { logger } from '@/lib/logger';

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

    // Get the limit parameter from the query string
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit')
      ? parseInt(searchParams.get('limit')!, 10)
      : undefined;

    // Initialize the repository and service
    const repository = new DbOrganizationExtensionsRepository();
    const service = new OrganizationExtensionsServiceImpl(repository);

    // Check if user has permission to view organization activity
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

    // Get the activity
    const activity = await service.getActivity(organizationId, limit);

    return NextResponse.json(activity);
  } catch (error) {
    logger.error('Error fetching organization activity', {
      error: error instanceof Error ? error.message : String(error),
      params,
    });

    return NextResponse.json(
      { error: 'Failed to fetch organization activity' },
      { status: 500 }
    );
  }
}

export async function POST(
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

    // Parse the request body
    const body = await request.json();

    // Initialize the repository and service
    const repository = new DbOrganizationExtensionsRepository();
    const service = new OrganizationExtensionsServiceImpl(repository);

    // Check if user has permission to record organization activity
    const hasPermission = await service.hasPermission(
      session.user.id,
      organizationId,
      ResourceType.ORGANIZATION,
      organizationId,
      PermissionLevel.EDITOR
    );

    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Record the activity
    const activity = await service.recordActivity({
      organizationId,
      userId: session.user.id,
      type: body.type,
      details: body.details || {},
    });

    return NextResponse.json(activity);
  } catch (error) {
    logger.error('Error recording organization activity', {
      error: error instanceof Error ? error.message : String(error),
      params,
    });

    return NextResponse.json(
      { error: 'Failed to record organization activity' },
      { status: 500 }
    );
  }
}
