/**
 * Better-Auth Organization Extensions
 *
 * This file provides additional organization-related functionality that is not
 * available in the standard Better-Auth API. It follows the same patterns and
 * conventions as the Better-Auth client to ensure consistency.
 */

import { db } from '@/lib/db';
import { logger } from '@/lib/logger';

import { betterAuthClient, handleBetterFetchError } from './client';
import { Organization } from './organization';

// Types for custom functionality
export interface OrganizationMetrics {
  totalMembers: number;
  activeMembers: number;
  pendingInvitations: number;
  activeSessions: number;
  lastActivityAt: string;
}

export interface OrganizationActivity {
  id: string;
  organizationId: string;
  userId: string;
  action: string;
  details: Record<string, unknown>;
  createdAt: string;
  user?: {
    id: string;
    name?: string;
    email?: string;
    image?: string;
  };
}

export interface OrganizationWorkspace {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// Organization extensions service
export const organizationExtensions = {
  /**
   * Get metrics for an organization
   * This functionality is not available in Better-Auth
   */
  async getMetrics(organizationId: string): Promise<OrganizationMetrics> {
    try {
      logger.debug('Getting organization metrics', { organizationId });

      // Use our custom API endpoint
      const response = await betterAuthClient.get<OrganizationMetrics>(
        `/api/organizations/${organizationId}/metrics`
      );

      if (!response.success) {
        handleBetterFetchError(response);
      }

      return response.data!;
    } catch (error) {
      logger.error('Failed to get organization metrics', {
        organizationId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  },

  /**
   * Get recent activity for an organization
   * This functionality is not available in Better-Auth
   */
  async getActivity(
    organizationId: string,
    limit: number = 10
  ): Promise<OrganizationActivity[]> {
    try {
      logger.debug('Getting organization activity', { organizationId, limit });

      // Use our custom API endpoint
      const response = await betterAuthClient.get<OrganizationActivity[]>(
        `/api/organizations/${organizationId}/activity?limit=${limit}`
      );

      if (!response.success) {
        handleBetterFetchError(response);
      }

      return response.data || [];
    } catch (error) {
      logger.error('Failed to get organization activity', {
        organizationId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  },

  /**
   * Create a workspace within an organization
   * This functionality is not available in Better-Auth
   */
  async createWorkspace(data: {
    organizationId: string;
    name: string;
    description?: string;
  }): Promise<OrganizationWorkspace> {
    try {
      logger.debug('Creating organization workspace', data);

      // Use our custom API endpoint
      const response = await betterAuthClient.post<OrganizationWorkspace>(
        `/api/organizations/${data.organizationId}/workspaces`,
        data
      );

      if (!response.success) {
        handleBetterFetchError(response);
      }

      return response.data!;
    } catch (error) {
      logger.error('Failed to create organization workspace', {
        data,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  },

  /**
   * Get workspaces for an organization
   * This functionality is not available in Better-Auth
   */
  async getWorkspaces(
    organizationId: string
  ): Promise<OrganizationWorkspace[]> {
    try {
      logger.debug('Getting organization workspaces', { organizationId });

      // Use our custom API endpoint
      const response = await betterAuthClient.get<OrganizationWorkspace[]>(
        `/api/organizations/${organizationId}/workspaces`
      );

      if (!response.success) {
        handleBetterFetchError(response);
      }

      return response.data || [];
    } catch (error) {
      logger.error('Failed to get organization workspaces', {
        organizationId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  },

  /**
   * Get enhanced organization data that combines Better-Auth data with our custom data
   */
  async getEnhancedOrganization(slug: string): Promise<
    Organization & {
      metrics?: OrganizationMetrics;
      workspaces?: OrganizationWorkspace[];
    }
  > {
    try {
      logger.debug('Getting enhanced organization', { slug });

      // Get the organization from Better-Auth
      const organization = await betterAuthClient.get<Organization>(
        `/organization/get-full-organization?slug=${encodeURIComponent(slug)}`
      );

      if (!organization.success || !organization.data) {
        handleBetterFetchError(organization);
        throw new Error('Failed to get organization');
      }

      // Get additional data from our extensions
      try {
        const [metrics, workspaces] = await Promise.all([
          this.getMetrics(organization.data.id),
          this.getWorkspaces(organization.data.id),
        ]);

        // Combine all data
        return {
          ...organization.data,
          metrics,
          workspaces,
        };
      } catch (extensionError) {
        // If extensions fail, still return the organization data
        logger.warn('Failed to get extended organization data', {
          slug,
          error:
            extensionError instanceof Error
              ? extensionError.message
              : String(extensionError),
        });

        return organization.data;
      }
    } catch (error) {
      logger.error('Failed to get enhanced organization', {
        slug,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  },
};
