/**
 * @fileoverview Unified organization hooks
 * This module exports all organization-related hooks from a single location
 */

// Import and re-export hooks from the legacy location
// These are marked as deprecated and will be removed in a future release
import {
  useCreateOrganizationAction as useCreateOrganizationActionLegacy,
  useCreateOrganization as useCreateOrganizationLegacy,
  useOrganization as useOrganizationLegacy,
  useUserOrganizations as useUserOrganizationsLegacy,
} from '@/hooks/organizations/use-organization';

// Import hooks from use-organization-data.ts
import { useOrganizationData } from './use-organization-data';

// Re-export hooks from use-better-auth-organization.ts
export * from './use-better-auth-organization';

// Re-export hooks from use-organization-extensions.ts
export * from './use-organization-extensions';

// Re-export hooks from use-active-sessions.ts
export * from './use-active-sessions';

// Re-export selected hooks from use-organization-data.ts
export { useOrganizationData };

// Re-export the legacy hooks with deprecation notices
/**
 * @deprecated Use useOrganization from use-better-auth-organization.ts instead.
 * This hook will be removed in a future release.
 */
export const useOrganization = useOrganizationLegacy;

/**
 * @deprecated Use useOrganizations from use-better-auth-organization.ts instead.
 * This hook will be removed in a future release.
 */
export const useUserOrganizations = useUserOrganizationsLegacy;

/**
 * @deprecated Use useCreateOrganization from use-better-auth-organization.ts instead.
 * This hook will be removed in a future release.
 */
export const useCreateOrganization = useCreateOrganizationLegacy;

/**
 * @deprecated Use useCreateOrganization from use-better-auth-organization.ts instead.
 * This hook will be removed in a future release.
 */
export const useCreateOrganizationAction = useCreateOrganizationActionLegacy;

// Note: In a future update, we should move all hooks to this directory
// and remove the duplicate hooks from hooks/organizations/use-organization.ts
