/**
 * Organization Extensions Types
 *
 * This file defines the types for the organization extensions plugin.
 * These types extend the core Better Auth organization functionality.
 */

/**
 * Organization metrics data
 */
export interface OrganizationMetrics {
  id: string;
  organizationId: string;
  activeUsers: number;
  totalWorkspaces: number;
  storageUsed: number;
  lastUpdated: Date;
}

/**
 * Organization activity data
 */
export interface OrganizationActivity {
  id: string;
  organizationId: string;
  userId: string;
  action: 'created' | 'updated' | 'deleted' | 'accessed';
  resourceType: 'workspace' | 'document' | 'settings';
  resourceId: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

/**
 * Organization workspace data
 */
export interface OrganizationWorkspace {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

/**
 * Input for creating a workspace
 */
export type CreateWorkspaceInput = Omit<
  OrganizationWorkspace,
  'id' | 'createdAt' | 'updatedAt'
>;

/**
 * Input for updating a workspace
 */
export type UpdateWorkspaceInput = Partial<
  Omit<
    OrganizationWorkspace,
    'id' | 'organizationId' | 'createdAt' | 'updatedAt' | 'createdBy'
  >
>;

/**
 * Input for updating organization metrics
 */
export type UpdateMetricsInput = Partial<
  Omit<OrganizationMetrics, 'id' | 'organizationId' | 'lastUpdated'>
>;

/**
 * Input for recording organization activity
 */
export type RecordActivityInput = Omit<
  OrganizationActivity,
  'id' | 'timestamp'
>;
