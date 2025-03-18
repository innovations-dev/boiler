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
// interface BetterAuthResponse<T> {
//   success: boolean;
//   data?: T;
//   message?: string;
//   timestamp?: string;
//   error?: {
//     code: string;
//     message: string;
//   };
// }

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        options?: { method?: string; body?: any }
      ) => Promise<T>;
    };
  }

  /**
   * Typed fetch helper
   *
   * This method provides a typed wrapper around the Better Auth client's fetch method.
   * It handles error responses and ensures that the response data is properly typed.
   *
   * @param url - The URL to fetch
   * @param options - The fetch options
   * @returns The typed response data
   * @throws Error if the request fails
   */
  private async typedFetch<T>(
    url: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options?: { method?: string; body?: any }
  ): Promise<T> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await this.client.$fetch<any>(url, options);

      // Handle error responses
      if (response.error) {
        throw new Error(response.error.message);
      }

      // Handle responses with a data property (Better Auth standard format)
      if (response.data !== undefined) {
        return response.data as T;
      }

      // Handle direct data responses (our custom endpoints)
      // If the response doesn't have a data property but has other properties
      // that match our expected type, return the response directly
      return response as T;
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
      throw error;
    }
  }

  /**
   * Gets organization metrics
   *
   * @param {string} orgId - Organization ID
   * @returns Organization metrics
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
   * Updates organization metrics
   *
   * @param {string} orgId - Organization ID
   * @param {UpdateMetricsInput} metrics - Metrics to update
   * @returns Updated organization metrics
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
   * Records organization activity
   *
   * @param {RecordActivityInput} activity - Activity to record
   * @returns Recorded activity
   */
  async recordActivity(activity: RecordActivityInput): Promise<OrgActivity> {
    try {
      // Map the input to match the expected format
      // The schema uses 'resource' but the adapter interface expects 'resourceType'
      const adaptedActivity = {
        ...activity,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resourceType: (activity as any).resource || activity.resourceType,
      };

      // Remove the 'resource' property if it exists
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((adaptedActivity as any).resource) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (adaptedActivity as any).resource;
      }

      return await this.typedFetch<OrgActivity>(`/org/activity`, {
        method: 'POST',
        body: adaptedActivity,
      });
    } catch (error) {
      throw new Error(
        `Failed to record activity for organization ${activity.orgId}: ${(error as Error).message}`
      );
    }
  }

  /**
   * Gets organization activity history
   *
   * @param {string} orgId - Organization ID
   * @param {object} options - Options for pagination
   * @returns Organization activity history
   */
  async getActivityHistory(
    orgId: string,
    options?: { limit?: number; offset?: number }
  ): Promise<OrgActivity[]> {
    try {
      const queryParams = new URLSearchParams();
      if (options?.limit !== undefined) {
        queryParams.append('limit', options.limit.toString());
      }
      if (options?.offset !== undefined) {
        queryParams.append('offset', options.offset.toString());
      }

      const queryString = queryParams.toString();
      const url = `/org/activity/${orgId}${
        queryString ? `?${queryString}` : ''
      }`;

      // Now that we've updated the schemas, we can directly return the response
      return await this.typedFetch<OrgActivity[]>(url);
    } catch (error) {
      throw new Error(
        `Failed to get activity history for organization ${orgId}: ${(error as Error).message}`
      );
    }
  }

  /**
   * Lists workspaces for an organization
   *
   * @param {string} orgId - Organization ID
   * @returns Organization workspaces
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
   * Creates a workspace
   *
   * @param {CreateWorkspaceInput} workspace - Workspace to create
   * @returns Created workspace
   */
  async createWorkspace(
    workspace: CreateWorkspaceInput
  ): Promise<OrgWorkspace> {
    try {
      return await this.typedFetch<OrgWorkspace>(`/org/workspaces`, {
        method: 'POST',
        body: workspace,
      });
    } catch (error) {
      throw new Error(
        `Failed to create workspace for organization ${workspace.orgId}: ${(error as Error).message}`
      );
    }
  }

  /**
   * Gets a workspace
   *
   * @param {string} workspaceId - Workspace ID
   * @returns Workspace
   */
  async getWorkspace(workspaceId: string): Promise<OrgWorkspace> {
    try {
      return await this.typedFetch<OrgWorkspace>(
        `/org/workspaces/${workspaceId}`
      );
    } catch (error) {
      throw new Error(
        `Failed to get workspace ${workspaceId}: ${(error as Error).message}`
      );
    }
  }

  /**
   * Updates a workspace
   *
   * @param {string} workspaceId - Workspace ID
   * @param {UpdateWorkspaceInput} updates - Updates to apply
   * @returns Updated workspace
   */
  async updateWorkspace(
    workspaceId: string,
    updates: UpdateWorkspaceInput
  ): Promise<OrgWorkspace> {
    try {
      return await this.typedFetch<OrgWorkspace>(
        `/org/workspaces/${workspaceId}`,
        {
          method: 'POST',
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
   * Deletes a workspace
   *
   * @param {string} workspaceId - Workspace ID
   */
  async deleteWorkspace(workspaceId: string): Promise<void> {
    try {
      await this.typedFetch<void>(`/org/workspaces/${workspaceId}`, {
        method: 'POST',
        body: { _method: 'DELETE' },
      });
    } catch (error) {
      throw new Error(
        `Failed to delete workspace ${workspaceId}: ${(error as Error).message}`
      );
    }
  }

  /**
   * Pings the organization plugin
   *
   * @returns A response with a success message and timestamp
   */
  async ping(): Promise<{
    success: boolean;
    message: string;
    timestamp: string;
  }> {
    try {
      // Use typedFetch for consistency with other methods
      return await this.typedFetch<{
        success: boolean;
        message: string;
        timestamp: string;
      }>('/org/ping', { method: 'GET' });
    } catch (error) {
      console.error('Error pinging org plugin:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
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
