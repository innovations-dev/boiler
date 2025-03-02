import { NextRequest, NextResponse } from 'next/server';

import { validateSession } from '@/lib/auth/session';
import { DbOrganizationExtensionsRepository } from '@/lib/domains/organization/repository-impl';
import { OrganizationExtensionsServiceImpl } from '@/lib/domains/organization/service-impl';
import {
  OrganizationActivityType,
  PermissionLevel,
  ResourceType,
} from '@/lib/domains/organization/types';
import { logger } from '@/lib/logger';

export async function GET(
  request: NextRequest,
  {
    params,
  }: { params: Promise<{ organizationId: string; workspaceId: string }> }
) {
  let resolvedParams: { organizationId: string; workspaceId: string } = {
    organizationId: '',
    workspaceId: '',
  };

  try {
    // Get the session using the validateSession helper
    const session = await validateSession(request);

    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    resolvedParams = await params;
    const { organizationId, workspaceId } = resolvedParams;

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

    // Get the workspace
    const workspace = await service.getWorkspace(workspaceId);

    // Verify the workspace belongs to the organization
    if (workspace.organizationId !== organizationId) {
      return NextResponse.json(
        { error: 'Workspace not found in this organization' },
        { status: 404 }
      );
    }

    return NextResponse.json(workspace);
  } catch (error) {
    logger.error('Error fetching workspace', {
      error: error instanceof Error ? error.message : String(error),
      params: resolvedParams,
    });

    return NextResponse.json(
      { error: 'Failed to fetch workspace' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  {
    params,
  }: { params: Promise<{ organizationId: string; workspaceId: string }> }
) {
  let resolvedParams: { organizationId: string; workspaceId: string } = {
    organizationId: '',
    workspaceId: '',
  };

  try {
    // Get the session using the validateSession helper
    const session = await validateSession(request);

    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    resolvedParams = await params;
    const { organizationId, workspaceId } = resolvedParams;

    // Parse the request body
    const body = await request.json();

    // Initialize the repository and service
    const repository = new DbOrganizationExtensionsRepository();
    const service = new OrganizationExtensionsServiceImpl(repository);

    // Check if user has permission to update organization workspaces
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

    // Get the workspace to verify it belongs to the organization
    const existingWorkspace = await service.getWorkspace(workspaceId);

    if (existingWorkspace.organizationId !== organizationId) {
      return NextResponse.json(
        { error: 'Workspace not found in this organization' },
        { status: 404 }
      );
    }

    // Update the workspace
    const updatedWorkspace = await service.updateWorkspace({
      id: workspaceId,
      name: body.name,
      organizationId,
      updatedBy: session.user.id,
    });

    return NextResponse.json(updatedWorkspace);
  } catch (error) {
    logger.error('Error updating workspace', {
      error: error instanceof Error ? error.message : String(error),
      params: resolvedParams,
    });

    return NextResponse.json(
      { error: 'Failed to update workspace' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  {
    params,
  }: { params: Promise<{ organizationId: string; workspaceId: string }> }
) {
  let resolvedParams: { organizationId: string; workspaceId: string } = {
    organizationId: '',
    workspaceId: '',
  };

  try {
    // Get the session using the validateSession helper
    const session = await validateSession(request);

    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    resolvedParams = await params;
    const { organizationId, workspaceId } = resolvedParams;

    // Initialize the repository and service
    const repository = new DbOrganizationExtensionsRepository();
    const service = new OrganizationExtensionsServiceImpl(repository);

    // Check if user has permission to delete organization workspaces
    const hasPermission = await service.hasPermission(
      session.user.id,
      organizationId,
      ResourceType.ORGANIZATION,
      organizationId,
      PermissionLevel.ADMIN
    );

    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get the workspace to verify it belongs to the organization
    const existingWorkspace = await service.getWorkspace(workspaceId);

    if (existingWorkspace.organizationId !== organizationId) {
      return NextResponse.json(
        { error: 'Workspace not found in this organization' },
        { status: 404 }
      );
    }

    // Delete the workspace
    await service.deleteWorkspace(workspaceId);

    // Record the activity
    await service.recordActivity({
      organizationId,
      userId: session.user.id,
      type: OrganizationActivityType.WORKSPACE_DELETED,
      details: {
        workspaceName: existingWorkspace.name,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error deleting workspace', {
      error: error instanceof Error ? error.message : String(error),
      params: resolvedParams,
    });

    return NextResponse.json(
      { error: 'Failed to delete workspace' },
      { status: 500 }
    );
  }
}
