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
    queryKey: organizationExtensionsKeys.metrics(organizationId),
    queryFn: async () => {
      const response = await fetch(
        `/api/organizations/${organizationId}/metrics`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch organization metrics');
      }
      return response.json() as Promise<OrganizationMetrics>;
    },
    enabled: !!organizationId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch organization activity
 */
export function useOrganizationActivity(
  organizationId: string,
  limit?: number
) {
  return useQuery({
    queryKey: [
      ...organizationExtensionsKeys.activity(organizationId),
      { limit },
    ],
    queryFn: async () => {
      const url = new URL(
        `/api/organizations/${organizationId}/activity`,
        window.location.origin
      );
      if (limit) {
        url.searchParams.append('limit', limit.toString());
      }
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error('Failed to fetch organization activity');
      }
      return response.json() as Promise<OrganizationActivity[]>;
    },
    enabled: !!organizationId,
    staleTime: 1000 * 60, // 1 minute
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
    queryKey: organizationExtensionsKeys.workspaces.all(organizationId),
    queryFn: async () => {
      const response = await fetch(
        `/api/organizations/${organizationId}/workspaces`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch organization workspaces');
      }
      return response.json() as Promise<OrganizationWorkspace[]>;
    },
    enabled: !!organizationId,
    staleTime: 1000 * 60 * 5, // 5 minutes
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
    queryKey: organizationExtensionsKeys.workspaces.detail(workspaceId),
    queryFn: async () => {
      const response = await fetch(
        `/api/organizations/${organizationId}/workspaces/${workspaceId}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch workspace');
      }
      return response.json() as Promise<OrganizationWorkspace>;
    },
    enabled: !!workspaceId && !!organizationId,
    staleTime: 1000 * 60 * 5, // 5 minutes
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
    mutationFn: async (data: CreateWorkspaceRequest) => {
      const response = await fetch(
        `/api/organizations/${data.organizationId}/workspaces`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create workspace');
      }

      return response.json() as Promise<OrganizationWorkspace>;
    },
    onSuccess: (data, variables) => {
      // Invalidate workspaces query
      queryClient.invalidateQueries({
        queryKey: organizationExtensionsKeys.workspaces.all(
          variables.organizationId
        ),
      });

      // Invalidate enhanced organization query that includes workspaces
      queryClient.invalidateQueries({
        queryKey: organizationExtensionsKeys.all,
      });

      toast.success('Workspace created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create workspace: ${error.message}`);
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
    mutationFn: async (data: UpdateWorkspaceRequest) => {
      const response = await fetch(
        `/api/organizations/${data.organizationId}/workspaces/${data.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update workspace');
      }

      return response.json() as Promise<OrganizationWorkspace>;
    },
    onSuccess: (data) => {
      // Invalidate specific workspace query
      queryClient.invalidateQueries({
        queryKey: organizationExtensionsKeys.workspaces.detail(data.id),
      });

      // Invalidate workspaces list query
      queryClient.invalidateQueries({
        queryKey: organizationExtensionsKeys.workspaces.all(
          data.organizationId
        ),
      });

      // Invalidate enhanced organization query that includes workspaces
      queryClient.invalidateQueries({
        queryKey: organizationExtensionsKeys.all,
      });

      toast.success('Workspace updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update workspace: ${error.message}`);
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
      workspaceId,
      organizationId,
    }: {
      workspaceId: string;
      organizationId: string;
    }) => {
      const response = await fetch(
        `/api/organizations/${organizationId}/workspaces/${workspaceId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete workspace');
      }

      return { workspaceId, organizationId };
    },
    onSuccess: (data) => {
      // Invalidate workspaces list query
      queryClient.invalidateQueries({
        queryKey: organizationExtensionsKeys.workspaces.all(
          data.organizationId
        ),
      });

      // Invalidate enhanced organization query that includes workspaces
      queryClient.invalidateQueries({
        queryKey: organizationExtensionsKeys.all,
      });

      toast.success('Workspace deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete workspace: ${error.message}`);
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
