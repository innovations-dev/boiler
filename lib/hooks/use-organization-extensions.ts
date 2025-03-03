/**
 * React Query hooks for organization extensions
 *
 * These hooks provide access to the custom organization functionality
 * that extends the Better-Auth API.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Organization } from '@/lib/better-auth/organization';
import {
  CreateWorkspaceRequest,
  EnhancedOrganization,
  OrganizationActivity,
  OrganizationMetrics,
  OrganizationWorkspace,
  UpdateWorkspaceRequest,
} from '@/lib/domains/organization/types';

// Query keys
export const organizationExtensionsKeys = {
  all: ['organization-extensions'] as const,
  metrics: (organizationId: string) =>
    [...organizationExtensionsKeys.all, 'metrics', organizationId] as const,
  activity: (organizationId: string) =>
    [...organizationExtensionsKeys.all, 'activity', organizationId] as const,
  workspaces: {
    all: (organizationId: string) =>
      [
        ...organizationExtensionsKeys.all,
        'workspaces',
        organizationId,
      ] as const,
    detail: (workspaceId: string) =>
      [
        ...organizationExtensionsKeys.all,
        'workspaces',
        'detail',
        workspaceId,
      ] as const,
  },
  enhanced: (slug: string) =>
    [...organizationExtensionsKeys.all, 'enhanced', slug] as const,
};

/**
 * Hook to fetch organization metrics
 */
export function useOrganizationMetrics(organizationId: string) {
  return useQuery({
    queryKey: ['organization', organizationId, 'metrics'],
    queryFn: async () => {
      const response = await fetch(`/api/orgs/${organizationId}/metrics`);
      if (!response.ok) {
        throw new Error('Failed to fetch organization metrics');
      }
      return response.json();
    },
    enabled: !!organizationId,
  });
}

/**
 * Hook to fetch organization activity
 */
export function useOrganizationActivity(
  organizationId: string,
  limit: number = 10
) {
  return useQuery({
    queryKey: ['organization', organizationId, 'activity', limit],
    queryFn: async () => {
      const response = await fetch(
        `/api/orgs/${organizationId}/activity?limit=${limit}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch organization activity');
      }
      return response.json();
    },
    enabled: !!organizationId,
  });
}

/**
 * Hook to fetch workspaces for an organization
 *
 * @param organizationId - The ID of the organization
 * @returns Query result with organization workspaces
 */
export function useOrganizationWorkspaces(organizationId: string) {
  return useQuery({
    queryKey: ['organization', organizationId, 'workspaces'],
    queryFn: async () => {
      const response = await fetch(`/api/orgs/${organizationId}/workspaces`);
      if (!response.ok) {
        throw new Error('Failed to fetch organization workspaces');
      }
      return response.json();
    },
    enabled: !!organizationId,
  });
}

/**
 * Hook to fetch a specific workspace
 *
 * @param workspaceId - The ID of the workspace
 * @param organizationId - The ID of the organization the workspace belongs to
 * @returns Query result with workspace details
 */
export function useOrganizationWorkspace(
  workspaceId: string,
  organizationId: string
) {
  return useQuery({
    queryKey: ['organization', organizationId, 'workspace', workspaceId],
    queryFn: async () => {
      const response = await fetch(
        `/api/orgs/${organizationId}/workspaces/${workspaceId}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch workspace');
      }
      return response.json();
    },
    enabled: !!workspaceId && !!organizationId,
  });
}

/**
 * Hook to create a workspace
 *
 * @returns Mutation function for creating a workspace
 */
export function useCreateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      organizationId,
      name,
      description,
    }: {
      organizationId: string;
      name: string;
      description?: string;
    }) => {
      const response = await fetch(`/api/orgs/${organizationId}/workspaces`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, description }),
      });

      if (!response.ok) {
        throw new Error('Failed to create workspace');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['organization', variables.organizationId, 'workspaces'],
      });
    },
  });
}

/**
 * Hook to update a workspace
 *
 * @returns Mutation function for updating a workspace
 */
export function useUpdateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      organizationId,
      workspaceId,
      name,
      description,
    }: {
      organizationId: string;
      workspaceId: string;
      name?: string;
      description?: string;
    }) => {
      const response = await fetch(
        `/api/orgs/${organizationId}/workspaces/${workspaceId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, description }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update workspace');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          'organization',
          variables.organizationId,
          'workspace',
          variables.workspaceId,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: ['organization', variables.organizationId, 'workspaces'],
      });
    },
  });
}

/**
 * Hook to delete a workspace
 *
 * @returns Mutation function for deleting a workspace
 */
export function useDeleteWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      organizationId,
      workspaceId,
    }: {
      organizationId: string;
      workspaceId: string;
    }) => {
      const response = await fetch(
        `/api/orgs/${organizationId}/workspaces/${workspaceId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete workspace');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['organization', variables.organizationId, 'workspaces'],
      });
    },
  });
}

/**
 * Hook to fetch enhanced organization data
 */
export function useEnhancedOrganization(slug: string) {
  return useQuery({
    queryKey: organizationExtensionsKeys.enhanced(slug),
    queryFn: async () => {
      const response = await fetch(
        `/api/organizations-by-slug/${slug}/enhanced`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch enhanced organization data');
      }
      return response.json() as Promise<EnhancedOrganization>;
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useRecordActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      organizationId,
      type,
      data,
    }: {
      organizationId: string;
      type: string;
      data?: Record<string, any>;
    }) => {
      const response = await fetch(`/api/orgs/${organizationId}/activity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, data }),
      });

      if (!response.ok) {
        throw new Error('Failed to record activity');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['organization', variables.organizationId, 'activity'],
      });
    },
  });
}
