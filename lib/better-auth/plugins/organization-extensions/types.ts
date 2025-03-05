/**
 * Organization Extensions Types
 *
 * This file imports and re-exports the types from the main types directory
 * for use within the organization extensions plugin.
 */

import type {
  CreateWorkspaceInput,
  OrganizationActivity,
  OrganizationMetrics,
  OrganizationWorkspace,
  RecordActivityInput,
  UpdateMetricsInput,
  UpdateWorkspaceInput,
} from '../../../types/organization-extensions';

// Re-export the types
export type {
  OrganizationMetrics,
  OrganizationActivity,
  OrganizationWorkspace,
  CreateWorkspaceInput,
  UpdateWorkspaceInput,
  UpdateMetricsInput,
  RecordActivityInput,
};
