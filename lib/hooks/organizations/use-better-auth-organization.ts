/**
 * React Query hooks for Better-Auth Organization Service
 *
 * This file provides React Query hooks for interacting with the Better-Auth organization endpoints.
 * It handles data fetching, caching, and error handling.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  organizationService,
  type Organization,
  type OrganizationInvitation,
  type OrganizationMember,
  type OrganizationWithMembers,
} from '@/lib/better-auth/organization';
import { queryKeys } from '@/lib/query/keys';

/**
 * Hook to fetch all organizations for the current user
 */
export function useOrganizations() {
  return useQuery({
    queryKey: queryKeys.organizations.all(),
    queryFn: () => organizationService.list(),
  });
}

/**
 * Hook to fetch a specific organization by slug
 */
export function useOrganization(slug: string) {
  return useQuery({
    queryKey: queryKeys.organizations.detail(slug),
    queryFn: () => organizationService.getFullOrganization(slug),
    enabled: !!slug,
  });
}

/**
 * Hook to fetch the active member for the current user in an organization
 */
export function useOrganizationMember(organizationId: string, slug: string) {
  return useQuery({
    queryKey: queryKeys.organizations.members.all(slug),
    queryFn: () => organizationService.getActiveMember(organizationId),
    enabled: !!organizationId && !!slug,
  });
}

/**
 * Hook to check if the current user has a specific permission in an organization
 */
export function useOrganizationPermission(
  organizationId: string,
  permission: string,
  slug: string
) {
  return useQuery({
    queryKey: ['organizations', slug, 'permissions', permission],
    queryFn: () =>
      organizationService.hasPermission({
        organizationId,
        permission,
      }),
    enabled: !!organizationId && !!permission && !!slug,
  });
}

/**
 * Hook to create a new organization
 */
export function useCreateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      name: string;
      slug?: string;
      logo?: string;
      metadata?: Record<string, any>;
    }) => organizationService.create(data),
    onSuccess: () => {
      // Invalidate the organizations list query to refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.organizations.all(),
      });
    },
  });
}

/**
 * Hook to update an organization
 */
export function useUpdateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      id: string;
      name?: string;
      slug?: string;
      logo?: string;
      metadata?: Record<string, any>;
    }) => organizationService.update(data),
    onSuccess: (_, variables) => {
      // Invalidate the specific organization query to refetch
      if (variables.slug) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.organizations.detail(variables.slug),
        });
      }
      // Also invalidate the organizations list
      queryClient.invalidateQueries({
        queryKey: queryKeys.organizations.all(),
      });
    },
  });
}

/**
 * Hook to delete an organization
 */
export function useDeleteOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => organizationService.delete(id),
    onSuccess: () => {
      // Invalidate the organizations list query to refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.organizations.all(),
      });
    },
  });
}

/**
 * Hook to set the active organization
 */
export function useSetActiveOrganization() {
  return useMutation({
    mutationFn: (id: string) => organizationService.setActive(id),
  });
}

/**
 * Hook to invite a member to an organization
 */
export function useInviteMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      organizationId: string;
      email: string;
      role: 'ADMIN' | 'MEMBER';
      slug: string;
    }) => organizationService.inviteMember(data),
    onSuccess: (_, variables) => {
      // Invalidate the specific organization query to refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.organizations.detail(variables.slug),
      });

      // Invalidate members
      queryClient.invalidateQueries({
        queryKey: queryKeys.organizations.members.all(variables.slug),
      });
    },
  });
}

/**
 * Hook to remove a member from an organization
 */
export function useRemoveMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      organizationId: string;
      userId: string;
      slug: string;
    }) => organizationService.removeMember(data),
    onSuccess: (_, variables) => {
      // Invalidate the specific organization query to refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.organizations.detail(variables.slug),
      });

      // Invalidate members
      queryClient.invalidateQueries({
        queryKey: queryKeys.organizations.members.all(variables.slug),
      });
    },
  });
}

/**
 * Hook to update a member's role in an organization
 */
export function useUpdateMemberRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      organizationId: string;
      userId: string;
      role: 'ADMIN' | 'MEMBER';
      slug: string;
    }) => organizationService.updateMemberRole(data),
    onSuccess: (_, variables) => {
      // Invalidate the specific organization query to refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.organizations.detail(variables.slug),
      });

      // Invalidate members
      queryClient.invalidateQueries({
        queryKey: queryKeys.organizations.members.all(variables.slug),
      });
    },
  });
}

/**
 * Hook to leave an organization
 */
export function useLeaveOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { organizationId: string; slug: string }) =>
      organizationService.leave(data.organizationId),
    onSuccess: (_, variables) => {
      // Invalidate the organizations list query to refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.organizations.all(),
      });

      // Invalidate the specific organization
      queryClient.invalidateQueries({
        queryKey: queryKeys.organizations.detail(variables.slug),
      });
    },
  });
}
