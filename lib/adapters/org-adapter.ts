/**
 * Organization Adapter Interface
 *
 * This file defines the interface for the organization adapter.
 * The adapter provides a provider-agnostic way to interact with organization functionality.
 *
 * @fileoverview
 * The OrgAdapter interface defines the contract for adapters that provide
 * organization functionality. This allows the application to interact with
 * organization functionality without being tightly coupled to a specific
 * implementation, such as Better Auth.
 *
 * This interface is part of the adapter pattern described in the organization
 * workflow documentation. It provides a clean, type-safe interface for the
 * application to use, regardless of the underlying implementation.
 */

import type {
  CreateWorkspaceInput,
  OrgActivity,
  OrgMetrics,
  OrgWorkspace,
  RecordActivityInput,
  UpdateMetricsInput,
  UpdateWorkspaceInput,
} from '../types/org';

/**
 * Organization Adapter Interface
 *
 * This interface defines the contract for adapters that provide
 * organization functionality. It includes methods for metrics,
 * activity tracking, and workspace management.
 *
 * @interface
 */
export interface OrgAdapter {
  /**
   * Get metrics for an organization
   *
   * @param orgId - The ID of the organization
   * @returns The organization metrics
   */
  getOrgMetrics(orgId: string): Promise<OrgMetrics>;

  /**
   * Update metrics for an organization
   *
   * @param orgId - The ID of the organization
   * @param metrics - The metrics to update
   * @returns The updated organization metrics
   */
  updateOrgMetrics(
    orgId: string,
    metrics: UpdateMetricsInput
  ): Promise<OrgMetrics>;

  /**
   * Record activity for an organization
   *
   * @param activity - The activity to record
   * @returns The recorded activity
   */
  recordActivity(activity: RecordActivityInput): Promise<OrgActivity>;

  /**
   * Get activity history for an organization
   *
   * @param orgId - The ID of the organization
   * @param options - Options for pagination
   * @returns The organization activity history
   */
  getActivityHistory(
    orgId: string,
    options?: { limit?: number; offset?: number }
  ): Promise<OrgActivity[]>;

  /**
   * List workspaces for an organization
   *
   * @param orgId - The ID of the organization
   * @returns The organization workspaces
   */
  listWorkspaces(orgId: string): Promise<OrgWorkspace[]>;

  /**
   * Create a workspace for an organization
   *
   * @param workspace - The workspace to create
   * @returns The created workspace
   */
  createWorkspace(workspace: CreateWorkspaceInput): Promise<OrgWorkspace>;

  /**
   * Get a workspace by ID
   *
   * @param workspaceId - The ID of the workspace
   * @returns The workspace
   */
  getWorkspace(workspaceId: string): Promise<OrgWorkspace>;

  /**
   * Update a workspace
   *
   * @param workspaceId - The ID of the workspace
   * @param updates - The updates to apply
   * @returns The updated workspace
   */
  updateWorkspace(
    workspaceId: string,
    updates: UpdateWorkspaceInput
  ): Promise<OrgWorkspace>;

  /**
   * Delete a workspace
   *
   * @param workspaceId - The ID of the workspace
   * @returns A promise that resolves when the workspace is deleted
   */
  deleteWorkspace(workspaceId: string): Promise<void>;
}
