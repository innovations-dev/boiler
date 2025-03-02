/**
 * Organization Domain Repositories
 *
 * This file defines the repository interfaces for organization extensions.
 * These interfaces define the contract for data access independent of the
 * specific implementation (database, API, etc.).
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
 * Organization metrics repository interface
 */
export interface OrganizationMetricsRepository {
  /**
   * Get metrics for an organization
   * @param organizationId The ID of the organization
   */
  getMetrics(organizationId: string): Promise<OrganizationMetrics>;
}

/**
 * Organization activity repository interface
 */
export interface OrganizationActivityRepository {
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
   * Create a new activity record
   * @param activity The activity to record
   */
  createActivity(
    activity: Omit<OrganizationActivity, 'id' | 'createdAt'>
  ): Promise<OrganizationActivity>;
}

/**
 * Repository for organization workspaces
 */
export interface OrganizationWorkspaceRepository {
  /**
   * Get workspaces for an organization
   */
  getWorkspaces(organizationId: string): Promise<OrganizationWorkspace[]>;

  /**
   * Get a workspace by ID
   */
  getWorkspace(workspaceId: string): Promise<OrganizationWorkspace>;

  /**
   * Create a new workspace
   */
  createWorkspace(data: CreateWorkspaceRequest): Promise<OrganizationWorkspace>;

  /**
   * Update a workspace
   */
  updateWorkspace(data: UpdateWorkspaceRequest): Promise<OrganizationWorkspace>;

  /**
   * Delete a workspace
   */
  deleteWorkspace(workspaceId: string): Promise<void>;

  /**
   * Check if a user has permission to perform a specific action on a resource
   */
  checkActionPermission(
    userId: string,
    organizationId: string,
    resourceType: ResourceType,
    resourceId: string,
    action: string
  ): Promise<boolean>;
}

/**
 * Enhanced organization repository interface
 */
export interface EnhancedOrganizationRepository {
  /**
   * Get enhanced organization data
   * @param slug The organization slug
   */
  getEnhancedOrganization(slug: string): Promise<EnhancedOrganization>;
}

/**
 * Repository for checking organization permissions
 */
export interface OrganizationPermissionRepository {
  /**
   * Check if a user has permission to perform a specific action on a resource
   */
  checkActionPermission(
    userId: string,
    organizationId: string,
    resourceType: ResourceType,
    resourceId: string,
    action: string
  ): Promise<boolean>;
}

/**
 * Combined organization extensions repository interface
 */
export interface OrganizationExtensionsRepository
  extends OrganizationMetricsRepository,
    OrganizationActivityRepository,
    OrganizationWorkspaceRepository,
    EnhancedOrganizationRepository,
    OrganizationPermissionRepository {}
