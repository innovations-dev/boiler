/**
 * Organization Extensions Schema
 *
 * This file defines the database schema for organization extensions
 * using Drizzle ORM.
 */

import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

/**
 * Organization Metrics Table
 *
 * Stores aggregated metrics for organizations
 */
export const organizationMetrics = sqliteTable('organization_metrics', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull(),
  totalMembers: integer('total_members').notNull().default(0),
  activeMembers: integer('active_members').notNull().default(0),
  pendingInvitations: integer('pending_invitations').notNull().default(0),
  activeSessions: integer('active_sessions').notNull().default(0),
  lastActivityAt: text('last_activity_at').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

/**
 * Organization Activities Table
 *
 * Tracks activities within organizations
 */
export const organizationActivities = sqliteTable('organization_activities', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull(),
  userId: text('user_id').notNull(),
  action: text('action').notNull(),
  details: text('details').notNull(), // JSON string
  user: text('user'), // JSON string of user data
  createdAt: text('created_at').notNull(),
});

/**
 * Organization Workspaces Table
 *
 * Manages workspaces within organizations
 */
export const organizationWorkspaces = sqliteTable('organization_workspaces', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

/**
 * Organization Custom Permissions Table
 *
 * Stores custom permissions for users on specific resources
 */
export const organizationCustomPermissions = sqliteTable(
  'organization_custom_permissions',
  {
    id: text('id').primaryKey(),
    organizationId: text('organization_id').notNull(),
    userId: text('user_id').notNull(),
    resourceType: text('resource_type').notNull(),
    resourceId: text('resource_id').notNull(),
    permissionLevel: text('permission_level').notNull(),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
    createdBy: text('created_by').notNull(),
  }
);
