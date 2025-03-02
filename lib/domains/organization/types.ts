/**
 * Organization Domain Types
 *
 * This file defines the domain types for organization extensions.
 * These types are independent of any specific implementation and
 * represent the core business entities and their relationships.
 */

import { Organization } from '@/lib/better-auth/organization';

/**
 * Organization metrics data
 */
export interface OrganizationMetrics {
  totalMembers: number;
  activeMembers: number;
  pendingInvitations: number;
  activeSessions: number;
  lastActivityAt: string;
}

/**
 * Organization activity record
 */
export interface OrganizationActivity {
  id: string;
  organizationId: string;
  userId: string;
  type: OrganizationActivityType;
  details: Record<string, any>;
  createdAt: string;
  user?: {
    id: string;
    name?: string;
    email?: string;
    image?: string;
  };
}

/**
 * Organization workspace
 */
export interface OrganizationWorkspace {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

/**
 * Enhanced organization with additional data
 */
export interface EnhancedOrganization extends Organization {
  metrics?: OrganizationMetrics;
  workspaces?: OrganizationWorkspace[];
}

/**
 * Organization activity type
 */
export enum OrganizationActivityType {
  MEMBER_ADDED = 'member_added',
  MEMBER_REMOVED = 'member_removed',
  MEMBER_ROLE_UPDATED = 'member_role_updated',
  ORGANIZATION_UPDATED = 'organization_updated',
  WORKSPACE_CREATED = 'workspace_created',
  WORKSPACE_UPDATED = 'workspace_updated',
  WORKSPACE_DELETED = 'workspace_deleted',
}

/**
 * Request to create a new workspace
 */
export interface CreateWorkspaceRequest {
  organizationId: string;
  name: string;
  createdBy: string;
}

/**
 * Request to update a workspace
 */
export interface UpdateWorkspaceRequest {
  id: string;
  organizationId: string;
  name?: string;
  updatedBy: string;
}

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  data?: T;
  error?: {
    message: string;
    code?: string;
    statusCode?: number;
  };
  success: boolean;
}

/**
 * Enum for resource types that can have permissions
 */
export enum ResourceType {
  ORGANIZATION = 'organization',
  WORKSPACE = 'workspace',
  PROJECT = 'project',
}

/**
 * Enum for permission levels
 */
export enum PermissionLevel {
  NONE = 'none',
  VIEWER = 'viewer',
  EDITOR = 'editor',
  ADMIN = 'admin',
  OWNER = 'owner',
}

/**
 * Mapping of permission levels to the actions they can perform
 */
export const PERMISSION_LEVEL_TO_ACTIONS = {
  [PermissionLevel.NONE]: [],
  [PermissionLevel.VIEWER]: ['view'],
  [PermissionLevel.EDITOR]: ['view', 'edit'],
  [PermissionLevel.ADMIN]: ['view', 'edit', 'manage'],
  [PermissionLevel.OWNER]: ['view', 'edit', 'manage', 'delete'],
};

/**
 * Mapping of roles to their permissions on different resources
 */
export const ROLE_RESOURCE_PERMISSIONS = {
  owner: {
    [ResourceType.ORGANIZATION]: PermissionLevel.OWNER,
    [ResourceType.WORKSPACE]: PermissionLevel.OWNER,
    [ResourceType.PROJECT]: PermissionLevel.OWNER,
  },
  admin: {
    [ResourceType.ORGANIZATION]: PermissionLevel.ADMIN,
    [ResourceType.WORKSPACE]: PermissionLevel.ADMIN,
    [ResourceType.PROJECT]: PermissionLevel.ADMIN,
  },
  member: {
    [ResourceType.ORGANIZATION]: PermissionLevel.EDITOR,
    [ResourceType.WORKSPACE]: PermissionLevel.EDITOR,
    [ResourceType.PROJECT]: PermissionLevel.VIEWER,
  },
  guest: {
    [ResourceType.ORGANIZATION]: PermissionLevel.VIEWER,
    [ResourceType.WORKSPACE]: PermissionLevel.VIEWER,
    [ResourceType.PROJECT]: PermissionLevel.NONE,
  },
};
