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
  { params }: { params: Promise<{ organizationId: string }> }
) {
  let resolvedParams: { organizationId: string } = { organizationId: '' };

  try {
    // Get the session using the validateSession helper
    const session = await validateSession(request);

    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    resolvedParams = await params;
    const { organizationId } = resolvedParams;

    // Initialize the repository and service
    const repository = new DbOrganizationExtensionsRepository();
    const service = new OrganizationExtensionsServiceImpl(repository);

    // Check if user has permission to view organization workspaces
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

    // Get the workspaces
    const workspaces = await service.getWorkspaces(organizationId);

    return NextResponse.json(workspaces);
  } catch (error) {
    logger.error('Error fetching organization workspaces', {
      error: error instanceof Error ? error.message : String(error),
      params: resolvedParams,
    });

    return NextResponse.json(
      { error: 'Failed to fetch organization workspaces' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  let resolvedParams: { organizationId: string } = { organizationId: '' };

  try {
    // Get the session using the validateSession helper
    const session = await validateSession(request);

    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    resolvedParams = await params;
    const { organizationId } = resolvedParams;

    // Parse the request body
    const body = await request.json();

    // Initialize the repository and service
    const repository = new DbOrganizationExtensionsRepository();
    const service = new OrganizationExtensionsServiceImpl(repository);

    // Check if user has permission to create organization workspaces
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

    // Create the workspace
    const workspace = await service.createWorkspace({
      organizationId,
      name: body.name,
      createdBy: session.user.id,
    });

    return NextResponse.json(workspace);
  } catch (error) {
    logger.error('Error creating organization workspace', {
      error: error instanceof Error ? error.message : String(error),
      params: resolvedParams,
    });

    return NextResponse.json(
      { error: 'Failed to create organization workspace' },
      { status: 500 }
    );
  }
}
