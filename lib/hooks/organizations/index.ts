/**
 * Organization Hooks
 *
 * This file exports all organization-related hooks.
 * These hooks provide a clean interface for accessing organization data
 * and managing organization state.
 */

// Re-export hooks from use-better-auth-organization.ts
export {
  useOrganization,
  useOrganizations,
  useOrganizationMember,
  useOrganizationPermission,
} from './use-better-auth-organization';

// Re-export hooks from use-organization-extensions.ts
export {
  useOrganizationMetrics,
  useOrganizationActivity,
  useOrganizationWorkspaces,
  useOrganizationWorkspace,
} from './use-organization-extensions';

/**
 * Organization Hooks
 *
 * These hooks provide a clean interface for accessing organization data
 * and managing organization state. They use the new service implementation
 * and provide proper error handling and loading states.
 *
 * Available hooks:
 * - useOrganization - Get organization data by slug
 * - useOrganizations - Get all organizations for the current user
 * - useOrganizationMember - Get member data for a specific user
 * - useOrganizationPermission - Check if a user has a specific permission
 * - useOrganizationMetrics - Get organization metrics
 * - useOrganizationActivity - Get organization activity
 * - useOrganizationWorkspaces - Get organization workspaces
 * - useOrganizationWorkspace - Get a specific workspace
 */
