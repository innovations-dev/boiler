/**
 * Organization Extensions Schema
 *
 * This file defines the database schema for the organization extensions plugin.
 * It extends the core Better Auth organization functionality with additional tables.
 */

import { z } from 'zod';

/**
 * Database schema for the organization extensions plugin
 */
export const schema = {
  organizationMetrics: {
    id: { type: 'string', required: true },
    organizationId: {
      type: 'string',
      required: true,
      references: 'organizations.id',
    },
    activeUsers: { type: 'number', default: 0 },
    totalWorkspaces: { type: 'number', default: 0 },
    storageUsed: { type: 'number', default: 0 },
    lastUpdated: { type: 'date', default: () => new Date() },
  },

  organizationActivity: {
    id: { type: 'string', required: true },
    organizationId: {
      type: 'string',
      required: true,
      references: 'organizations.id',
    },
    userId: { type: 'string', required: true, references: 'users.id' },
    action: { type: 'string', required: true },
    resourceType: { type: 'string', required: true },
    resourceId: { type: 'string', required: true },
    timestamp: { type: 'date', default: () => new Date() },
    metadata: { type: 'json', default: {} },
  },

  organizationWorkspaces: {
    id: { type: 'string', required: true },
    organizationId: {
      type: 'string',
      required: true,
      references: 'organizations.id',
    },
    name: { type: 'string', required: true },
    description: { type: 'string' },
    createdAt: { type: 'date', default: () => new Date() },
    updatedAt: { type: 'date', default: () => new Date() },
    createdBy: { type: 'string', required: true, references: 'users.id' },
  },
};

/**
 * Zod schema for organization metrics
 */
export const MetricsSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  activeUsers: z.number().default(0),
  totalWorkspaces: z.number().default(0),
  storageUsed: z.number().default(0),
  lastUpdated: z.date().default(() => new Date()),
});

/**
 * Zod schema for organization activity
 */
export const ActivitySchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  userId: z.string(),
  action: z.enum(['created', 'updated', 'deleted', 'accessed']),
  resourceType: z.enum(['workspace', 'document', 'settings']),
  resourceId: z.string(),
  timestamp: z.date().default(() => new Date()),
  metadata: z.record(z.any()).optional(),
});

/**
 * Zod schema for organization workspace
 */
export const WorkspaceSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string(),
});

/**
 * Type definitions derived from Zod schemas
 */
export type OrganizationMetrics = z.infer<typeof MetricsSchema>;
export type OrganizationActivity = z.infer<typeof ActivitySchema>;
export type OrganizationWorkspace = z.infer<typeof WorkspaceSchema>;
