/**
 * Organization Extensions Client Plugin
 *
 * This file defines the client plugin for organization extensions.
 * It provides a typed interface for interacting with the server plugin.
 *
 * @fileoverview
 * The client plugin provides a typed interface for interacting with the organization
 * extensions server plugin. It automatically infers types from the server plugin
 * and provides methods for accessing the plugin's functionality from the client.
 *
 * @example
 * // Client-side usage
 * import { createAuthClient } from 'better-auth/client';
 * import { organizationExtensionsClientPlugin } from './lib/better-auth/plugins/organization-extensions/client';
 *
 * const client = createAuthClient({
 *   plugins: [organizationExtensionsClientPlugin()]
 * });
 *
 * // Get metrics for an organization
 * const metrics = await client.$fetch(`/organization-extensions/metrics/${organizationId}`);
 */

import { PLUGIN_ID } from './index';

/**
 * Organization extensions client plugin
 *
 * This function creates a client plugin for the organization extensions server plugin.
 * It provides a typed interface for interacting with the server plugin.
 *
 * @returns The organization extensions client plugin
 *
 * @example
 * // Client-side usage
 * import { createAuthClient } from 'better-auth/client';
 * import { organizationExtensionsClientPlugin } from './lib/better-auth/plugins/organization-extensions/client';
 *
 * const client = createAuthClient({
 *   plugins: [organizationExtensionsClientPlugin()]
 * });
 *
 * // Example: Get metrics for an organization
 * const metrics = await client.$fetch(`/organization-extensions/metrics/${organizationId}`);
 *
 * // Example: Record activity
 * await client.$fetch(`/organization-extensions/activity/${organizationId}`, {
 *   method: 'POST',
 *   body: {
 *     organizationId,
 *     userId: 'user-123',
 *     action: 'created',
 *     resourceType: 'workspace',
 *     resourceId: 'workspace-123'
 *   }
 * });
 */
export const organizationExtensionsClientPlugin = () => {
  return {
    id: PLUGIN_ID,
  };
};
