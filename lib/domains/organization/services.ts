/**
 * Organization Domain Services
 *
 * This file defines the service interfaces for organization extensions.
 * These interfaces define the contract for interacting with organization data
 * independent of the specific implementation.
 */

import {
  CreateWorkspaceRequest,
  EnhancedOrganization,
  OrganizationActivity,
  OrganizationMetrics,
  OrganizationWorkspace,
  PermissionLevel,
  ResourceType,
  UpdateWorkspaceRequest,
} from './types';

/**
 * Organization metrics service interface
 */
export interface OrganizationMetricsService {
  /**
   * Get metrics for an organization
   * @param organizationId The ID of the organization
   */
  getMetrics(organizationId: string): Promise<OrganizationMetrics>;
}

/**
 * Organization activity service interface
 */
export interface OrganizationActivityService {
  /**
   * Get activity for an organization
   * @param organizationId The ID of the organization
   * @param limit The maximum number of activities to return
   */
  getActivity(
    organizationId: string,
    limit?: number
  ): Promise<OrganizationActivity[]>;

  /**
   * Record a new activity for an organization
   * @param activity The activity to record
   */
  recordActivity(
    activity: Omit<OrganizationActivity, 'id' | 'createdAt'>
  ): Promise<OrganizationActivity>;
}

/**
 * Organization workspace service interface
 */
export interface OrganizationWorkspaceService {
  /**
   * Get workspaces for an organization
   * @param organizationId The ID of the organization
   */
  getWorkspaces(organizationId: string): Promise<OrganizationWorkspace[]>;

  /**
   * Get a workspace by ID
   * @param workspaceId The ID of the workspace
   */
  getWorkspace(workspaceId: string): Promise<OrganizationWorkspace>;

  /**
   * Create a new workspace
   * @param data The workspace data
   */
  createWorkspace(data: CreateWorkspaceRequest): Promise<OrganizationWorkspace>;

  /**
   * Update a workspace
   * @param data The workspace update data
   */
  updateWorkspace(data: UpdateWorkspaceRequest): Promise<OrganizationWorkspace>;

  /**
   * Delete a workspace
   * @param workspaceId The ID of the workspace to delete
   */
  deleteWorkspace(workspaceId: string): Promise<void>;
}

/**
 * Enhanced organization service interface
 */
export interface EnhancedOrganizationService {
  /**
   * Get enhanced organization data
   * @param slug The organization slug
   */
  getEnhancedOrganization(slug: string): Promise<EnhancedOrganization>;
}

/**
 * Service for checking organization permissions
 */
export interface OrganizationPermissionService {
  /**
   * Check if a user has the required permission level for a resource
   */
  hasPermission(
    userId: string,
    organizationId: string,
    resourceType: ResourceType,
    resourceId: string,
    requiredLevel: PermissionLevel
  ): Promise<boolean>;

  /**
   * Check if a user has permission to perform a specific action on a resource
   */
  hasActionPermission(
    userId: string,
    organizationId: string,
    resourceType: ResourceType,
    resourceId: string,
    action: string
  ): Promise<boolean>;

  /**
   * Get the permission level a user has for a resource
   */
  getPermissionLevel(
    userId: string,
    organizationId: string,
    resourceType: ResourceType,
    resourceId: string
  ): Promise<PermissionLevel>;
}

/**
 * Combined organization extensions service interface
 */
export interface OrganizationExtensionsService
  extends OrganizationMetricsService,
    OrganizationActivityService,
    OrganizationWorkspaceService,
    EnhancedOrganizationService,
    OrganizationPermissionService {}
