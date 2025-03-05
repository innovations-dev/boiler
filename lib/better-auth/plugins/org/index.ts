/**
 * Organization Plugin
 *
 * This file provides the main plugin for the organization functionality.
 * It extends Better Auth with organization-specific functionality.
 *
 * @fileoverview
 * The organization plugin extends Better Auth with organization-specific
 * functionality, including metrics, activity, and workspace management.
 * It registers endpoints and schemas for the organization functionality.
 *
 * This plugin is part of the Better Auth plugin architecture, which allows
 * extending Better Auth with additional functionality.
 */

import { endpoints } from './endpoints';
import * as schemas from './schemas';

/**
 * Organization Plugin
 *
 * This function returns a plugin that extends Better Auth with
 * organization-specific functionality.
 *
 * @returns The organization plugin
 */
export function orgPlugin(): any {
  return {
    setup: ({ registerEndpoints, registerSchemas }: any) => {
      // Register endpoints
      registerEndpoints(endpoints);

      // Register schemas
      registerSchemas({
        orgMetrics: schemas.orgMetricsSchema,
        updateMetricsInput: schemas.updateMetricsInputSchema,
        orgActivity: schemas.orgActivitySchema,
        recordActivityInput: schemas.recordActivityInputSchema,
        orgWorkspace: schemas.orgWorkspaceSchema,
        createWorkspaceInput: schemas.createWorkspaceInputSchema,
        updateWorkspaceInput: schemas.updateWorkspaceInputSchema,
      });

      return {
        // Plugin-specific functionality (if needed)
      };
    },
  };
}
