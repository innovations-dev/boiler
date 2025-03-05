/**
 * Organization Extensions Plugin
 *
 * This plugin extends Better Auth with organization-specific functionality:
 * - Tracking organization usage metrics
 * - Recording organization activity
 * - Managing workspaces
 *
 * @fileoverview
 * The organization extensions plugin provides additional functionality for organizations
 * beyond what is provided by the core Better Auth package. It includes endpoints for
 * tracking metrics, recording activity, and managing workspaces within organizations.
 *
 * @example
 * // Server-side usage
 * import { betterAuth } from 'better-auth';
 * import { organizationExtensionsPlugin } from './lib/better-auth/plugins/organization-extensions';
 *
 * const auth = betterAuth({
 *   // ... other options
 *   plugins: [
 *     organizationExtensionsPlugin()
 *   ]
 * });
 */

import { endpoints } from './endpoints';

/**
 * The unique identifier for the organization extensions plugin
 *
 * This ID is used to identify the plugin in the Better Auth system.
 */
export const PLUGIN_ID = 'organization-extensions';

/**
 * Organization Extensions Plugin
 *
 * This function creates a plugin that extends Better Auth with organization-specific functionality.
 * It provides endpoints for tracking metrics, recording activity, and managing workspaces.
 *
 * @param options - Plugin configuration options
 * @returns The organization extensions plugin
 *
 * @example
 * // Server-side usage
 * import { betterAuth } from 'better-auth';
 * import { organizationExtensionsPlugin } from './lib/better-auth/plugins/organization-extensions';
 *
 * const auth = betterAuth({
 *   // ... other options
 *   plugins: [
 *     organizationExtensionsPlugin()
 *   ]
 * });
 */
export const organizationExtensionsPlugin = (options = {}) => {
  return {
    id: PLUGIN_ID,
    schema: {},
    endpoints,
  };
};
