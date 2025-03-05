/**
 * Organization Types
 *
 * This file defines the types used by the organization functionality.
 * These types are used by the organization adapter and related components.
 *
 * @fileoverview
 * The organization types define the data structures used by the organization
 * functionality, including metrics, activity, and workspace management.
 * These types are used throughout the application to ensure type safety
 * when working with organization data.
 */

/**
 * Organization Metrics
 *
 * Represents the metrics for an organization, including user counts,
 * activity levels, and other relevant statistics.
 */
export interface OrgMetrics {
  /**
   * The ID of the organization
   */
  orgId: string;

  /**
   * The number of active users in the organization
   */
  activeUsers: number;

  /**
   * The total number of users in the organization
   */
  totalUsers: number;

  /**
   * The number of workspaces in the organization
   */
  totalWorkspaces: number;

  /**
   * The date the metrics were last updated
   */
  lastUpdated: string;

  /**
   * Additional metrics specific to the organization
   */
  additionalMetrics?: Record<string, any>;
}

/**
 * Update Metrics Input
 *
 * Represents the input for updating organization metrics.
 */
export interface UpdateMetricsInput {
  /**
   * The number of active users in the organization
   */
  activeUsers?: number;

  /**
   * The total number of users in the organization
   */
  totalUsers?: number;

  /**
   * The number of workspaces in the organization
   */
  totalWorkspaces?: number;

  /**
   * Additional metrics specific to the organization
   */
  additionalMetrics?: Record<string, any>;
}

/**
 * Organization Activity
 *
 * Represents an activity event within an organization.
 * This is used for audit trails, analytics, and user activity monitoring.
 */
export interface OrgActivity {
  /**
   * The ID of the activity
   */
  id: string;

  /**
   * The ID of the organization
   */
  orgId: string;

  /**
   * The ID of the user who performed the action
   */
  userId: string;

  /**
   * The action that was performed
   */
  action: string;

  /**
   * The type of resource that was affected
   */
  resourceType: string;

  /**
   * The ID of the resource that was affected
   */
  resourceId: string;

  /**
   * The timestamp when the activity occurred
   */
  timestamp: string;

  /**
   * Additional metadata about the activity
   */
  metadata?: Record<string, any>;
}

/**
 * Record Activity Input
 *
 * Represents the input for recording an activity event.
 */
export interface RecordActivityInput {
  /**
   * The ID of the organization
   */
  orgId: string;

  /**
   * The ID of the user who performed the action
   */
  userId: string;

  /**
   * The action that was performed
   */
  action: string;

  /**
   * The type of resource that was affected
   */
  resourceType: string;

  /**
   * The ID of the resource that was affected
   */
  resourceId: string;

  /**
   * Additional metadata about the activity
   */
  metadata?: Record<string, any>;
}

/**
 * Organization Workspace
 *
 * Represents a workspace within an organization.
 * Workspaces are used to organize resources and users within an organization.
 */
export interface OrgWorkspace {
  /**
   * The ID of the workspace
   */
  id: string;

  /**
   * The ID of the organization
   */
  orgId: string;

  /**
   * The name of the workspace
   */
  name: string;

  /**
   * The description of the workspace
   */
  description?: string;

  /**
   * The ID of the user who created the workspace
   */
  createdBy: string;

  /**
   * The timestamp when the workspace was created
   */
  createdAt: string;

  /**
   * The timestamp when the workspace was last updated
   */
  updatedAt: string;

  /**
   * Additional metadata about the workspace
   */
  metadata?: Record<string, any>;
}

/**
 * Create Workspace Input
 *
 * Represents the input for creating a new workspace.
 */
export interface CreateWorkspaceInput {
  /**
   * The ID of the organization
   */
  orgId: string;

  /**
   * The name of the workspace
   */
  name: string;

  /**
   * The description of the workspace
   */
  description?: string;

  /**
   * The ID of the user who is creating the workspace
   */
  createdBy: string;

  /**
   * Additional metadata about the workspace
   */
  metadata?: Record<string, any>;
}

/**
 * Update Workspace Input
 *
 * Represents the input for updating an existing workspace.
 */
export interface UpdateWorkspaceInput {
  /**
   * The name of the workspace
   */
  name?: string;

  /**
   * The description of the workspace
   */
  description?: string;

  /**
   * Additional metadata about the workspace
   */
  metadata?: Record<string, any>;
}
