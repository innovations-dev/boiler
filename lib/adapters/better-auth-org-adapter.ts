/**
 * Better Auth Org Adapter
 *
 * This file provides an implementation of the OrgAdapter
 * that uses the Better Auth client to interact with the organization functionality.
 *
 * @fileoverview
 * The Better Auth org adapter implements the OrgAdapter interface
 * using the Better Auth client. It provides methods for interacting with the organization
 * functionality, including metrics, activity, and workspace management.
 *
 * This adapter serves as a bridge between the application and the Better Auth plugin,
 * allowing the application to use the plugin's functionality through a consistent interface.
 *
 * As described in the organization workflow documentation, this adapter is a key component
 * of the service layer that integrates with the Better Auth plugin architecture to provide
 * organization management capabilities. It abstracts away the implementation details of
 * the Better Auth client, providing a clean, type-safe interface for the application.
 *
 * @example
 * // Usage example
 * import { createBetterAuthOrgAdapter } from './lib/adapters/better-auth-org-adapter';
 *
 * const adapter = createBetterAuthOrgAdapter();
 * const metrics = await adapter.getOrgMetrics('org-123');
 */

// Import the client creation function
import { createAuthClient } from 'better-auth/client';

import { orgClientPlugin } from '../better-auth/plugins/org/client';
import type {
  CreateWorkspaceInput,
  OrgActivity,
  OrgMetrics,
  OrgWorkspace,
  RecordActivityInput,
  UpdateMetricsInput,
  UpdateWorkspaceInput,
} from '../types/org';
import type { OrgAdapter } from './org-adapter';

/**
 * Better Auth Response interface
 *
 * This interface defines the structure of responses from the Better Auth API.
 * Better Auth consistently returns responses with a `data` property containing
 * the successful response data and an optional `error` property for error cases.
 *
 * This structure is part of the Better Auth plugin architecture, which provides
 * a consistent way to handle responses across all Better Auth plugins.
 *
 * @template T The type of data contained in the response
 */
interface BetterAuthResponse<T> {
  data: T;
  error?: string;
}

/**
 * Better Auth Org Adapter
 *
 * This class implements the OrgAdapter interface using the Better Auth client.
 * It provides methods for interacting with the organization functionality.
 *
 * As part of the organization workflow, this adapter enables the application to:
 * - Track and display organization usage metrics
 * - Record and query organization activity
 * - Create and manage workspaces within organizations
 */
export class BetterAuthOrgAdapter implements OrgAdapter {
  /**
   * The Better Auth client instance
   *
   * This client is used to make requests to the Better Auth API.
   */
  private client: {
    $fetch: <T>(
      url: string,
      options?: { method?: string; body?: any }
    ) => Promise<T>;
  };

  /**
   * Creates a new Better Auth org adapter
   *
   * Initializes the Better Auth client with the organization plugin.
   */
  constructor() {
    this.client = createAuthClient({
      plugins: [orgClientPlugin()],
    }) as {
      $fetch: <T>(
        url: string,
        options?: { method?: string; body?: any }
      ) => Promise<T>;
    };
  }

  /**
   * Helper method to make typed fetch requests to the Better Auth API
   *
   * This method handles the common pattern of making requests to the Better Auth API
   * and processing the responses. It extracts the data from the response and handles
   * error cases consistently.
   *
   * @template T The type of data to return
   * @param url The URL to fetch
   * @param options The fetch options
   * @returns A promise that resolves to the data
   */
  private async typedFetch<T>(
    url: string,
    options?: { method?: string; body?: any }
  ): Promise<T> {
    const response = await this.client.$fetch<BetterAuthResponse<T>>(
      url,
      options
    );

    // Type assertion to handle the response
    const typedResponse = response as BetterAuthResponse<T>;

    if (typedResponse.error) {
      throw new Error(typedResponse.error);
    }

    return typedResponse.data;
  }

  /**
   * Get metrics for an organization
   *
   * Retrieves the current metrics for an organization.
   *
   * This method is part of the organization workflow's metrics tracking functionality,
   * allowing the application to retrieve usage metrics for an organization.
   *
   * @param orgId - The ID of the organization
   * @returns The organization metrics
   *
   * @example
   * const metrics = await adapter.getOrgMetrics('org-123');
   */
  async getOrgMetrics(orgId: string): Promise<OrgMetrics> {
    try {
      return await this.typedFetch<OrgMetrics>(`/org/metrics/${orgId}`);
    } catch (error) {
      throw new Error(
        `Failed to get organization metrics for organization ${orgId}: ${(error as Error).message}`
      );
    }
  }

  /**
   * Update metrics for an organization
   *
   * Updates the metrics for an organization.
   *
   * This method is part of the organization workflow's metrics tracking functionality,
   * allowing the application to update usage metrics for an organization.
   *
   * @param orgId - The ID of the organization
   * @param metrics - The metrics to update
   * @returns The updated organization metrics
   *
   * @example
   * const updatedMetrics = await adapter.updateOrgMetrics('org-123', {
   *   activeUsers: 15,
   *   totalWorkspaces: 8,
   *   storageUsed: 2048000
   * });
   */
  async updateOrgMetrics(
    orgId: string,
    metrics: UpdateMetricsInput
  ): Promise<OrgMetrics> {
    try {
      return await this.typedFetch<OrgMetrics>(`/org/metrics/${orgId}`, {
        method: 'POST',
        body: metrics,
      });
    } catch (error) {
      throw new Error(
        `Failed to update organization metrics for organization ${orgId}: ${(error as Error).message}`
      );
    }
  }

  /**
   * Record activity for an organization
   *
   * @param activity - The activity to record
   * @returns The recorded activity
   */
  async recordActivity(activity: RecordActivityInput): Promise<OrgActivity> {
    try {
      return await this.typedFetch<OrgActivity>(
        `/org/activity/${activity.orgId}`,
        {
          method: 'POST',
          body: activity,
        }
      );
    } catch (error) {
      throw new Error(
        `Failed to record organization activity: ${(error as Error).message}`
      );
    }
  }

  /**
   * Get activity history for an organization
   *
   * @param orgId - The ID of the organization
   * @param options - Options for pagination
   * @returns The organization activity history
   */
  async getActivityHistory(
    orgId: string,
    options?: { limit?: number; offset?: number }
  ): Promise<OrgActivity[]> {
    try {
      const queryParams = new URLSearchParams();
      if (options?.limit) queryParams.append('limit', options.limit.toString());
      if (options?.offset)
        queryParams.append('offset', options.offset.toString());

      const queryString = queryParams.toString();
      const endpoint = `/org/activity/${orgId}${queryString ? `?${queryString}` : ''}`;

      return await this.typedFetch<OrgActivity[]>(endpoint);
    } catch (error) {
      throw new Error(
        `Failed to get organization activity history for organization ${orgId}: ${(error as Error).message}`
      );
    }
  }

  /**
   * List workspaces for an organization
   *
   * @param orgId - The ID of the organization
   * @returns The organization workspaces
   */
  async listWorkspaces(orgId: string): Promise<OrgWorkspace[]> {
    try {
      return await this.typedFetch<OrgWorkspace[]>(`/org/workspaces/${orgId}`);
    } catch (error) {
      throw new Error(
        `Failed to list workspaces for organization ${orgId}: ${(error as Error).message}`
      );
    }
  }

  /**
   * Create a workspace for an organization
   *
   * @param workspace - The workspace to create
   * @returns The created workspace
   */
  async createWorkspace(
    workspace: CreateWorkspaceInput
  ): Promise<OrgWorkspace> {
    try {
      return await this.typedFetch<OrgWorkspace>(
        `/org/workspaces/${workspace.orgId}`,
        {
          method: 'POST',
          body: workspace,
        }
      );
    } catch (error) {
      throw new Error(
        `Failed to create workspace for organization ${workspace.orgId}: ${(error as Error).message}`
      );
    }
  }

  /**
   * Get a workspace by ID
   *
   * @param workspaceId - The ID of the workspace
   * @returns The workspace
   */
  async getWorkspace(workspaceId: string): Promise<OrgWorkspace> {
    try {
      return await this.typedFetch<OrgWorkspace>(
        `/org/workspaces/detail/${workspaceId}`
      );
    } catch (error) {
      throw new Error(
        `Failed to get workspace ${workspaceId}: ${(error as Error).message}`
      );
    }
  }

  /**
   * Update a workspace
   *
   * @param workspaceId - The ID of the workspace
   * @param updates - The updates to apply
   * @returns The updated workspace
   */
  async updateWorkspace(
    workspaceId: string,
    updates: UpdateWorkspaceInput
  ): Promise<OrgWorkspace> {
    try {
      return await this.typedFetch<OrgWorkspace>(
        `/org/workspaces/${workspaceId}`,
        {
          method: 'PATCH',
          body: updates,
        }
      );
    } catch (error) {
      throw new Error(
        `Failed to update workspace ${workspaceId}: ${(error as Error).message}`
      );
    }
  }

  /**
   * Delete a workspace
   *
   * @param workspaceId - The ID of the workspace
   * @returns A promise that resolves when the workspace is deleted
   */
  async deleteWorkspace(workspaceId: string): Promise<void> {
    try {
      await this.typedFetch<void>(`/org/workspaces/${workspaceId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      throw new Error(
        `Failed to delete workspace ${workspaceId}: ${(error as Error).message}`
      );
    }
  }
}

/**
 * Creates a Better Auth org adapter
 *
 * This factory function creates a new instance of the Better Auth org adapter.
 * It provides a convenient way to create an adapter without directly instantiating
 * the class.
 *
 * @returns A new instance of the Better Auth org adapter
 *
 * @example
 * const adapter = createBetterAuthOrgAdapter();
 * const metrics = await adapter.getOrgMetrics('org-123');
 */
export function createBetterAuthOrgAdapter(): OrgAdapter {
  return new BetterAuthOrgAdapter();
}
