/**
 * Organization Plugin
 *
 * This file provides the main plugin for the organization functionality.
 * It extends Better Auth with organization-specific functionality.
 *
 * @fileoverview
 * The organization plugin extends Better Auth with organization-specific
 * functionality, including metrics, activity, and workspace management.
 * It registers endpoints and schemas for the organization functionality.
 *
 * This plugin is part of the Better Auth plugin architecture, which allows
 * extending Better Auth with additional functionality.
 */

import type { BetterAuthPlugin } from 'better-auth';
import { createAuthEndpoint } from 'better-auth/api';

import { createOrgAdapter } from '@/lib/adapters/factory';

import * as endpoints from './endpoints';
import * as schemas from './schemas';

/**
 * Organization Plugin
 *
 * This function returns a plugin that extends Better Auth with
 * organization-specific functionality.
 *
 * @returns The organization plugin
 */
export function orgPlugin(): BetterAuthPlugin {
  return {
    id: 'org',
    // Define schema according to Better Auth's format
    schema: {
      // Organization metrics table
      orgMetrics: {
        fields: {
          id: { type: 'string', required: true, unique: true },
          orgId: { type: 'string', required: true, unique: true },
          activeUsers: { type: 'number', required: true },
          totalUsers: { type: 'number', required: true },
          totalWorkspaces: { type: 'number', required: true },
          lastUpdated: { type: 'string', required: true },
          additionalMetrics: { type: 'string', required: false }, // JSON string
        },
        modelName: 'OrgMetrics',
      },

      // Organization activity table
      orgActivity: {
        fields: {
          id: { type: 'string', required: true, unique: true },
          orgId: { type: 'string', required: true },
          userId: { type: 'string', required: true },
          action: { type: 'string', required: true },
          resourceType: { type: 'string', required: true },
          resourceId: { type: 'string', required: true },
          timestamp: { type: 'string', required: true },
          metadata: { type: 'string', required: false }, // JSON string
        },
        modelName: 'OrgActivity',
      },

      // Organization workspace table
      orgWorkspace: {
        fields: {
          id: { type: 'string', required: true, unique: true },
          orgId: { type: 'string', required: true },
          name: { type: 'string', required: true },
          description: { type: 'string', required: false },
          createdAt: { type: 'string', required: true },
          updatedAt: { type: 'string', required: true },
          createdBy: { type: 'string', required: true },
          settings: { type: 'string', required: false }, // JSON string
        },
        modelName: 'OrgWorkspace',
      },
    },

    // Add onRequest hook for request interception
    onRequest: async (request, ctx) => {
      // Log requests to organization endpoints for debugging
      if (request.url && new URL(request.url).pathname.startsWith('/org/')) {
        console.log(`Request to ${new URL(request.url).pathname}`);
      }
      // Continue normally with the same request
      return { request };
    },

    // Add onResponse hook for response modification
    onResponse: async (response, ctx) => {
      // Log responses from organization endpoints
      // We can't access the original URL directly from the response
      // so we'll just log that a response was processed
      console.log('Processing organization response');

      // Continue normally with the same response
      return { response };
    },

    // Define endpoints
    endpoints: {
      // Simple ping endpoint for testing
      ping: endpoints.pingEndpoint,

      // Metrics endpoints
      getOrgMetrics: endpoints.getOrgMetricsEndpoint,
      updateOrgMetrics: endpoints.updateOrgMetricsEndpoint,

      // Activity endpoints
      getOrgActivity: endpoints.getOrgActivityEndpoint,
      recordOrgActivity: endpoints.recordOrgActivityEndpoint,

      // Workspace endpoints
      getOrgWorkspaces: endpoints.getOrgWorkspacesEndpoint,
      createOrgWorkspace: endpoints.createOrgWorkspaceEndpoint,
      updateOrgWorkspace: endpoints.updateOrgWorkspaceEndpoint,
      deleteOrgWorkspace: endpoints.deleteOrgWorkspaceEndpoint,
    },
  };
}
