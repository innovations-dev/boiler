/**
 * Organization Schemas
 *
 * This file provides Zod schemas for validating organization-related data.
 * These schemas are used for validating request and response data in the
 * organization service, ensuring type safety and data integrity.
 *
 * @fileoverview
 * The schemas defined here correspond to the TypeScript interfaces in lib/types/org.ts
 * and are used for validation in React Query hooks and server actions.
 */

import { z } from 'zod';

/**
 * Schema for organization metrics
 */
export const orgMetricsSchema = z.object({
  id: z.string(),
  orgId: z.string(),
  activeUsers: z
    .union([z.string(), z.number().int().nonnegative()])
    .transform((val) => (typeof val === 'string' ? parseInt(val, 10) : val)),
  totalUsers: z
    .union([z.string(), z.number().int().nonnegative()])
    .transform((val) => (typeof val === 'string' ? parseInt(val, 10) : val)),
  totalWorkspaces: z
    .union([z.string(), z.number().int().nonnegative()])
    .transform((val) => (typeof val === 'string' ? parseInt(val, 10) : val)),
  lastUpdated: z
    .union([z.string(), z.date()])
    .transform((val) => (typeof val === 'string' ? val : val.toISOString())),
  additionalMetrics: z.record(z.any()).optional(),
});

export type OrgMetricsSchema = z.infer<typeof orgMetricsSchema>;

/**
 * Schema for updating organization metrics
 */
export const updateMetricsInputSchema = z.object({
  activeUsers: z.union([z.string(), z.number().int().nonnegative()]).optional(),
  totalUsers: z.union([z.string(), z.number().int().nonnegative()]).optional(),
  totalWorkspaces: z
    .union([z.string(), z.number().int().nonnegative()])
    .optional(),
  additionalMetrics: z.record(z.any()).optional(),
});

export type UpdateMetricsInputSchema = z.infer<typeof updateMetricsInputSchema>;

/**
 * Schema for organization activity
 */
export const orgActivitySchema = z.object({
  id: z.string(),
  orgId: z.string(),
  userId: z.string(),
  action: z.string(),
  resourceType: z.string(),
  resourceId: z.string(),
  metadata: z.record(z.any()).optional(),
  timestamp: z
    .union([z.string().datetime(), z.date()])
    .transform((val) => (typeof val === 'string' ? val : val.toISOString())),
});

export type OrgActivitySchema = z.infer<typeof orgActivitySchema>;

/**
 * Schema for recording organization activity
 */
export const recordActivityInputSchema = z.object({
  orgId: z.string(),
  userId: z.string(),
  action: z.string(),
  resourceType: z.string(),
  resourceId: z.string(),
  metadata: z.record(z.any()).optional(),
});

export type RecordActivityInputSchema = z.infer<
  typeof recordActivityInputSchema
>;

/**
 * Schema for organization workspace
 */
export const orgWorkspaceSchema = z.object({
  id: z.string(),
  orgId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  createdBy: z.string(),
  createdAt: z
    .union([z.string().datetime(), z.date()])
    .transform((val) => (typeof val === 'string' ? val : val.toISOString())),
  updatedAt: z
    .union([z.string().datetime(), z.date()])
    .transform((val) => (typeof val === 'string' ? val : val.toISOString()))
    .optional(),
  metadata: z.record(z.any()).optional(),
});

export type OrgWorkspaceSchema = z.infer<typeof orgWorkspaceSchema>;

/**
 * Schema for creating an organization workspace
 */
export const createWorkspaceInputSchema = z.object({
  orgId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  createdBy: z.string(),
  metadata: z.record(z.any()).optional(),
});

export type CreateWorkspaceInputSchema = z.infer<
  typeof createWorkspaceInputSchema
>;

/**
 * Schema for updating an organization workspace
 */
export const updateWorkspaceInputSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export type UpdateWorkspaceInputSchema = z.infer<
  typeof updateWorkspaceInputSchema
>;

/**
 * Schema for pagination options
 */
export const paginationOptionsSchema = z.object({
  limit: z.number().int().positive().optional(),
  offset: z.number().int().nonnegative().optional(),
});

export type PaginationOptionsSchema = z.infer<typeof paginationOptionsSchema>;
