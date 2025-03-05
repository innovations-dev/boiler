/**
 * Organization Client Plugin
 *
 * This file provides the client-side plugin for the organization functionality.
 * It extends the Better Auth client with organization-specific functionality.
 *
 * @fileoverview
 * The organization client plugin extends the Better Auth client with
 * organization-specific functionality, including metrics, activity, and
 * workspace management. It provides a consistent interface for interacting
 * with the organization functionality from the client side.
 *
 * This plugin is part of the Better Auth plugin architecture, which allows
 * extending the Better Auth client with additional functionality.
 */

/**
 * Organization Client Plugin
 *
 * This function returns a client plugin that extends the Better Auth client
 * with organization-specific functionality.
 *
 * @returns The organization client plugin
 */
export function orgClientPlugin(): any {
  return {
    name: 'org',
    setup: ({ client }: any) => {
      // Extend the client with organization-specific functionality
      return {
        // The plugin doesn't need to add any specific functionality
        // to the client, as the adapter will use the client's fetch
        // method directly. This is just a placeholder to register
        // the plugin with the Better Auth client.
      };
    },
  };
}
