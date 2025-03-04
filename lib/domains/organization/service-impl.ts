/**
 * Organization Domain Service Implementation
 *
 * This file implements the service interfaces for organization extensions.
 * It uses the repository interfaces to access data and implements the business logic.
 */

import { headers } from 'next/headers';
import { z } from 'zod';

import { organizationService as betterAuthOrganizationService } from '@/lib/better-auth/organization';
import {
  createOrganizationSchema,
  updateOrganizationSchema,
} from '@/lib/db/_schema/organization';
import { logger } from '@/lib/logger';

import {
  EnhancedOrganizationRepository,
  OrganizationActivityRepository,
  OrganizationExtensionsRepository,
  OrganizationMetricsRepository,
  OrganizationPermissionRepository,
  OrganizationWorkspaceRepository,
} from './repositories';
import {
  EnhancedOrganizationService,
  OrganizationActivityService,
  OrganizationExtensionsService,
  OrganizationMetricsService,
  OrganizationPermissionService,
  OrganizationService,
  OrganizationWorkspaceService,
} from './services';
import {
  CreateWorkspaceRequest,
  EnhancedOrganization,
  OrganizationActivity,
  OrganizationActivityType,
  OrganizationMetrics,
  OrganizationWorkspace,
  PERMISSION_LEVEL_TO_ACTIONS,
  PermissionLevel,
  ResourceType,
  UpdateWorkspaceRequest,
} from './types';

/**
 * Standardized error handling for organization services
 * @param error The error to handle
 * @param context The context in which the error occurred
 * @throws Always throws an error with a standardized message
 */
function handleServiceError(error: unknown, context: string): never {
  if (error instanceof z.ZodError) {
    logger.error(`Invalid ${context} data:`, {
      errors: error.errors,
    });
    throw new Error(`Invalid ${context} data`);
  }

  if (error instanceof Error && error.name === 'ZodError') {
    logger.error(`Invalid ${context} data:`, {
      error: error.message,
    });
    throw new Error(`Invalid ${context} data`);
  }

  logger.error(`Error in ${context}:`, {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  });
  throw new Error(`Failed to ${context}`);
}

/**
 * Implementation of the base OrganizationService
 */
export class OrganizationServiceImpl implements OrganizationService {
  constructor() {}

  private async getSessionHeaders(): Promise<Headers> {
    try {
      const headersList = await headers();
      const headersObj = new Headers();

      // Copy all headers
      for (const [key, value] of headersList.entries()) {
        headersObj.set(key, value);
      }

      return headersObj;
    } catch (error) {
      logger.error('Error getting session headers:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw new Error('Failed to get session headers');
    }
  }

  async list() {
    try {
      logger.debug('Listing organizations for current user');
      const headers = await this.getSessionHeaders();
      return await betterAuthOrganizationService.list();
    } catch (error) {
      handleServiceError(error, 'list organizations');
    }
  }

  async getBySlug(slug: string) {
    try {
      logger.debug(`Getting organization by slug: ${slug}`);
      const headers = await this.getSessionHeaders();
      return await betterAuthOrganizationService.getFullOrganization(slug);
    } catch (error) {
      handleServiceError(error, `get organization by slug ${slug}`);
    }
  }

  async create(data: {
    name: string;
    slug?: string;
    logo?: string;
    metadata?: Record<string, any>;
  }) {
    try {
      logger.debug('Creating new organization:', { name: data.name });

      // Validate input data
      const validatedData = createOrganizationSchema.parse(data);

      const headers = await this.getSessionHeaders();
      return await betterAuthOrganizationService.create(validatedData);
    } catch (error) {
      handleServiceError(error, 'organization');
    }
  }

  async update(data: {
    id: string;
    name?: string;
    slug?: string;
    logo?: string;
    metadata?: Record<string, any>;
  }) {
    try {
      logger.debug(`Updating organization: ${data.id}`);

      // Validate input data
      const validatedData = updateOrganizationSchema.parse(data);

      const headers = await this.getSessionHeaders();
      return await betterAuthOrganizationService.update(validatedData);
    } catch (error) {
      handleServiceError(error, 'organization update');
    }
  }

  async delete(id: string) {
    try {
      logger.debug(`Deleting organization: ${id}`);
      const headers = await this.getSessionHeaders();
      await betterAuthOrganizationService.delete(id);
    } catch (error) {
      handleServiceError(error, `delete organization ${id}`);
    }
  }

  async setActive(id: string) {
    try {
      logger.debug(`Setting active organization: ${id}`);
      const headers = await this.getSessionHeaders();
      await betterAuthOrganizationService.setActive(id);
    } catch (error) {
      handleServiceError(error, `set active organization ${id}`);
    }
  }
}

/**
 * Implementation of the OrganizationMetricsService
 */
export class OrganizationMetricsServiceImpl
  implements OrganizationMetricsService
{
  constructor(private repository: OrganizationMetricsRepository) {}

  async getMetrics(organizationId: string): Promise<OrganizationMetrics> {
    try {
      logger.debug(`Getting metrics for organization ${organizationId}`);
      return await this.repository.getMetrics(organizationId);
    } catch (error) {
      logger.error(
        `Error getting metrics for organization ${organizationId}: ${error}`
      );
      throw new Error(`Failed to get metrics: ${error}`);
    }
  }
}

/**
 * Implementation of the OrganizationActivityService
 */
export class OrganizationActivityServiceImpl
  implements OrganizationActivityService
{
  constructor(private repository: OrganizationActivityRepository) {}

  async getActivity(
    organizationId: string,
    limit?: number
  ): Promise<OrganizationActivity[]> {
    try {
      logger.debug(`Getting activity for organization ${organizationId}`);
      return await this.repository.getActivity(organizationId, limit);
    } catch (error) {
      logger.error(
        `Error getting activity for organization ${organizationId}: ${error}`
      );
      throw new Error(`Failed to get activity: ${error}`);
    }
  }

  async recordActivity(
    activity: Omit<OrganizationActivity, 'id' | 'createdAt'>
  ): Promise<OrganizationActivity> {
    try {
      logger.debug(
        `Recording activity for organization ${activity.organizationId}`
      );
      return await this.repository.createActivity(activity);
    } catch (error) {
      logger.error(
        `Error recording activity for organization ${activity.organizationId}: ${error}`
      );
      throw new Error(`Failed to record activity: ${error}`);
    }
  }
}

/**
 * Implementation of the OrganizationWorkspaceService
 */
export class OrganizationWorkspaceServiceImpl
  implements OrganizationWorkspaceService
{
  constructor(
    private repository: OrganizationWorkspaceRepository,
    private activityService: OrganizationActivityService
  ) {}

  async getWorkspaces(
    organizationId: string
  ): Promise<OrganizationWorkspace[]> {
    try {
      logger.debug(`Getting workspaces for organization ${organizationId}`);
      return await this.repository.getWorkspaces(organizationId);
    } catch (error) {
      logger.error(
        `Error getting workspaces for organization ${organizationId}: ${error}`
      );
      throw new Error(`Failed to get workspaces: ${error}`);
    }
  }

  async getWorkspace(workspaceId: string): Promise<OrganizationWorkspace> {
    try {
      logger.debug(`Getting workspace ${workspaceId}`);
      return await this.repository.getWorkspace(workspaceId);
    } catch (error) {
      logger.error(`Error getting workspace ${workspaceId}: ${error}`);
      throw new Error(`Failed to get workspace: ${error}`);
    }
  }

  async createWorkspace(
    data: CreateWorkspaceRequest
  ): Promise<OrganizationWorkspace> {
    try {
      logger.debug(
        `Creating workspace for organization ${data.organizationId}`
      );

      // Check if user has permission to create workspaces
      const hasPermission = await this.repository.checkActionPermission(
        data.createdBy,
        data.organizationId,
        ResourceType.ORGANIZATION,
        data.organizationId,
        'edit'
      );

      if (!hasPermission) {
        throw new Error('User does not have permission to create workspaces');
      }

      const workspace = await this.repository.createWorkspace(data);

      // Record activity
      await this.activityService.recordActivity({
        organizationId: data.organizationId,
        userId: data.createdBy,
        type: OrganizationActivityType.WORKSPACE_CREATED,
        details: {
          workspaceId: workspace.id,
          workspaceName: workspace.name,
        },
      });

      return workspace;
    } catch (error) {
      logger.error(
        `Error creating workspace for organization ${data.organizationId}: ${error}`
      );
      throw new Error(`Failed to create workspace: ${error}`);
    }
  }

  async updateWorkspace(
    data: UpdateWorkspaceRequest
  ): Promise<OrganizationWorkspace> {
    try {
      logger.debug(`Updating workspace ${data.id}`);

      // Get the workspace to check organization ID
      const workspace = await this.repository.getWorkspace(data.id);

      // Check if user has permission to update this workspace
      const hasPermission = await this.repository.checkActionPermission(
        data.updatedBy,
        workspace.organizationId,
        ResourceType.WORKSPACE,
        data.id,
        'edit'
      );

      if (!hasPermission) {
        throw new Error(
          'User does not have permission to update this workspace'
        );
      }

      const updatedWorkspace = await this.repository.updateWorkspace(data);

      // Record activity
      await this.activityService.recordActivity({
        organizationId: workspace.organizationId,
        userId: data.updatedBy,
        type: OrganizationActivityType.WORKSPACE_UPDATED,
        details: {
          workspaceId: updatedWorkspace.id,
          workspaceName: updatedWorkspace.name,
          changes: {
            name:
              data.name !== workspace.name
                ? {
                    from: workspace.name,
                    to: data.name,
                  }
                : undefined,
          },
        },
      });

      return updatedWorkspace;
    } catch (error) {
      logger.error(`Error updating workspace ${data.id}: ${error}`);
      throw new Error(`Failed to update workspace: ${error}`);
    }
  }

  async deleteWorkspace(workspaceId: string): Promise<void> {
    try {
      logger.debug(`Deleting workspace ${workspaceId}`);

      // Get the workspace to check organization ID and capture name for activity log
      const workspace = await this.repository.getWorkspace(workspaceId);

      // For delete, we require the 'delete' permission
      // Since we don't have the current user ID in this context, we'll use a system ID
      // In a real implementation, the current user ID should be passed to this method
      const currentUserId = workspace.updatedBy || 'system';

      const hasPermission = await this.repository.checkActionPermission(
        currentUserId,
        workspace.organizationId,
        ResourceType.WORKSPACE,
        workspaceId,
        'delete'
      );

      if (!hasPermission) {
        throw new Error(
          'User does not have permission to delete this workspace'
        );
      }

      await this.repository.deleteWorkspace(workspaceId);

      // Record activity
      await this.activityService.recordActivity({
        organizationId: workspace.organizationId,
        userId: currentUserId,
        type: OrganizationActivityType.WORKSPACE_DELETED,
        details: {
          workspaceId: workspace.id,
          workspaceName: workspace.name,
        },
      });
    } catch (error) {
      logger.error(`Error deleting workspace ${workspaceId}: ${error}`);
      throw new Error(`Failed to delete workspace: ${error}`);
    }
  }
}

/**
 * Implementation of the EnhancedOrganizationService
 */
export class EnhancedOrganizationServiceImpl
  implements EnhancedOrganizationService
{
  constructor(
    private repository: EnhancedOrganizationRepository,
    private metricsService: OrganizationMetricsService,
    private workspaceService: OrganizationWorkspaceService
  ) {}

  async getEnhancedOrganization(slug: string): Promise<EnhancedOrganization> {
    try {
      logger.debug(`Getting enhanced organization data for ${slug}`);

      // Get the base organization data
      const organization = await this.repository.getEnhancedOrganization(slug);

      try {
        // Get metrics
        const metrics = await this.metricsService.getMetrics(organization.id);

        // Get workspaces
        const workspaces = await this.workspaceService.getWorkspaces(
          organization.id
        );

        // Combine all data
        return {
          ...organization,
          metrics,
          workspaces,
        };
      } catch (extensionError) {
        // If extension data fails, still return the base organization
        logger.warn(
          `Error getting extension data for organization ${slug}: ${extensionError}`
        );
        return organization;
      }
    } catch (error) {
      logger.error(`Error getting enhanced organization for ${slug}: ${error}`);
      throw new Error(`Failed to get enhanced organization: ${error}`);
    }
  }
}

/**
 * Implementation of the OrganizationPermissionService
 * Uses Better-Auth's permission system for access control
 */
export class OrganizationPermissionServiceImpl
  implements OrganizationPermissionService
{
  constructor(private repository: OrganizationPermissionRepository) {}

  /**
   * Check if a user has the required permission level for a resource
   */
  async hasPermission(
    userId: string,
    organizationId: string,
    resourceType: ResourceType,
    resourceId: string,
    requiredLevel: PermissionLevel
  ): Promise<boolean> {
    try {
      logger.debug(
        `Checking if user ${userId} has ${requiredLevel} permission for ${resourceType}:${resourceId} in org ${organizationId}`
      );

      // Get the actions required for this permission level
      const requiredActions = PERMISSION_LEVEL_TO_ACTIONS[requiredLevel];

      // If no actions are required (NONE level), return true
      if (requiredActions.length === 0) {
        return true;
      }

      // Check if the user has all required actions
      return this.checkAllActions(
        userId,
        organizationId,
        resourceType,
        resourceId,
        requiredActions
      );
    } catch (error) {
      logger.error(
        `Error checking permission for user ${userId} on ${resourceType}:${resourceId}: ${error}`
      );
      return false;
    }
  }

  /**
   * Check if a user has permission to perform a specific action on a resource
   */
  async hasActionPermission(
    userId: string,
    organizationId: string,
    resourceType: ResourceType,
    resourceId: string,
    action: string
  ): Promise<boolean> {
    try {
      logger.debug(
        `Checking if user ${userId} can perform ${action} on ${resourceType}:${resourceId} in org ${organizationId}`
      );

      return await this.repository.checkActionPermission(
        userId,
        organizationId,
        resourceType,
        resourceId,
        action
      );
    } catch (error) {
      logger.error(
        `Error checking action permission for user ${userId} on ${resourceType}:${resourceId}: ${error}`
      );
      return false;
    }
  }

  /**
   * Get the permission level a user has for a resource
   */
  async getPermissionLevel(
    userId: string,
    organizationId: string,
    resourceType: ResourceType,
    resourceId: string
  ): Promise<PermissionLevel> {
    try {
      logger.debug(
        `Getting permission level for user ${userId} on ${resourceType}:${resourceId} in org ${organizationId}`
      );

      // Check each permission level from highest to lowest
      const levels = [
        PermissionLevel.OWNER,
        PermissionLevel.ADMIN,
        PermissionLevel.EDITOR,
        PermissionLevel.VIEWER,
      ];

      for (const level of levels) {
        const hasPermission = await this.hasPermission(
          userId,
          organizationId,
          resourceType,
          resourceId,
          level
        );

        if (hasPermission) {
          return level;
        }
      }

      // If no permission level matches, return NONE
      return PermissionLevel.NONE;
    } catch (error) {
      logger.error(
        `Error getting permission level for user ${userId} on ${resourceType}:${resourceId}: ${error}`
      );
      return PermissionLevel.NONE;
    }
  }

  /**
   * Helper method to check if a user has all required actions
   */
  private async checkAllActions(
    userId: string,
    organizationId: string,
    resourceType: ResourceType,
    resourceId: string,
    actions: string[]
  ): Promise<boolean> {
    for (const action of actions) {
      const hasPermission = await this.hasActionPermission(
        userId,
        organizationId,
        resourceType,
        resourceId,
        action
      );

      if (!hasPermission) {
        return false;
      }
    }

    return true;
  }
}

/**
 * Combined organization extensions service implementation
 */
export class OrganizationExtensionsServiceImpl
  implements OrganizationExtensionsService
{
  private metricsService: OrganizationMetricsService;
  private activityService: OrganizationActivityService;
  private workspaceService: OrganizationWorkspaceService;
  private enhancedOrganizationService: EnhancedOrganizationService;
  private permissionService: OrganizationPermissionService;

  // Method bindings
  getMetrics: (organizationId: string) => Promise<OrganizationMetrics>;
  getActivity: (
    organizationId: string,
    limit?: number
  ) => Promise<OrganizationActivity[]>;
  recordActivity: (
    activity: Omit<OrganizationActivity, 'id' | 'createdAt'>
  ) => Promise<OrganizationActivity>;
  getWorkspaces: (organizationId: string) => Promise<OrganizationWorkspace[]>;
  getWorkspace: (workspaceId: string) => Promise<OrganizationWorkspace>;
  createWorkspace: (
    data: CreateWorkspaceRequest
  ) => Promise<OrganizationWorkspace>;
  updateWorkspace: (
    data: UpdateWorkspaceRequest
  ) => Promise<OrganizationWorkspace>;
  deleteWorkspace: (workspaceId: string) => Promise<void>;
  getEnhancedOrganization: (slug: string) => Promise<EnhancedOrganization>;
  hasPermission: (
    userId: string,
    organizationId: string,
    resourceType: ResourceType,
    resourceId: string,
    requiredLevel: PermissionLevel
  ) => Promise<boolean>;
  hasActionPermission: (
    userId: string,
    organizationId: string,
    resourceType: ResourceType,
    resourceId: string,
    action: string
  ) => Promise<boolean>;
  getPermissionLevel: (
    userId: string,
    organizationId: string,
    resourceType: ResourceType,
    resourceId: string
  ) => Promise<PermissionLevel>;

  constructor(private repository: OrganizationExtensionsRepository) {
    // Initialize services in the correct order to avoid using them before initialization
    this.metricsService = new OrganizationMetricsServiceImpl(repository);
    this.activityService = new OrganizationActivityServiceImpl(repository);
    this.permissionService = new OrganizationPermissionServiceImpl(repository);

    // Services that depend on other services
    this.workspaceService = new OrganizationWorkspaceServiceImpl(
      repository,
      this.activityService
    );
    this.enhancedOrganizationService = new EnhancedOrganizationServiceImpl(
      repository,
      this.metricsService,
      this.workspaceService
    );

    // Bind methods after all services are initialized
    this.getMetrics = this.metricsService.getMetrics.bind(this.metricsService);
    this.getActivity = this.activityService.getActivity.bind(
      this.activityService
    );
    this.recordActivity = this.activityService.recordActivity.bind(
      this.activityService
    );
    this.getWorkspaces = this.workspaceService.getWorkspaces.bind(
      this.workspaceService
    );
    this.getWorkspace = this.workspaceService.getWorkspace.bind(
      this.workspaceService
    );
    this.createWorkspace = this.workspaceService.createWorkspace.bind(
      this.workspaceService
    );
    this.updateWorkspace = this.workspaceService.updateWorkspace.bind(
      this.workspaceService
    );
    this.deleteWorkspace = this.workspaceService.deleteWorkspace.bind(
      this.workspaceService
    );
    this.getEnhancedOrganization =
      this.enhancedOrganizationService.getEnhancedOrganization.bind(
        this.enhancedOrganizationService
      );
    this.hasPermission = this.permissionService.hasPermission.bind(
      this.permissionService
    );
    this.hasActionPermission = this.permissionService.hasActionPermission.bind(
      this.permissionService
    );
    this.getPermissionLevel = this.permissionService.getPermissionLevel.bind(
      this.permissionService
    );
  }
}
