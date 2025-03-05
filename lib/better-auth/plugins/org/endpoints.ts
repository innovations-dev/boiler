/**
 * Organization Endpoints
 *
 * This file defines the endpoints for the organization functionality.
 * These endpoints handle requests related to organization metrics,
 * activity, and workspace management.
 *
 * @fileoverview
 * The organization endpoints define the API routes for the organization
 * functionality, including metrics, activity, and workspace management.
 * Each endpoint specifies the HTTP method, path, handler function, and
 * authentication requirements.
 *
 * This file is part of the Better Auth plugin architecture, which provides
 * a consistent way to define and handle API endpoints across all
 * Better Auth plugins.
 */

/**
 * Organization Endpoints
 *
 * This array defines the endpoints for the organization functionality.
 * Each endpoint specifies the HTTP method, path, handler function, and
 * authentication requirements.
 */
export const endpoints = [
  // Metrics endpoints
  {
    method: 'GET',
    path: '/org/metrics/:orgId',
    handler: 'getOrgMetrics',
    auth: true,
  },
  {
    method: 'PATCH',
    path: '/org/metrics/:orgId',
    handler: 'updateOrgMetrics',
    auth: true,
  },

  // Activity endpoints
  {
    method: 'POST',
    path: '/org/activity/:orgId',
    handler: 'recordActivity',
    auth: true,
  },
  {
    method: 'GET',
    path: '/org/activity/:orgId',
    handler: 'getActivityHistory',
    auth: true,
  },

  // Workspace endpoints
  {
    method: 'GET',
    path: '/org/workspaces/:orgId',
    handler: 'listWorkspaces',
    auth: true,
  },
  {
    method: 'POST',
    path: '/org/workspaces/:orgId',
    handler: 'createWorkspace',
    auth: true,
  },
  {
    method: 'GET',
    path: '/org/workspaces/detail/:workspaceId',
    handler: 'getWorkspace',
    auth: true,
  },
  {
    method: 'PATCH',
    path: '/org/workspaces/:workspaceId',
    handler: 'updateWorkspace',
    auth: true,
  },
  {
    method: 'DELETE',
    path: '/org/workspaces/:workspaceId',
    handler: 'deleteWorkspace',
    auth: true,
  },
];
