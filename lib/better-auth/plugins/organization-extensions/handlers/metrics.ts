/**
 * Organization Metrics Handlers
 *
 * This file defines the handlers for organization metrics endpoints.
 * It provides functionality for retrieving and updating organization metrics.
 *
 * @fileoverview
 * The metrics handlers are responsible for managing organization metrics data.
 * They provide endpoints for retrieving current metrics and updating metrics
 * for an organization. These handlers ensure proper authentication and
 * authorization before allowing access to metrics data.
 */

import { nanoid } from 'nanoid';
import { z } from 'zod';

import type { BetterAuthContext } from '../context';

/**
 * Input validation schema for updating metrics
 *
 * This schema validates the request body for the updateMetrics endpoint.
 * It ensures that the metrics data is in the correct format.
 */
const UpdateMetricsSchema = z.object({
  /** Number of active users in the organization */
  activeUsers: z.number().optional(),
  /** Total number of workspaces in the organization */
  totalWorkspaces: z.number().optional(),
  /** Total storage used by the organization in bytes */
  storageUsed: z.number().optional(),
});

/**
 * Metrics handlers for the organization extensions plugin
 *
 * These handlers provide endpoints for retrieving and updating organization metrics.
 */
export const metricsHandlers = {
  /**
   * Get metrics for an organization
   *
   * This handler retrieves the current metrics for an organization.
   * It requires authentication and authorization to access the organization.
   *
   * @param ctx - The Better Auth context
   * @returns A response with the organization metrics
   *
   * @example
   * // Client-side usage
   * const metrics = await client.$fetch(`/organization-extensions/metrics/${organizationId}`);
   *
   * @example
   * // Response format
   * {
   *   "id": "metrics-123",
   *   "organizationId": "org-123",
   *   "activeUsers": 10,
   *   "totalWorkspaces": 5,
   *   "storageUsed": 1024000,
   *   "lastUpdated": "2023-01-01T00:00:00.000Z"
   * }
   */
  async getMetrics(ctx: BetterAuthContext) {
    try {
      const { organizationId } = ctx.params;

      // Check if the user has access to this organization
      const hasPermissionResponse = await ctx.fetch(
        `/organization/has-permission?organizationId=${organizationId}`
      );
      const hasPermission = await hasPermissionResponse.json();

      if (!hasPermission.success) {
        return ctx.unauthorized();
      }

      // Log the request for monitoring
      ctx.logger.info(`Getting metrics for organization: ${organizationId}`, {
        userId: ctx.session.userId,
      });

      // Query the database for metrics
      const metrics = await ctx.db.query(
        `SELECT * FROM organization_metrics WHERE organizationId = ?`,
        [organizationId]
      );

      // If no metrics exist, create default metrics
      if (!metrics) {
        const defaultMetrics = {
          id: nanoid(),
          organizationId,
          activeUsers: 0,
          totalWorkspaces: 0,
          storageUsed: 0,
          lastUpdated: new Date(),
        };

        // Save default metrics to database
        await ctx.db.query(
          `INSERT INTO organization_metrics (id, organizationId, activeUsers, totalWorkspaces, storageUsed, lastUpdated)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            defaultMetrics.id,
            defaultMetrics.organizationId,
            defaultMetrics.activeUsers,
            defaultMetrics.totalWorkspaces,
            defaultMetrics.storageUsed,
            defaultMetrics.lastUpdated,
          ]
        );

        return ctx.json(defaultMetrics);
      }

      // Return the metrics
      return ctx.json(metrics);
    } catch (error) {
      ctx.logger.error('Error getting organization metrics', error);
      return ctx.internalServerError();
    }
  },

  /**
   * Update metrics for an organization
   *
   * This handler updates the metrics for an organization.
   * It requires authentication and authorization to update the organization metrics.
   *
   * @param ctx - The Better Auth context
   * @returns A response with the updated organization metrics
   *
   * @example
   * // Client-side usage
   * const updatedMetrics = await client.$fetch(`/organization-extensions/metrics/${organizationId}`, {
   *   method: 'POST',
   *   body: {
   *     activeUsers: 15,
   *     totalWorkspaces: 8,
   *     storageUsed: 2048000
   *   }
   * });
   *
   * @example
   * // Response format
   * {
   *   "id": "metrics-123",
   *   "organizationId": "org-123",
   *   "activeUsers": 15,
   *   "totalWorkspaces": 8,
   *   "storageUsed": 2048000,
   *   "lastUpdated": "2023-01-01T00:00:00.000Z"
   * }
   */
  async updateMetrics(ctx: BetterAuthContext) {
    try {
      const { organizationId } = ctx.params;

      // Check if the user has access to this organization
      const hasPermissionResponse = await ctx.fetch(
        `/organization/has-permission?organizationId=${organizationId}`
      );
      const hasPermission = await hasPermissionResponse.json();

      if (!hasPermission.success) {
        return ctx.unauthorized();
      }

      // Parse and validate the request body
      const parseResult = UpdateMetricsSchema.safeParse(ctx.body);

      if (!parseResult.success) {
        return ctx.badRequest('Invalid metrics data');
      }

      const updateData = parseResult.data;

      // Get current metrics
      const currentMetrics = await ctx.db.query(
        `SELECT * FROM organization_metrics WHERE organizationId = ?`,
        [organizationId]
      );

      // If no metrics exist, create them
      if (!currentMetrics) {
        const newMetrics = {
          id: nanoid(),
          organizationId,
          activeUsers: updateData.activeUsers || 0,
          totalWorkspaces: updateData.totalWorkspaces || 0,
          storageUsed: updateData.storageUsed || 0,
          lastUpdated: new Date(),
        };

        // Save new metrics to database
        await ctx.db.query(
          `INSERT INTO organization_metrics (id, organizationId, activeUsers, totalWorkspaces, storageUsed, lastUpdated)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            newMetrics.id,
            newMetrics.organizationId,
            newMetrics.activeUsers,
            newMetrics.totalWorkspaces,
            newMetrics.storageUsed,
            newMetrics.lastUpdated,
          ]
        );

        return ctx.json(newMetrics);
      }

      // Update existing metrics
      const updatedMetrics = {
        ...currentMetrics,
        activeUsers:
          updateData.activeUsers !== undefined
            ? updateData.activeUsers
            : currentMetrics.activeUsers,
        totalWorkspaces:
          updateData.totalWorkspaces !== undefined
            ? updateData.totalWorkspaces
            : currentMetrics.totalWorkspaces,
        storageUsed:
          updateData.storageUsed !== undefined
            ? updateData.storageUsed
            : currentMetrics.storageUsed,
        lastUpdated: new Date(),
      };

      // Save updated metrics to database
      await ctx.db.query(
        `UPDATE organization_metrics
         SET activeUsers = ?, totalWorkspaces = ?, storageUsed = ?, lastUpdated = ?
         WHERE id = ?`,
        [
          updatedMetrics.activeUsers,
          updatedMetrics.totalWorkspaces,
          updatedMetrics.storageUsed,
          updatedMetrics.lastUpdated,
          updatedMetrics.id,
        ]
      );

      // Return the updated metrics
      return ctx.json(updatedMetrics);
    } catch (error) {
      ctx.logger.error('Error updating organization metrics', error);
      return ctx.internalServerError();
    }
  },
};
