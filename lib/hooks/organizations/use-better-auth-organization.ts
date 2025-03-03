/**
 * React Query hooks for Better-Auth Organization Service
 *
 * This file provides React Query hooks for interacting with the Better-Auth organization endpoints.
 * It handles data fetching, caching, and error handling.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

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
      queryClient.invalidateQueries({
        queryKey: queryKeys.organizations.all(),
      });
      toast.success('Organization created successfully');
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
      queryClient.invalidateQueries({
        queryKey: queryKeys.organizations.detail(variables.slug || ''),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.organizations.all(),
      });
      toast.success('Organization updated successfully');
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
      queryClient.invalidateQueries({
        queryKey: queryKeys.organizations.all(),
      });
      toast.success('Organization deleted successfully');
    },
  });
}

/**
 * Hook to set the active organization
 */
export function useSetActiveOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => organizationService.setActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.session.current(),
      });
    },
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
    }) => organizationService.inviteMember(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.organizations.invitations.all(
          variables.organizationId
        ),
      });
      toast.success('Invitation sent successfully');
    },
  });
}

/**
 * Hook to cancel an invitation
 */
export function useCancelInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => organizationService.cancelInvitation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.organizations.all(),
      });
      toast.success('Invitation cancelled successfully');
    },
  });
}

/**
 * Hook to accept an invitation
 */
export function useAcceptInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (token: string) => organizationService.acceptInvitation(token),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.organizations.all(),
      });
      toast.success('Invitation accepted successfully');
    },
  });
}

/**
 * Hook to get an invitation
 */
export function useInvitation(token: string) {
  return useQuery({
    queryKey: queryKeys.organizations.invitations.detail(token),
    queryFn: () => organizationService.getInvitation(token),
    enabled: !!token,
  });
}

/**
 * Hook to reject an invitation
 */
export function useRejectInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (token: string) => organizationService.rejectInvitation(token),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.organizations.all(),
      });
      toast.success('Invitation rejected successfully');
    },
  });
}

/**
 * Hook to check if a slug is available
 */
export function useCheckSlug(slug: string) {
  return useQuery({
    queryKey: ['organizations', 'check-slug', slug],
    queryFn: () => organizationService.checkSlug(slug),
    enabled: !!slug,
  });
}

/**
 * Hook to remove a member from an organization
 */
export function useRemoveMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { organizationId: string; userId: string }) =>
      organizationService.removeMember(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.organizations.members.all(variables.organizationId),
      });
      toast.success('Member removed successfully');
    },
  });
}

/**
 * Hook to update a member's role
 */
export function useUpdateMemberRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      organizationId: string;
      userId: string;
      role: 'ADMIN' | 'MEMBER';
    }) => organizationService.updateMemberRole(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.organizations.members.all(variables.organizationId),
      });
      toast.success('Member role updated successfully');
    },
  });
}

/**
 * Hook to leave an organization
 */
export function useLeaveOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (organizationId: string) =>
      organizationService.leave(organizationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.organizations.all(),
      });
      toast.success('Left organization successfully');
    },
  });
}

/**
 * Hook to check if a user has a specific permission
 */
export function useHasPermission(data: {
  organizationId: string;
  resourceType: string;
  resourceId: string;
  permission: string;
}) {
  return useQuery({
    queryKey: ['organizations', 'has-permission', data],
    queryFn: () => organizationService.hasPermission(data),
    enabled:
      !!data.organizationId &&
      !!data.resourceType &&
      !!data.resourceId &&
      !!data.permission,
  });
}

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
 * Hook to fetch active sessions for an organization
 *
 * @param organizationId - The ID of the organization
 * @returns Query result with active sessions data
 */
export function useActiveSessions(organizationId: string) {
  return useQuery({
    queryKey: queryKeys.organizations.extensions.activeSessions(organizationId),
    queryFn: async () => {
      const response = await fetch(
        `/api/orgs/${organizationId}/active-sessions`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch active sessions');
      }
      return response.json();
    },
    enabled: !!organizationId,
  });
}
