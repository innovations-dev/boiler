/**
 * Organization Domain Repository Implementation
 *
 * This file implements the repository interfaces for organization extensions
 * using direct database access with Drizzle ORM and Turso.
 */

import { desc, eq, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';

import {
  betterAuthClient,
  handleBetterFetchError,
} from '@/lib/better-auth/client';
import { Organization } from '@/lib/better-auth/organization';
import { db } from '@/lib/db';
// Import schema from the main schema file
import {
  member,
  organizationActivities,
  organizationCustomPermissions,
  organizationMetrics,
  organizationWorkspaces,
} from '@/lib/db/schema';
import { logger } from '@/lib/logger';

import { OrganizationExtensionsRepository } from './repositories';
import {
  CreateWorkspaceRequest,
  EnhancedOrganization,
  OrganizationActivity,
  OrganizationMetrics,
  OrganizationWorkspace,
  PERMISSION_LEVEL_TO_ACTIONS,
  PermissionLevel,
  ResourceType,
  UpdateWorkspaceRequest,
} from './types';

/**
 * Database repository implementation for organization extensions
 */
export class DbOrganizationExtensionsRepository
  implements OrganizationExtensionsRepository
{
  /**
   * Get metrics for an organization
   */
  async getMetrics(organizationId: string): Promise<OrganizationMetrics> {
    try {
      logger.debug('Getting organization metrics from DB', { organizationId });

      // Get metrics from the database
      const metricsResult = await db.query.organizationMetrics.findFirst({
        where: eq(organizationMetrics.organizationId, organizationId),
      });

      if (!metricsResult) {
        // If no metrics exist, calculate them
        const [
          totalMembersResult,
          activeMembersResult,
          pendingInvitationsResult,
          activeSessionsResult,
        ] = await Promise.all([
          // These queries would need to be implemented based on your schema
          db
            .select({ count: sql<number>`count(*)` })
            .from(sql`organization_members`)
            .where(sql`organization_id = ${organizationId}`)
            .execute(),
          db
            .select({ count: sql<number>`count(*)` })
            .from(sql`organization_members`)
            .where(
              sql`organization_id = ${organizationId} AND last_active_at > date('now', '-30 day')`
            )
            .execute(),
          db
            .select({ count: sql<number>`count(*)` })
            .from(sql`organization_invitations`)
            .where(
              sql`organization_id = ${organizationId} AND status = 'pending'`
            )
            .execute(),
          db
            .select({ count: sql<number>`count(*)` })
            .from(sql`sessions`)
            .where(
              sql`organization_id = ${organizationId} AND expires_at > datetime('now')`
            )
            .execute(),
        ]);

        const metrics: OrganizationMetrics = {
          totalMembers: totalMembersResult[0]?.count || 0,
          activeMembers: activeMembersResult[0]?.count || 0,
          pendingInvitations: pendingInvitationsResult[0]?.count || 0,
          activeSessions: activeSessionsResult[0]?.count || 0,
          lastActivityAt: new Date().toISOString(),
        };

        // Store the metrics for future use
        await db.insert(organizationMetrics).values({
          id: nanoid(),
          organizationId,
          totalMembers: metrics.totalMembers,
          activeMembers: metrics.activeMembers,
          pendingInvitations: metrics.pendingInvitations,
          activeSessions: metrics.activeSessions,
          lastActivityAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        return metrics;
      }

      return {
        totalMembers: metricsResult.totalMembers,
        activeMembers: metricsResult.activeMembers,
        pendingInvitations: metricsResult.pendingInvitations,
        activeSessions: metricsResult.activeSessions,
        lastActivityAt: metricsResult.lastActivityAt,
      };
    } catch (error) {
      logger.error('Failed to get organization metrics from DB', {
        organizationId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Get activity for an organization
   */
  async getActivity(
    organizationId: string,
    limit: number = 10
  ): Promise<OrganizationActivity[]> {
    try {
      logger.debug('Getting organization activity from DB', {
        organizationId,
        limit,
      });

      // Get activity from the database
      const activities = await db.query.organizationActivities.findMany({
        where: eq(organizationActivities.organizationId, organizationId),
        orderBy: [desc(organizationActivities.createdAt)],
        limit,
      });

      // Map to the domain model
      return activities.map((activity) => ({
        id: activity.id,
        organizationId: activity.organizationId,
        userId: activity.userId,
        action: activity.action,
        details: JSON.parse(activity.details),
        createdAt: activity.createdAt,
        user: activity.user ? JSON.parse(activity.user) : undefined,
      }));
    } catch (error) {
      logger.error('Failed to get organization activity from DB', {
        organizationId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Create a new activity record
   */
  async createActivity(
    activity: Omit<OrganizationActivity, 'id' | 'createdAt'>
  ): Promise<OrganizationActivity> {
    try {
      logger.debug('Creating organization activity in DB', { activity });

      const now = new Date().toISOString();
      const id = nanoid();

      // Insert into the database
      await db.insert(organizationActivities).values({
        id,
        organizationId: activity.organizationId,
        userId: activity.userId,
        action: activity.action,
        details: JSON.stringify(activity.details),
        user: activity.user ? JSON.stringify(activity.user) : null,
        createdAt: now,
      });

      // Return the created activity
      return {
        id,
        organizationId: activity.organizationId,
        userId: activity.userId,
        action: activity.action,
        details: activity.details,
        createdAt: now,
        user: activity.user,
      };
    } catch (error) {
      logger.error('Failed to create organization activity in DB', {
        activity,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Get workspaces for an organization
   */
  async getWorkspaces(
    organizationId: string
  ): Promise<OrganizationWorkspace[]> {
    try {
      logger.debug('Getting organization workspaces from DB', {
        organizationId,
      });

      // Get workspaces from the database
      const workspaces = await db.query.organizationWorkspaces.findMany({
        where: eq(organizationWorkspaces.organizationId, organizationId),
      });

      // Map to the domain model
      return workspaces.map((workspace) => ({
        id: workspace.id,
        organizationId: workspace.organizationId,
        name: workspace.name,
        description: workspace.description || undefined,
        createdAt: workspace.createdAt,
        updatedAt: workspace.updatedAt,
      }));
    } catch (error) {
      logger.error('Failed to get organization workspaces from DB', {
        organizationId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Get a workspace by ID
   */
  async getWorkspace(workspaceId: string): Promise<OrganizationWorkspace> {
    try {
      logger.debug('Getting workspace from DB', { workspaceId });

      // Get workspace from the database
      const workspace = await db.query.organizationWorkspaces.findFirst({
        where: eq(organizationWorkspaces.id, workspaceId),
      });

      if (!workspace) {
        throw new Error(`Workspace not found: ${workspaceId}`);
      }

      // Map to the domain model
      return {
        id: workspace.id,
        organizationId: workspace.organizationId,
        name: workspace.name,
        description: workspace.description || undefined,
        createdAt: workspace.createdAt,
        updatedAt: workspace.updatedAt,
      };
    } catch (error) {
      logger.error('Failed to get workspace from DB', {
        workspaceId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Create a new workspace
   */
  async createWorkspace(
    data: CreateWorkspaceRequest
  ): Promise<OrganizationWorkspace> {
    try {
      logger.debug('Creating workspace in DB', { data });

      const now = new Date().toISOString();
      const id = nanoid();

      // Insert into the database
      await db.insert(organizationWorkspaces).values({
        id,
        organizationId: data.organizationId,
        name: data.name,
        description: data.description || null,
        createdAt: now,
        updatedAt: now,
      });

      // Return the created workspace
      return {
        id,
        organizationId: data.organizationId,
        name: data.name,
        description: data.description,
        createdAt: now,
        updatedAt: now,
      };
    } catch (error) {
      logger.error('Failed to create workspace in DB', {
        data,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Update a workspace
   */
  async updateWorkspace(
    data: UpdateWorkspaceRequest
  ): Promise<OrganizationWorkspace> {
    try {
      logger.debug('Updating workspace in DB', { data });

      // Get the existing workspace
      const existingWorkspace = await this.getWorkspace(data.workspaceId);
      const now = new Date().toISOString();

      // Update in the database
      await db
        .update(organizationWorkspaces)
        .set({
          name: data.name || existingWorkspace.name,
          description:
            data.description !== undefined
              ? data.description || null
              : existingWorkspace.description || null,
          updatedAt: now,
        })
        .where(eq(organizationWorkspaces.id, data.workspaceId));

      // Return the updated workspace
      return {
        ...existingWorkspace,
        name: data.name || existingWorkspace.name,
        description:
          data.description !== undefined
            ? data.description
            : existingWorkspace.description,
        updatedAt: now,
      };
    } catch (error) {
      logger.error('Failed to update workspace in DB', {
        data,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Delete a workspace
   */
  async deleteWorkspace(workspaceId: string): Promise<void> {
    try {
      logger.debug('Deleting workspace from DB', { workspaceId });

      // Delete from the database
      await db
        .delete(organizationWorkspaces)
        .where(eq(organizationWorkspaces.id, workspaceId));
    } catch (error) {
      logger.error('Failed to delete workspace from DB', {
        workspaceId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Get enhanced organization data
   */
  async getEnhancedOrganization(slug: string): Promise<EnhancedOrganization> {
    try {
      logger.debug('Getting enhanced organization', { slug });

      // Get the organization from Better-Auth
      const response = await betterAuthClient.get<Organization>(
        `/organization/get-full-organization?slug=${encodeURIComponent(slug)}`
      );

      if (!response.success || !response.data) {
        handleBetterFetchError(response);
        throw new Error('Failed to get organization');
      }

      return response.data;
    } catch (error) {
      logger.error('Failed to get enhanced organization', {
        slug,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Get the role of a user in an organization
   */
  async getUserRole(
    userId: string,
    organizationId: string
  ): Promise<string | null> {
    try {
      logger.debug('Getting user role', { userId, organizationId });

      // Query the member table to get the user's role
      const memberRecord = await db.query.member.findFirst({
        where: sql`${member.userId} = ${userId} AND ${member.organizationId} = ${organizationId}`,
      });

      if (!memberRecord) {
        logger.debug('User is not a member of the organization', {
          userId,
          organizationId,
        });
        return null;
      }

      return memberRecord.role;
    } catch (error) {
      logger.error('Failed to get user role', {
        userId,
        organizationId,
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  /**
   * Check if a user has permission to perform a specific action on a resource
   * Uses Better-Auth's admin/has-permission endpoint
   */
  async checkActionPermission(
    userId: string,
    organizationId: string,
    resourceType: ResourceType,
    resourceId: string,
    action: string
  ): Promise<boolean> {
    try {
      logger.debug('Checking action permission with Better-Auth', {
        userId,
        organizationId,
        resourceType,
        resourceId,
        action,
      });

      // Get the user's role in the organization
      const role = await this.getUserRole(userId, organizationId);

      if (!role) {
        logger.debug('User has no role in the organization', {
          userId,
          organizationId,
        });
        return false;
      }

      // Use Better-Auth's admin/has-permission endpoint
      const response = await betterAuthClient.post<{ hasPermission: boolean }>(
        '/admin/has-permission',
        {
          body: {
            userId,
            permission: {
              [resourceType]: [action],
            },
          },
        }
      );

      if (!response.success) {
        handleBetterFetchError(response);
        return false;
      }

      return response.data?.hasPermission || false;
    } catch (error) {
      logger.error('Failed to check action permission', {
        userId,
        organizationId,
        resourceType,
        resourceId,
        action,
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }

  /**
   * Get custom permissions for a user on a resource
   */
  async getCustomPermissions(
    userId: string,
    organizationId: string,
    resourceType: ResourceType,
    resourceId: string
  ): Promise<PermissionLevel | null> {
    try {
      logger.debug('Getting custom permissions', {
        userId,
        organizationId,
        resourceType,
        resourceId,
      });

      // Query the custom permissions table
      const customPermission =
        await db.query.organizationCustomPermissions.findFirst({
          where: sql`
          ${organizationCustomPermissions.userId} = ${userId} AND 
          ${organizationCustomPermissions.organizationId} = ${organizationId} AND
          ${organizationCustomPermissions.resourceType} = ${resourceType} AND
          ${organizationCustomPermissions.resourceId} = ${resourceId}
        `,
        });

      if (!customPermission) {
        return null;
      }

      return customPermission.permissionLevel as PermissionLevel;
    } catch (error) {
      logger.error('Failed to get custom permissions', {
        userId,
        organizationId,
        resourceType,
        resourceId,
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  /**
   * Set custom permissions for a user on a resource
   */
  async setCustomPermissions(
    userId: string,
    organizationId: string,
    resourceType: ResourceType,
    resourceId: string,
    permissionLevel: PermissionLevel,
    createdBy: string
  ): Promise<void> {
    try {
      logger.debug('Setting custom permissions', {
        userId,
        organizationId,
        resourceType,
        resourceId,
        permissionLevel,
        createdBy,
      });

      // Check if a custom permission already exists
    } catch (error) {
      logger.error('Failed to set custom permissions', {
        userId,
        organizationId,
        resourceType,
        resourceId,
        permissionLevel,
        createdBy,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
}
