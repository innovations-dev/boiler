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
import { getCacheSettings } from '@/lib/query/cache-config';
import { queryKeys } from '@/lib/query/keys';

/**
 * Hook to fetch organization metrics
 *
 * @param organizationId - The ID of the organization
 * @returns Query result with organization metrics
 */
export function useOrganizationMetrics(organizationId: string) {
  return useQuery({
    queryKey: queryKeys.organizations.extensions.metrics(organizationId),
    queryFn: async () => {
      const response = await fetch(`/api/orgs/${organizationId}/metrics`, {
        // Explicitly opt into caching with Next.js 15
        cache: 'force-cache',
        next: { revalidate: 120 }, // 2 minutes, matching our cache config
      });
      if (!response.ok) {
        throw new Error('Failed to fetch organization metrics');
      }
      return response.json() as Promise<OrganizationMetrics>;
    },
    enabled: !!organizationId,
    ...getCacheSettings('organizationExtensions', 'metrics'),
  });
}

/**
 * Hook to fetch organization activity
 *
 * @param organizationId - The ID of the organization
 * @param limit - The maximum number of activity items to fetch
 * @returns Query result with organization activity
 */
export function useOrganizationActivity(
  organizationId: string,
  limit: number = 10
) {
  return useQuery({
    queryKey: [
      ...queryKeys.organizations.extensions.activity(organizationId),
      limit,
    ],
    queryFn: async () => {
      const response = await fetch(
        `/api/orgs/${organizationId}/activity?limit=${limit}`,
        {
          // Explicitly opt into caching with Next.js 15
          cache: 'force-cache',
          next: { revalidate: 300 }, // 5 minutes, matching our cache config
        }
      );
      if (!response.ok) {
        throw new Error('Failed to fetch organization activity');
      }
      return response.json() as Promise<OrganizationActivity[]>;
    },
    enabled: !!organizationId,
    ...getCacheSettings('organizationExtensions', 'activity'),
  });
}

/**
 * Hook to record organization activity
 *
 * @returns Mutation function for recording activity
 */
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
        // Ensure we're not caching POST requests
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error('Failed to record activity');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      // Optimistic update: Invalidate activity queries for this organization
      queryClient.invalidateQueries({
        queryKey: queryKeys.organizations.extensions.activity(
          variables.organizationId
        ),
      });
    },
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
    queryKey: queryKeys.organizations.extensions.workspaces.all(organizationId),
    queryFn: async () => {
      const response = await fetch(`/api/orgs/${organizationId}/workspaces`, {
        // Explicitly opt into caching with Next.js 15
        cache: 'force-cache',
        next: { revalidate: 900 }, // 15 minutes, matching our cache config
      });
      if (!response.ok) {
        throw new Error('Failed to fetch organization workspaces');
      }
      return response.json() as Promise<OrganizationWorkspace[]>;
    },
    enabled: !!organizationId,
    ...getCacheSettings('organizationExtensions', 'workspaces'),
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
    queryKey: [
      ...queryKeys.organizations.extensions.workspaces.detail(workspaceId),
      organizationId,
    ],
    queryFn: async () => {
      const response = await fetch(
        `/api/orgs/${organizationId}/workspaces/${workspaceId}`,
        {
          // Explicitly opt into caching with Next.js 15
          cache: 'force-cache',
          next: { revalidate: 900 }, // 15 minutes, matching our cache config
        }
      );
      if (!response.ok) {
        throw new Error('Failed to fetch workspace');
      }
      return response.json() as Promise<OrganizationWorkspace>;
    },
    enabled: !!workspaceId && !!organizationId,
    ...getCacheSettings('organizationExtensions', 'workspaces'),
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
        // Ensure we're not caching POST requests
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error('Failed to create workspace');
      }

      return response.json() as Promise<OrganizationWorkspace>;
    },
    onSuccess: (newWorkspace, variables) => {
      // Optimistic update: Add the new workspace to the cache
      queryClient.setQueryData(
        queryKeys.organizations.extensions.workspaces.all(
          variables.organizationId
        ),
        (oldData: OrganizationWorkspace[] | undefined) => {
          if (!oldData) return [newWorkspace];
          return [...oldData, newWorkspace];
        }
      );

      // Also invalidate the query to ensure fresh data
      queryClient.invalidateQueries({
        queryKey: queryKeys.organizations.extensions.workspaces.all(
          variables.organizationId
        ),
      });

      toast.success('Workspace created successfully');
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
          // Ensure we're not caching PUT requests
          cache: 'no-store',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update workspace');
      }

      return response.json() as Promise<OrganizationWorkspace>;
    },
    onSuccess: (updatedWorkspace, variables) => {
      // Optimistic update: Update the specific workspace in the cache
      queryClient.setQueryData(
        [
          ...queryKeys.organizations.extensions.workspaces.detail(
            variables.workspaceId
          ),
          variables.organizationId,
        ],
        updatedWorkspace
      );

      // Update the workspace in the list cache
      queryClient.setQueryData(
        queryKeys.organizations.extensions.workspaces.all(
          variables.organizationId
        ),
        (oldData: OrganizationWorkspace[] | undefined) => {
          if (!oldData) return [updatedWorkspace];
          return oldData.map((workspace) =>
            workspace.id === variables.workspaceId
              ? updatedWorkspace
              : workspace
          );
        }
      );

      // Also invalidate queries to ensure fresh data
      queryClient.invalidateQueries({
        queryKey: queryKeys.organizations.extensions.workspaces.detail(
          variables.workspaceId
        ),
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.organizations.extensions.workspaces.all(
          variables.organizationId
        ),
      });

      toast.success('Workspace updated successfully');
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
          // Ensure we're not caching DELETE requests
          cache: 'no-store',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete workspace');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      // Optimistic update: Remove the workspace from the list cache
      queryClient.setQueryData(
        queryKeys.organizations.extensions.workspaces.all(
          variables.organizationId
        ),
        (oldData: OrganizationWorkspace[] | undefined) => {
          if (!oldData) return [];
          return oldData.filter(
            (workspace) => workspace.id !== variables.workspaceId
          );
        }
      );

      // Remove the specific workspace from the cache
      queryClient.removeQueries({
        queryKey: [
          ...queryKeys.organizations.extensions.workspaces.detail(
            variables.workspaceId
          ),
          variables.organizationId,
        ],
      });

      // Also invalidate the list query to ensure fresh data
      queryClient.invalidateQueries({
        queryKey: queryKeys.organizations.extensions.workspaces.all(
          variables.organizationId
        ),
      });

      toast.success('Workspace deleted successfully');
    },
  });
}

/**
 * Hook to fetch enhanced organization data
 *
 * @param slug - The organization slug
 * @returns Query result with enhanced organization data
 */
export function useEnhancedOrganization(slug: string) {
  return useQuery({
    queryKey: queryKeys.organizations.extensions.enhanced(slug),
    queryFn: async () => {
      const response = await fetch(
        `/api/organizations-by-slug/${slug}/enhanced`,
        {
          // Explicitly opt into caching with Next.js 15
          cache: 'force-cache',
          next: { revalidate: 300 }, // 5 minutes
        }
      );
      if (!response.ok) {
        throw new Error('Failed to fetch enhanced organization data');
      }
      return response.json() as Promise<EnhancedOrganization>;
    },
    enabled: !!slug,
    ...getCacheSettings('organization'), // Use the organization cache settings
  });
}
