/**
 * Organization Activity Handlers
 *
 * This file defines the handlers for organization activity endpoints.
 * It provides functionality for recording and retrieving organization activity.
 *
 * @fileoverview
 * The activity handlers are responsible for managing organization activity data.
 * They provide endpoints for recording new activity events and retrieving
 * activity history for an organization. These handlers ensure proper authentication
 * and authorization before allowing access to activity data.
 */

import { nanoid } from 'nanoid';
import { z } from 'zod';

import type { BetterAuthContext } from '../context';

/**
 * Input validation schema for recording activity
 *
 * This schema validates the request body for the recordActivity endpoint.
 * It ensures that the activity data is in the correct format.
 */
const RecordActivitySchema = z.object({
  /** The ID of the organization the activity belongs to */
  organizationId: z.string(),
  /** The ID of the user who performed the action */
  userId: z.string(),
  /** The type of action performed */
  action: z.enum(['created', 'updated', 'deleted', 'accessed']),
  /** The type of resource the action was performed on */
  resourceType: z.enum(['workspace', 'document', 'settings']),
  /** The ID of the resource the action was performed on */
  resourceId: z.string(),
  /** Additional metadata about the activity */
  metadata: z.record(z.any()).optional(),
});

/**
 * Input validation schema for activity history options
 */
const ActivityOptionsSchema = z.object({
  limit: z.number().min(1).max(100).optional().default(10),
  offset: z.number().min(0).optional().default(0),
});

/**
 * Activity handlers for the organization extensions plugin
 *
 * These handlers provide endpoints for recording and retrieving organization activity.
 */
export const activityHandlers = {
  /**
   * Record activity for an organization
   *
   * This handler records a new activity event for an organization.
   * It requires authentication and authorization to record activity.
   *
   * @param ctx - The Better Auth context
   * @returns A response with the recorded activity
   *
   * @example
   * // Client-side usage
   * const activity = await client.$fetch(`/organization-extensions/activity/${organizationId}`, {
   *   method: 'POST',
   *   body: {
   *     organizationId: 'org-123',
   *     userId: 'user-123',
   *     action: 'created',
   *     resourceType: 'workspace',
   *     resourceId: 'workspace-123',
   *     metadata: { name: 'New Workspace' }
   *   }
   * });
   *
   * @example
   * // Response format
   * {
   *   "id": "activity-123",
   *   "organizationId": "org-123",
   *   "userId": "user-123",
   *   "action": "created",
   *   "resourceType": "workspace",
   *   "resourceId": "workspace-123",
   *   "timestamp": "2023-01-01T00:00:00.000Z",
   *   "metadata": { "name": "New Workspace" }
   * }
   */
  async recordActivity(ctx: BetterAuthContext) {
    try {
      // Parse and validate the request body
      const parseResult = RecordActivitySchema.safeParse(ctx.body);

      if (!parseResult.success) {
        return ctx.badRequest('Invalid activity data');
      }

      const activityData = parseResult.data;
      const { organizationId } = activityData;

      // Check if the user has access to this organization
      const hasPermissionResponse = await ctx.fetch(
        `/organization/has-permission?organizationId=${organizationId}`
      );
      const hasPermission = await hasPermissionResponse.json();

      if (!hasPermission.success) {
        return ctx.unauthorized();
      }

      // Create the activity record
      const activity = {
        id: nanoid(),
        ...activityData,
        timestamp: new Date(),
      };

      // Save the activity to the database
      await ctx.db.query(
        `INSERT INTO organization_activity (id, organizationId, userId, action, resourceType, resourceId, timestamp, metadata)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          activity.id,
          activity.organizationId,
          activity.userId,
          activity.action,
          activity.resourceType,
          activity.resourceId,
          activity.timestamp,
          activity.metadata ? JSON.stringify(activity.metadata) : null,
        ]
      );

      // Return the created activity
      return ctx.json(activity);
    } catch (error) {
      ctx.logger.error('Error recording organization activity', error);
      return ctx.internalServerError();
    }
  },

  /**
   * Get activity history for an organization
   *
   * This handler retrieves the activity history for an organization.
   * It requires authentication and authorization to access the organization activity.
   *
   * @param ctx - The Better Auth context
   * @returns A response with the organization activity history
   *
   * @example
   * // Client-side usage
   * const activities = await client.$fetch(`/organization-extensions/activity/${organizationId}?limit=10&offset=0`);
   *
   * @example
   * // Response format
   * [
   *   {
   *     "id": "activity-123",
   *     "organizationId": "org-123",
   *     "userId": "user-123",
   *     "action": "created",
   *     "resourceType": "workspace",
   *     "resourceId": "workspace-123",
   *     "timestamp": "2023-01-01T00:00:00.000Z",
   *     "metadata": { "name": "New Workspace" }
   *   },
   *   // ... more activities
   * ]
   */
  async getActivity(ctx: BetterAuthContext) {
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

      // Parse and validate query parameters
      const limit = ctx.query.limit ? parseInt(ctx.query.limit, 10) : 10;
      const offset = ctx.query.offset ? parseInt(ctx.query.offset, 10) : 0;

      // Query the database for activity records
      const activities = await ctx.db.query(
        `SELECT * FROM organization_activity
         WHERE organizationId = ?
         ORDER BY timestamp DESC
         LIMIT ? OFFSET ?`,
        [organizationId, limit, offset]
      );

      // Process the results
      const processedActivities = activities.map((activity: any) => ({
        ...activity,
        metadata: activity.metadata ? JSON.parse(activity.metadata) : null,
      }));

      // Return the activity history
      return ctx.json(processedActivities);
    } catch (error) {
      ctx.logger.error('Error getting organization activity', error);
      return ctx.internalServerError();
    }
  },
};
