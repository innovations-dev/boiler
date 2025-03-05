/**
 * Organization Workspaces Handlers
 *
 * This file defines the handlers for organization workspace endpoints.
 * It provides functionality for creating, retrieving, updating, and deleting workspaces.
 *
 * @fileoverview
 * The workspace handlers are responsible for managing organization workspaces.
 * They provide endpoints for creating, retrieving, updating, and deleting workspaces
 * within an organization. These handlers ensure proper authentication and
 * authorization before allowing access to workspace data.
 */

import { nanoid } from 'nanoid';
import { z } from 'zod';

import type { BetterAuthContext } from '../context';

/**
 * Input validation schema for creating a workspace
 *
 * This schema validates the request body for the createWorkspace endpoint.
 * It ensures that the workspace data is in the correct format.
 */
const CreateWorkspaceSchema = z.object({
  /** The name of the workspace */
  name: z.string().min(1).max(100),
  /** An optional description of the workspace */
  description: z.string().max(500).optional(),
});

/**
 * Input validation schema for updating a workspace
 *
 * This schema validates the request body for the updateWorkspace endpoint.
 * It ensures that the workspace update data is in the correct format.
 */
const UpdateWorkspaceSchema = z.object({
  /** The updated name of the workspace */
  name: z.string().min(1).max(100).optional(),
  /** The updated description of the workspace */
  description: z.string().max(500).optional(),
});

/**
 * Workspace handlers for the organization extensions plugin
 *
 * These handlers provide endpoints for creating, retrieving, updating, and deleting workspaces.
 */
export const workspaceHandlers = {
  /**
   * Get workspaces for an organization
   *
   * This handler retrieves all workspaces for an organization.
   * It requires authentication and authorization to access the organization.
   *
   * @param ctx - The Better Auth context
   * @returns A response with the organization workspaces
   *
   * @example
   * // Client-side usage
   * const workspaces = await client.$fetch(`/organization-extensions/workspaces/${organizationId}`);
   *
   * @example
   * // Response format
   * [
   *   {
   *     "id": "workspace-123",
   *     "organizationId": "org-123",
   *     "name": "Development",
   *     "description": "Development workspace",
   *     "createdAt": "2023-01-01T00:00:00.000Z",
   *     "updatedAt": "2023-01-01T00:00:00.000Z",
   *     "createdBy": "user-123"
   *   },
   *   // ... more workspaces
   * ]
   */
  async getWorkspaces(ctx: BetterAuthContext) {
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

      // Query the database for workspaces
      const workspaces = await ctx.db.query(
        `SELECT * FROM organization_workspaces WHERE organizationId = ?`,
        [organizationId]
      );

      // Return the workspaces
      return ctx.json(workspaces || []);
    } catch (error) {
      ctx.logger.error('Error getting organization workspaces', error);
      return ctx.internalServerError();
    }
  },

  /**
   * Create a workspace for an organization
   *
   * This handler creates a new workspace for an organization.
   * It requires authentication and authorization to create workspaces.
   *
   * @param ctx - The Better Auth context
   * @returns A response with the created workspace
   *
   * @example
   * // Client-side usage
   * const workspace = await client.$fetch(`/organization-extensions/workspaces/${organizationId}`, {
   *   method: 'POST',
   *   body: {
   *     name: 'New Workspace',
   *     description: 'A new workspace for the organization'
   *   }
   * });
   *
   * @example
   * // Response format
   * {
   *   "id": "workspace-123",
   *   "organizationId": "org-123",
   *   "name": "New Workspace",
   *   "description": "A new workspace for the organization",
   *   "createdAt": "2023-01-01T00:00:00.000Z",
   *   "updatedAt": "2023-01-01T00:00:00.000Z",
   *   "createdBy": "user-123"
   * }
   */
  async createWorkspace(ctx: BetterAuthContext) {
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
      const parseResult = CreateWorkspaceSchema.safeParse(ctx.body);

      if (!parseResult.success) {
        return ctx.badRequest('Invalid workspace data');
      }

      const workspaceData = parseResult.data;
      const now = new Date();

      // Create the workspace
      const workspace = {
        id: nanoid(),
        organizationId,
        name: workspaceData.name,
        description: workspaceData.description,
        createdAt: now,
        updatedAt: now,
        createdBy: ctx.session.userId,
      };

      // Save the workspace to the database
      await ctx.db.query(
        `INSERT INTO organization_workspaces (id, organizationId, name, description, createdAt, updatedAt, createdBy)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          workspace.id,
          workspace.organizationId,
          workspace.name,
          workspace.description,
          workspace.createdAt,
          workspace.updatedAt,
          workspace.createdBy,
        ]
      );

      // Update organization metrics
      await ctx.fetch(`/organization-extensions/metrics/${organizationId}`, {
        method: 'POST',
        body: JSON.stringify({
          totalWorkspaces: '+1', // Increment the workspace count
        }),
      });

      // Return the created workspace
      return ctx.json(workspace);
    } catch (error) {
      ctx.logger.error('Error creating organization workspace', error);
      return ctx.internalServerError();
    }
  },

  /**
   * Get a workspace by ID
   *
   * This handler retrieves a specific workspace by its ID.
   * It requires authentication and authorization to access the workspace.
   *
   * @param ctx - The Better Auth context
   * @returns A response with the workspace
   *
   * @example
   * // Client-side usage
   * const workspace = await client.$fetch(`/organization-extensions/workspaces/detail/${workspaceId}`);
   *
   * @example
   * // Response format
   * {
   *   "id": "workspace-123",
   *   "organizationId": "org-123",
   *   "name": "Development",
   *   "description": "Development workspace",
   *   "createdAt": "2023-01-01T00:00:00.000Z",
   *   "updatedAt": "2023-01-01T00:00:00.000Z",
   *   "createdBy": "user-123"
   * }
   */
  async getWorkspaceById(ctx: BetterAuthContext) {
    try {
      const { id } = ctx.params;

      // Get the workspace
      const workspace = await ctx.db.query(
        `SELECT * FROM organization_workspaces WHERE id = ?`,
        [id]
      );

      if (!workspace) {
        return ctx.notFound();
      }

      // Check if the user has access to this organization
      const hasPermissionResponse = await ctx.fetch(
        `/organization/has-permission?organizationId=${workspace.organizationId}`
      );
      const hasPermission = await hasPermissionResponse.json();

      if (!hasPermission.success) {
        return ctx.unauthorized();
      }

      // Return the workspace
      return ctx.json(workspace);
    } catch (error) {
      ctx.logger.error('Error getting workspace by ID', error);
      return ctx.internalServerError();
    }
  },

  /**
   * Update a workspace
   *
   * This handler updates a specific workspace.
   * It requires authentication and authorization to update the workspace.
   *
   * @param ctx - The Better Auth context
   * @returns A response with the updated workspace
   *
   * @example
   * // Client-side usage
   * const updatedWorkspace = await client.$fetch(`/organization-extensions/workspaces/${workspaceId}`, {
   *   method: 'PATCH',
   *   body: {
   *     name: 'Updated Workspace',
   *     description: 'Updated description'
   *   }
   * });
   *
   * @example
   * // Response format
   * {
   *   "id": "workspace-123",
   *   "organizationId": "org-123",
   *   "name": "Updated Workspace",
   *   "description": "Updated description",
   *   "createdAt": "2023-01-01T00:00:00.000Z",
   *   "updatedAt": "2023-01-02T00:00:00.000Z",
   *   "createdBy": "user-123"
   * }
   */
  async updateWorkspace(ctx: BetterAuthContext) {
    try {
      const { id } = ctx.params;

      // Get the workspace
      const workspace = await ctx.db.query(
        `SELECT * FROM organization_workspaces WHERE id = ?`,
        [id]
      );

      if (!workspace) {
        return ctx.notFound();
      }

      // Check if the user has access to this organization
      const hasPermissionResponse = await ctx.fetch(
        `/organization/has-permission?organizationId=${workspace.organizationId}`
      );
      const hasPermission = await hasPermissionResponse.json();

      if (!hasPermission.success) {
        return ctx.unauthorized();
      }

      // Parse and validate the request body
      const parseResult = UpdateWorkspaceSchema.safeParse(ctx.body);

      if (!parseResult.success) {
        return ctx.badRequest('Invalid workspace data');
      }

      const updateData = parseResult.data;
      const now = new Date();

      // Update the workspace
      const updatedWorkspace = {
        ...workspace,
        name: updateData.name !== undefined ? updateData.name : workspace.name,
        description:
          updateData.description !== undefined
            ? updateData.description
            : workspace.description,
        updatedAt: now,
      };

      // Save the updated workspace to the database
      await ctx.db.query(
        `UPDATE organization_workspaces
         SET name = ?, description = ?, updatedAt = ?
         WHERE id = ?`,
        [
          updatedWorkspace.name,
          updatedWorkspace.description,
          updatedWorkspace.updatedAt,
          updatedWorkspace.id,
        ]
      );

      // Return the updated workspace
      return ctx.json(updatedWorkspace);
    } catch (error) {
      ctx.logger.error('Error updating workspace', error);
      return ctx.internalServerError();
    }
  },

  /**
   * Delete a workspace
   *
   * This handler deletes a specific workspace.
   * It requires authentication and authorization to delete the workspace.
   *
   * @param ctx - The Better Auth context
   * @returns A response indicating success
   *
   * @example
   * // Client-side usage
   * await client.$fetch(`/organization-extensions/workspaces/${workspaceId}`, {
   *   method: 'DELETE'
   * });
   *
   * @example
   * // Response format
   * {
   *   "success": true
   * }
   */
  async deleteWorkspace(ctx: BetterAuthContext) {
    try {
      const { id } = ctx.params;

      // Get the workspace
      const workspace = await ctx.db.query(
        `SELECT * FROM organization_workspaces WHERE id = ?`,
        [id]
      );

      if (!workspace) {
        return ctx.notFound();
      }

      // Check if the user has access to this organization
      const hasPermissionResponse = await ctx.fetch(
        `/organization/has-permission?organizationId=${workspace.organizationId}`
      );
      const hasPermission = await hasPermissionResponse.json();

      if (!hasPermission.success) {
        return ctx.unauthorized();
      }

      // Delete the workspace
      await ctx.db.query(`DELETE FROM organization_workspaces WHERE id = ?`, [
        id,
      ]);

      // Update organization metrics
      await ctx.fetch(
        `/organization-extensions/metrics/${workspace.organizationId}`,
        {
          method: 'POST',
          body: JSON.stringify({
            totalWorkspaces: '-1', // Decrement the workspace count
          }),
        }
      );

      // Return success
      return ctx.json({ success: true });
    } catch (error) {
      ctx.logger.error('Error deleting workspace', error);
      return ctx.internalServerError();
    }
  },
};
