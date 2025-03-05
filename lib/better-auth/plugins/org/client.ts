/**
 * Organization Client Plugin
 *
 * This file provides the client-side plugin for the organization functionality.
 * It extends the Better Auth client with organization-specific functionality.
 *
 * @fileoverview
 * The organization client plugin extends the Better Auth client with
 * organization-specific functionality, including metrics, activity, and
 * workspace management. It provides a consistent interface for interacting
 * with the organization functionality from the client side.
 *
 * This plugin is part of the Better Auth plugin architecture, which allows
 * extending the Better Auth client with additional functionality.
 */

import type { BetterFetchOption } from '@better-fetch/fetch';
import type { BetterAuthClientPlugin } from 'better-auth/client';

import type {
  CreateWorkspaceInput,
  OrgActivity,
  OrgMetrics,
  OrgWorkspace,
  RecordActivityInput,
  UpdateMetricsInput,
  UpdateWorkspaceInput,
} from '@/lib/types/org';

import type { orgPlugin } from './index';

/**
 * Organization Client Plugin
 *
 * This function returns a client plugin that extends the Better Auth client
 * with organization-specific functionality.
 *
 * @returns The organization client plugin
 */
export function orgClientPlugin() {
  return {
    id: 'org',
    $InferServerPlugin: {} as ReturnType<typeof orgPlugin>,

    // Define path methods to ensure correct HTTP methods are used
    pathMethods: {
      // Simple ping endpoint
      '/org/ping': 'GET',

      // Metrics endpoints
      '/org/metrics/:orgId': 'GET', // For GET requests

      // Activity endpoints
      '/org/activity/:orgId': 'GET',
      '/org/activity': 'POST',

      // Workspace endpoints
      '/org/workspaces/:orgId': 'GET',
      '/org/workspaces': 'POST',
      '/org/workspaces/:workspaceId': 'POST', // For updates
    },

    // Define custom methods for the client plugin
    getActions: ($fetch) => {
      return {
        // Simple ping action for testing
        ping: async (options?: BetterFetchOption) => {
          return $fetch('/org/ping', {
            method: 'GET',
            ...options,
          });
        },

        // Metrics actions
        getOrgMetrics: async (orgId: string, options?: BetterFetchOption) => {
          return $fetch<OrgMetrics>(`/org/metrics/${orgId}`, {
            method: 'GET',
            ...options,
          });
        },

        updateOrgMetrics: async (
          orgId: string,
          data: UpdateMetricsInput,
          options?: BetterFetchOption
        ) => {
          return $fetch<OrgMetrics>(`/org/metrics/${orgId}`, {
            method: 'POST',
            body: data,
            ...options,
          });
        },

        // Activity actions
        recordActivity: async (
          data: RecordActivityInput,
          options?: BetterFetchOption
        ) => {
          return $fetch<OrgActivity>(`/org/activity`, {
            method: 'POST',
            body: data,
            ...options,
          });
        },

        getActivityHistory: async (
          orgId: string,
          { limit, offset }: { limit?: number; offset?: number } = {},
          options?: BetterFetchOption
        ) => {
          const params = new URLSearchParams();
          if (limit !== undefined) params.append('limit', limit.toString());
          if (offset !== undefined) params.append('cursor', offset.toString());

          const queryString = params.toString();
          const url = `/org/activity/${orgId}${queryString ? `?${queryString}` : ''}`;

          return $fetch<OrgActivity[]>(url, {
            method: 'GET',
            ...options,
          });
        },

        // Workspace actions
        listWorkspaces: async (orgId: string, options?: BetterFetchOption) => {
          return $fetch<OrgWorkspace[]>(`/org/workspaces/${orgId}`, {
            method: 'GET',
            ...options,
          });
        },

        createWorkspace: async (
          data: CreateWorkspaceInput,
          options?: BetterFetchOption
        ) => {
          return $fetch<OrgWorkspace>(`/org/workspaces`, {
            method: 'POST',
            body: data,
            ...options,
          });
        },

        getWorkspace: async (
          workspaceId: string,
          options?: BetterFetchOption
        ) => {
          return $fetch<OrgWorkspace>(`/org/workspaces/${workspaceId}`, {
            method: 'GET',
            ...options,
          });
        },

        updateWorkspace: async (
          workspaceId: string,
          data: UpdateWorkspaceInput,
          options?: BetterFetchOption
        ) => {
          return $fetch<OrgWorkspace>(`/org/workspaces/${workspaceId}`, {
            method: 'POST',
            body: data,
            ...options,
          });
        },

        deleteWorkspace: async (
          workspaceId: string,
          options?: BetterFetchOption
        ) => {
          // Note: We're using POST for delete operations since DELETE might not be supported
          return $fetch<{ success: boolean }>(
            `/org/workspaces/${workspaceId}`,
            {
              method: 'POST',
              body: { _method: 'DELETE' }, // Indicate this is a DELETE operation
              ...options,
            }
          );
        },
      };
    },
  } satisfies BetterAuthClientPlugin;
}
