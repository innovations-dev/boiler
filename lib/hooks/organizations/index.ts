// Import and re-export hooks from the other location
import {
  useCreateOrganization,
  useCreateOrganizationAction,
  useOrganization,
  useUserOrganizations,
} from '@/hooks/organizations/use-organization';

/**
 * @fileoverview Unified organization hooks
 * This module exports all organization-related hooks from a single location
 */

// Re-export all hooks from their respective files
export * from './use-organization-data';
export * from './use-active-sessions';

// Re-export the hooks
export {
  useOrganization,
  useUserOrganizations,
  useCreateOrganization,
  useCreateOrganizationAction,
};

// Note: In a future update, we should move all hooks to this directory
// and remove the duplicate hooks from hooks/organizations/use-organization.ts
