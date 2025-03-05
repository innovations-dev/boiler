/**
 * Organization Extensions Endpoints
 *
 * This file defines the endpoints for the organization extensions plugin.
 * It includes endpoints for metrics, activity, and workspaces.
 *
 * @fileoverview
 * The endpoints defined in this file are registered with the Better Auth plugin system
 * and are accessible under the `/api/auth/organization-extensions/` prefix. Each endpoint
 * is associated with a handler function that processes the request and returns a response.
 *
 * All endpoints require authentication to access, ensuring that only authorized users
 * can interact with organization data.
 */

import { activityHandlers } from './handlers/activity';
import { metricsHandlers } from './handlers/metrics';
import { workspaceHandlers } from './handlers/workspaces';

/**
 * Organization extensions endpoints
 *
 * This array defines all the endpoints for the organization extensions plugin.
 * Each endpoint specifies a path, HTTP method, handler function, and authentication requirement.
 *
 * All endpoints are accessible under the `/api/auth/` prefix.
 *
 * @example
 * // Example endpoint structure
 * {
 *   path: '/organization-extensions/metrics/:organizationId',
 *   method: 'GET',
 *   handler: metricsHandlers.getMetrics,
 *   auth: true
 * }
 */
export const endpoints = [
  // Metrics endpoints
  {
    /**
     * Get metrics for an organization
     *
     * Path: `/api/auth/organization-extensions/metrics/:organizationId`
     * Method: GET
     *
     * @returns Organization metrics
     */
    path: '/organization-extensions/metrics/:organizationId',
    method: 'GET',
    handler: metricsHandlers.getMetrics,
    auth: true,
  },
  {
    /**
     * Update metrics for an organization
     *
     * Path: `/api/auth/organization-extensions/metrics/:organizationId`
     * Method: POST
     *
     * @returns Updated organization metrics
     */
    path: '/organization-extensions/metrics/:organizationId',
    method: 'POST',
    handler: metricsHandlers.updateMetrics,
    auth: true,
  },

  // Activity endpoints
  {
    /**
     * Get activity history for an organization
     *
     * Path: `/api/auth/organization-extensions/activity/:organizationId`
     * Method: GET
     *
     * @returns Organization activity history
     */
    path: '/organization-extensions/activity/:organizationId',
    method: 'GET',
    handler: activityHandlers.getActivity,
    auth: true,
  },
  {
    /**
     * Record activity for an organization
     *
     * Path: `/api/auth/organization-extensions/activity/:organizationId`
     * Method: POST
     *
     * @returns Recorded activity
     */
    path: '/organization-extensions/activity/:organizationId',
    method: 'POST',
    handler: activityHandlers.recordActivity,
    auth: true,
  },

  // Workspace endpoints
  {
    /**
     * Get workspaces for an organization
     *
     * Path: `/api/auth/organization-extensions/workspaces/:organizationId`
     * Method: GET
     *
     * @returns Organization workspaces
     */
    path: '/organization-extensions/workspaces/:organizationId',
    method: 'GET',
    handler: workspaceHandlers.getWorkspaces,
    auth: true,
  },
  {
    /**
     * Create a workspace for an organization
     *
     * Path: `/api/auth/organization-extensions/workspaces/:organizationId`
     * Method: POST
     *
     * @returns Created workspace
     */
    path: '/organization-extensions/workspaces/:organizationId',
    method: 'POST',
    handler: workspaceHandlers.createWorkspace,
    auth: true,
  },
  {
    /**
     * Get a workspace by ID
     *
     * Path: `/api/auth/organization-extensions/workspaces/detail/:id`
     * Method: GET
     *
     * @returns Workspace details
     */
    path: '/organization-extensions/workspaces/detail/:id',
    method: 'GET',
    handler: workspaceHandlers.getWorkspaceById,
    auth: true,
  },
  {
    /**
     * Update a workspace
     *
     * Path: `/api/auth/organization-extensions/workspaces/:id`
     * Method: PATCH
     *
     * @returns Updated workspace
     */
    path: '/organization-extensions/workspaces/:id',
    method: 'PATCH',
    handler: workspaceHandlers.updateWorkspace,
    auth: true,
  },
  {
    /**
     * Delete a workspace
     *
     * Path: `/api/auth/organization-extensions/workspaces/:id`
     * Method: DELETE
     *
     * @returns Success status
     */
    path: '/organization-extensions/workspaces/:id',
    method: 'DELETE',
    handler: workspaceHandlers.deleteWorkspace,
    auth: true,
  },
];
