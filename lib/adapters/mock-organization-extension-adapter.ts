/**
 * Mock Organization Extension Adapter
 *
 * This file provides a mock implementation of the OrganizationExtensionAdapter
 * for testing purposes. It simulates the behavior of the real adapter without
 * making actual API calls.
 */

import { nanoid } from 'nanoid';

import type {
  CreateWorkspaceInput,
  OrganizationActivity,
  OrganizationMetrics,
  OrganizationWorkspace,
  RecordActivityInput,
  UpdateMetricsInput,
  UpdateWorkspaceInput,
} from '../types/organization-extensions';
import type { OrganizationExtensionAdapter } from './organization-extension-adapter';

/**
 * Mock implementation of the OrganizationExtensionAdapter
 *
 * This class provides an in-memory implementation of the adapter for testing.
 */
export class MockOrganizationExtensionAdapter
  implements OrganizationExtensionAdapter
{
  private metrics: Map<string, OrganizationMetrics> = new Map();
  private activities: OrganizationActivity[] = [];
  private workspaces: Map<string, OrganizationWorkspace> = new Map();

  // Metrics
  async getOrganizationMetrics(
    organizationId: string
  ): Promise<OrganizationMetrics> {
    const metrics = this.metrics.get(organizationId);

    if (metrics) {
      return { ...metrics };
    }

    // Return default metrics if none exist
    const defaultMetrics: OrganizationMetrics = {
      id: nanoid(),
      organizationId,
      activeUsers: 0,
      totalWorkspaces: 0,
      storageUsed: 0,
      lastUpdated: new Date(),
    };

    this.metrics.set(organizationId, defaultMetrics);
    return { ...defaultMetrics };
  }

  async updateOrganizationMetrics(
    organizationId: string,
    updates: UpdateMetricsInput
  ): Promise<OrganizationMetrics> {
    const existing = await this.getOrganizationMetrics(organizationId);

    const updated: OrganizationMetrics = {
      ...existing,
      ...updates,
      lastUpdated: new Date(),
    };

    this.metrics.set(organizationId, updated);
    return { ...updated };
  }

  // Activity
  async recordActivity(
    activity: RecordActivityInput
  ): Promise<OrganizationActivity> {
    const newActivity: OrganizationActivity = {
      ...activity,
      id: nanoid(),
      timestamp: new Date(),
    };

    this.activities.push(newActivity);
    return { ...newActivity };
  }

  async getActivityHistory(
    organizationId: string,
    options?: { limit?: number; offset?: number }
  ): Promise<OrganizationActivity[]> {
    const orgActivities = this.activities.filter(
      (activity) => activity.organizationId === organizationId
    );

    // Sort by timestamp (newest first)
    const sorted = [...orgActivities].sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );

    // Apply pagination
    const offset = options?.offset || 0;
    const limit = options?.limit || sorted.length;

    return sorted
      .slice(offset, offset + limit)
      .map((activity) => ({ ...activity }));
  }

  // Workspaces
  async listWorkspaces(
    organizationId: string
  ): Promise<OrganizationWorkspace[]> {
    const orgWorkspaces: OrganizationWorkspace[] = [];

    for (const workspace of this.workspaces.values()) {
      if (workspace.organizationId === organizationId) {
        orgWorkspaces.push({ ...workspace });
      }
    }

    return orgWorkspaces;
  }

  async createWorkspace(
    input: CreateWorkspaceInput
  ): Promise<OrganizationWorkspace> {
    const now = new Date();
    const newWorkspace: OrganizationWorkspace = {
      ...input,
      id: nanoid(),
      createdAt: now,
      updatedAt: now,
    };

    this.workspaces.set(newWorkspace.id, newWorkspace);

    // Update metrics
    const metrics = await this.getOrganizationMetrics(input.organizationId);
    await this.updateOrganizationMetrics(input.organizationId, {
      totalWorkspaces: metrics.totalWorkspaces + 1,
    });

    return { ...newWorkspace };
  }

  async getWorkspace(workspaceId: string): Promise<OrganizationWorkspace> {
    const workspace = this.workspaces.get(workspaceId);

    if (!workspace) {
      throw new Error(`Workspace not found: ${workspaceId}`);
    }

    return { ...workspace };
  }

  async updateWorkspace(
    workspaceId: string,
    updates: UpdateWorkspaceInput
  ): Promise<OrganizationWorkspace> {
    const existing = await this.getWorkspace(workspaceId);

    const updated: OrganizationWorkspace = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };

    this.workspaces.set(workspaceId, updated);
    return { ...updated };
  }

  async deleteWorkspace(workspaceId: string): Promise<void> {
    const workspace = await this.getWorkspace(workspaceId);
    this.workspaces.delete(workspaceId);

    // Update metrics
    const metrics = await this.getOrganizationMetrics(workspace.organizationId);
    await this.updateOrganizationMetrics(workspace.organizationId, {
      totalWorkspaces: Math.max(0, metrics.totalWorkspaces - 1),
    });
  }
}

/**
 * Create a mock organization extension adapter
 *
 * @returns A mock implementation of the OrganizationExtensionAdapter
 */
export function createMockOrganizationExtensionAdapter(): OrganizationExtensionAdapter {
  return new MockOrganizationExtensionAdapter();
}
