/**
 * Organization Endpoints
 *
 * This file defines the endpoints for the organization functionality.
 * These endpoints are used by the organization plugin to handle
 * organization-specific requests.
 *
 * @fileoverview
 * The organization endpoints define the API endpoints for the
 * organization functionality, including metrics, activity, and workspace
 * management. These endpoints are registered with the Better Auth
 * plugin system and are accessible via the Better Auth API.
 *
 * This file is part of the Better Auth plugin architecture, which provides
 * a consistent way to define and handle API endpoints across all
 * Better Auth plugins.
 */

import { createAuthEndpoint } from 'better-auth/api';
import { z } from 'zod';

import { createOrgAdapter } from '@/lib/adapters/factory';

import * as schemas from './schemas';

/**
 * Ping Endpoint
 *
 * This endpoint is used to test the organization plugin.
 * It returns a simple response indicating that the plugin is working.
 */
export const pingEndpoint = createAuthEndpoint(
  '/org/ping',
  {
    method: 'GET',
  },
  async (ctx) => {
    return ctx.json({
      success: true,
      message: 'Org plugin ping successful!',
      timestamp: new Date().toISOString(),
    });
  }
);

/**
 * Get Organization Metrics Endpoint
 *
 * This endpoint retrieves metrics for a specific organization.
 * It requires an organization ID as a path parameter.
 */
export const getOrgMetricsEndpoint = createAuthEndpoint(
  '/org/metrics/:orgId',
  {
    method: 'GET',
    params: z.object({
      orgId: z.string(),
    }),
  },
  async (ctx) => {
    const { orgId } = ctx.params;

    try {
      // Mock implementation for testing
      // In a real implementation, this would fetch data from a database
      const metrics = {
        id: `metrics-${orgId}`,
        orgId,
        activeUsers: '10',
        totalUsers: '25',
        totalWorkspaces: '5',
        lastUpdated: new Date(),
      };

      return ctx.json(metrics);
    } catch (error) {
      console.error('Error fetching organization metrics:', error);
      return ctx.json(
        {
          success: false,
          error: 'Failed to fetch organization metrics',
        },
        { status: 500 }
      );
    }
  }
);

/**
 * Update Organization Metrics Endpoint
 *
 * This endpoint updates metrics for a specific organization.
 * It requires an organization ID as a path parameter and
 * metrics data in the request body.
 */
export const updateOrgMetricsEndpoint = createAuthEndpoint(
  '/org/metrics/:orgId',
  {
    method: 'POST',
    params: z.object({
      orgId: z.string(),
    }),
    body: schemas.updateMetricsInputSchema,
  },
  async (ctx) => {
    const { orgId } = ctx.params;
    const metricsData = ctx.body;

    try {
      // Mock implementation for testing
      // In a real implementation, this would update data in a database
      const updatedMetrics = {
        id: `metrics-${orgId}`,
        orgId,
        activeUsers: metricsData.activeUsers || '10',
        totalUsers: metricsData.totalUsers || '25',
        totalWorkspaces: metricsData.totalWorkspaces || '5',
        lastUpdated: new Date(),
      };

      return ctx.json(updatedMetrics);
    } catch (error) {
      console.error('Error updating organization metrics:', error);
      return ctx.json(
        {
          success: false,
          error: 'Failed to update organization metrics',
        },
        { status: 500 }
      );
    }
  }
);

/**
 * Get Organization Activity Endpoint
 *
 * This endpoint retrieves activity for a specific organization.
 * It requires an organization ID as a path parameter.
 */
export const getOrgActivityEndpoint = createAuthEndpoint(
  '/org/activity/:orgId',
  {
    method: 'GET',
    params: z.object({
      orgId: z.string(),
    }),
    query: z.object({
      limit: z.string().optional(),
      offset: z.string().optional(),
    }),
  },
  async (ctx) => {
    const { orgId } = ctx.params;
    const { limit = '10', offset = '0' } = ctx.query;

    try {
      // Mock implementation for testing
      // In a real implementation, this would fetch data from a database
      const activities = [
        {
          id: `activity-1-${orgId}`,
          orgId,
          userId: 'user-1',
          action: 'login',
          resourceType: 'auth',
          resourceId: 'session-1',
          timestamp: new Date(Date.now() - 3600000),
          metadata: { ip: '192.168.1.1' },
        },
        {
          id: `activity-2-${orgId}`,
          orgId,
          userId: 'user-2',
          action: 'create',
          resourceType: 'workspace',
          resourceId: 'workspace-1',
          timestamp: new Date(),
          metadata: { name: 'New Workspace' },
        },
      ];

      // Return the activities directly instead of wrapping in a data property
      return ctx.json(activities);
    } catch (error) {
      console.error('Error fetching organization activity:', error);
      return ctx.json(
        {
          success: false,
          error: 'Failed to fetch organization activity',
        },
        { status: 500 }
      );
    }
  }
);

/**
 * Record Organization Activity Endpoint
 *
 * This endpoint records activity for a specific organization.
 * It requires activity data in the request body.
 */
export const recordOrgActivityEndpoint = createAuthEndpoint(
  '/org/activity',
  {
    method: 'POST',
    body: schemas.recordActivityInputSchema,
  },
  async (ctx) => {
    const activityData = ctx.body;

    try {
      // Mock implementation for testing
      // In a real implementation, this would record data in a database
      const recordedActivity = {
        id: `activity-${Math.random().toString(36).substring(2, 9)}`,
        ...activityData,
        timestamp: new Date(),
      };

      // Return the activity directly instead of wrapping in a data property
      return ctx.json(recordedActivity);
    } catch (error) {
      console.error('Error recording organization activity:', error);
      return ctx.json(
        {
          success: false,
          error: 'Failed to record organization activity',
        },
        { status: 500 }
      );
    }
  }
);

/**
 * Get Organization Workspaces Endpoint
 *
 * This endpoint retrieves workspaces for a specific organization.
 * It requires an organization ID as a path parameter.
 */
export const getOrgWorkspacesEndpoint = createAuthEndpoint(
  '/org/workspaces/:orgId',
  {
    method: 'GET',
    params: z.object({
      orgId: z.string(),
    }),
  },
  async (ctx) => {
    const { orgId } = ctx.params;

    try {
      // Mock implementation for testing
      // In a real implementation, this would fetch data from a database
      const workspaces = [
        {
          id: `workspace-1-${orgId}`,
          orgId,
          name: 'Default Workspace',
          description: 'The default workspace for this organization',
          createdBy: 'user-1',
          createdAt: new Date(Date.now() - 86400000),
          updatedAt: new Date(),
        },
        {
          id: `workspace-2-${orgId}`,
          orgId,
          name: 'Development Workspace',
          description: 'Workspace for development activities',
          createdBy: 'user-2',
          createdAt: new Date(Date.now() - 43200000),
          updatedAt: new Date(),
        },
      ];

      // Return the workspaces directly instead of wrapping in a data property
      return ctx.json(workspaces);
    } catch (error) {
      console.error('Error fetching organization workspaces:', error);
      return ctx.json(
        {
          success: false,
          error: 'Failed to fetch organization workspaces',
        },
        { status: 500 }
      );
    }
  }
);

/**
 * Create Organization Workspace Endpoint
 *
 * This endpoint creates a workspace for a specific organization.
 * It requires workspace data in the request body.
 */
export const createOrgWorkspaceEndpoint = createAuthEndpoint(
  '/org/workspaces',
  {
    method: 'POST',
    body: schemas.createWorkspaceInputSchema,
  },
  async (ctx) => {
    const workspaceData = ctx.body;

    try {
      // Mock implementation for testing
      // In a real implementation, this would create data in a database
      const now = new Date();
      const createdWorkspace = {
        id: `workspace-${Math.random().toString(36).substring(2, 9)}`,
        ...workspaceData,
        createdAt: now,
        updatedAt: now,
      };

      // Return the workspace directly instead of wrapping in a data property
      return ctx.json(createdWorkspace);
    } catch (error) {
      console.error('Error creating organization workspace:', error);
      return ctx.json(
        {
          success: false,
          error: 'Failed to create organization workspace',
        },
        { status: 500 }
      );
    }
  }
);

/**
 * Update Organization Workspace Endpoint
 *
 * This endpoint updates a workspace for a specific organization.
 * It requires a workspace ID as a path parameter and
 * workspace data in the request body.
 */
export const updateOrgWorkspaceEndpoint = createAuthEndpoint(
  '/org/workspaces/:workspaceId',
  {
    method: 'POST',
    params: z.object({
      workspaceId: z.string(),
    }),
    body: schemas.updateWorkspaceInputSchema,
  },
  async (ctx) => {
    const { workspaceId } = ctx.params;
    const workspaceData = ctx.body;

    try {
      // Mock implementation for testing
      // In a real implementation, this would update data in a database
      const updatedWorkspace = {
        id: workspaceId,
        orgId: 'org-123', // In a real implementation, this would be fetched from the database
        ...workspaceData,
        createdBy: 'user-1', // In a real implementation, this would be preserved from the original
        createdAt: new Date(Date.now() - 86400000), // In a real implementation, this would be preserved
        updatedAt: new Date(),
      };

      // Return the workspace directly instead of wrapping in a data property
      return ctx.json(updatedWorkspace);
    } catch (error) {
      console.error('Error updating organization workspace:', error);
      return ctx.json(
        {
          success: false,
          error: 'Failed to update organization workspace',
        },
        { status: 500 }
      );
    }
  }
);

/**
 * Delete Organization Workspace Endpoint
 *
 * This endpoint deletes a workspace for a specific organization.
 * It requires a workspace ID as a path parameter.
 */
export const deleteOrgWorkspaceEndpoint = createAuthEndpoint(
  '/org/workspaces/:workspaceId',
  {
    method: 'POST',
    params: z.object({
      workspaceId: z.string(),
    }),
    body: z.object({
      _method: z.literal('DELETE'),
    }),
  },
  async (ctx) => {
    const { workspaceId } = ctx.params;

    try {
      // Mock implementation for testing
      // In a real implementation, this would delete data from a database

      // Return a simple success response
      return ctx.json({
        success: true,
        message: `Workspace ${workspaceId} deleted successfully`,
        deletedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error deleting organization workspace:', error);
      return ctx.json(
        {
          success: false,
          error: 'Failed to delete organization workspace',
        },
        { status: 500 }
      );
    }
  }
);
