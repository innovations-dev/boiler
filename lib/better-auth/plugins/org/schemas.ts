/**
 * Organization Schemas
 *
 * This file defines the schemas for the organization functionality.
 * These schemas are used for validation of request and response data.
 *
 * @fileoverview
 * The organization schemas define the structure of data used by the
 * organization functionality, including metrics, activity, and workspace
 * management. These schemas are used for validation of request and response
 * data, ensuring that the data conforms to the expected structure.
 *
 * This file is part of the Better Auth plugin architecture, which provides
 * a consistent way to define and validate data structures across all
 * Better Auth plugins.
 */

import { z } from 'zod';

/**
 * Organization Metrics Schema
 *
 * This schema defines the structure of organization metrics data.
 */
export const orgMetricsSchema = z.object({
  orgId: z.string(),
  activeUsers: z.number(),
  totalUsers: z.number(),
  totalWorkspaces: z.number(),
  lastUpdated: z.string(),
  additionalMetrics: z.record(z.any()).optional(),
});

/**
 * Update Metrics Input Schema
 *
 * This schema defines the structure of data for updating organization metrics.
 */
export const updateMetricsInputSchema = z.object({
  activeUsers: z.number().optional(),
  totalUsers: z.number().optional(),
  totalWorkspaces: z.number().optional(),
  additionalMetrics: z.record(z.any()).optional(),
});

/**
 * Organization Activity Schema
 *
 * This schema defines the structure of organization activity data.
 */
export const orgActivitySchema = z.object({
  id: z.string(),
  orgId: z.string(),
  userId: z.string(),
  action: z.string(),
  resourceType: z.string(),
  resourceId: z.string(),
  timestamp: z.string(),
  metadata: z.record(z.any()).optional(),
});

/**
 * Record Activity Input Schema
 *
 * This schema defines the structure of data for recording organization activity.
 */
export const recordActivityInputSchema = z.object({
  orgId: z.string(),
  userId: z.string(),
  action: z.string(),
  resourceType: z.string(),
  resourceId: z.string(),
  metadata: z.record(z.any()).optional(),
});

/**
 * Organization Workspace Schema
 *
 * This schema defines the structure of organization workspace data.
 */
export const orgWorkspaceSchema = z.object({
  id: z.string(),
  orgId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  createdBy: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  metadata: z.record(z.any()).optional(),
});

/**
 * Create Workspace Input Schema
 *
 * This schema defines the structure of data for creating an organization workspace.
 */
export const createWorkspaceInputSchema = z.object({
  orgId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  createdBy: z.string(),
  metadata: z.record(z.any()).optional(),
});

/**
 * Update Workspace Input Schema
 *
 * This schema defines the structure of data for updating an organization workspace.
 */
export const updateWorkspaceInputSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});
