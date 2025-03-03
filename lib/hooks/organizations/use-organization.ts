/**
 * @deprecated Use the Better-Auth hooks from lib/hooks/organizations/use-better-auth-organization.ts instead.
 * This file will be removed in a future release.
 */

import { useCallback } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';

import {
  addMemberToOrganizationAction,
  createOrganizationAction,
  getOrganizationAction,
  getUserOrganizationsAction,
  setActiveOrganizationAction,
  updateOrganizationAction,
  updateOrganizationSettingsAction,
} from '@/app/_actions/organizations';
import { organizationSchema } from '@/lib/db/_schema';

import {
  useCreateOrganization,
  useOrganization as useGetOrganization,
  useInviteMember,
  useOrganizations,
  useSetActiveOrganization,
  useUpdateOrganization,
} from './use-better-auth-organization';

// Organization hooks
export function useOrganization() {
  // Import all the Better-Auth hooks we need
  const createOrganizationMutation = useCreateOrganization();
  const updateOrganizationMutation = useUpdateOrganization();
  const organizationsQuery = useOrganizations();
  const getOrganizationQuery = useGetOrganization('');
  const inviteMemberMutation = useInviteMember();
  const setActiveOrganizationMutation = useSetActiveOrganization();

  // Create organization
  const createOrganization = useCallback(
    async (input: {
      name: string;
      slug?: string;
      userId: string;
      logo?: string;
      metadata?: string;
    }) => {
      try {
        // Use the Better-Auth hook instead
        return await createOrganizationMutation.mutateAsync({
          name: input.name,
          slug: input.slug,
          logo: input.logo,
          metadata: input.metadata ? JSON.parse(input.metadata) : undefined,
        });
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to create organization'
        );
        throw error;
      }
    },
    [createOrganizationMutation]
  );

  // Get organization
  const getOrganization = useCallback(
    async (id: string) => {
      try {
        // Use the Better-Auth hook instead
        return await getOrganizationQuery.refetch();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : 'Failed to get organization'
        );
        throw error;
      }
    },
    [getOrganizationQuery]
  );

  // Get user organizations
  const getUserOrganizations = useCallback(
    async (userId: string) => {
      try {
        // Use the Better-Auth hook instead
        return await organizationsQuery.refetch();
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to get user organizations'
        );
        throw error;
      }
    },
    [organizationsQuery]
  );

  // Update organization
  const updateOrganization = useCallback(
    async (id: string, input: z.infer<typeof organizationSchema>) => {
      try {
        // Use the Better-Auth hook instead
        return await updateOrganizationMutation.mutateAsync({
          id,
          name: input.name,
          slug: input.slug || undefined,
          logo: input.logo || undefined,
          metadata:
            typeof input.metadata === 'string'
              ? JSON.parse(input.metadata)
              : input.metadata,
        });
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to update organization'
        );
        throw error;
      }
    },
    [updateOrganizationMutation]
  );

  // Add member to organization
  const addMemberToOrganization = useCallback(
    async (input: {
      organizationId: string;
      userId: string;
      role: 'ADMIN' | 'MEMBER';
    }) => {
      try {
        // Use the Better-Auth hook instead
        return await inviteMemberMutation.mutateAsync({
          organizationId: input.organizationId,
          email: input.userId, // Note: This is a simplification, in reality we'd need to get the user's email
          role: input.role,
        });
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to add member to organization'
        );
        throw error;
      }
    },
    [inviteMemberMutation]
  );

  // Set active organization
  const setActiveOrganization = useCallback(
    async (input: { sessionId: string; organizationId: string }) => {
      try {
        // Use the Better-Auth hook instead
        return await setActiveOrganizationMutation.mutateAsync(
          input.organizationId
        );
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to set active organization'
        );
        throw error;
      }
    },
    [setActiveOrganizationMutation]
  );

  // Update organization settings
  const updateOrganizationSettings = useCallback(
    async (slug: string, input: z.infer<typeof organizationSchema>) => {
      try {
        // First, get the organization to get its ID using the original action
        // since we need to get by slug, not by ID
        const response = await getOrganizationAction(slug);

        if (!response.success || !response.data) {
          throw new Error('Organization not found');
        }

        // Ensure we have an id property
        const organizationData = response.data as { id: string };

        // Use the Better-Auth hook instead
        return await updateOrganizationMutation.mutateAsync({
          id: organizationData.id,
          name: input.name,
          slug: input.slug || undefined,
          logo: input.logo || undefined,
          metadata:
            typeof input.metadata === 'string'
              ? JSON.parse(input.metadata)
              : input.metadata,
        });
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to update organization settings'
        );
        throw error;
      }
    },
    [updateOrganizationMutation]
  );

  return {
    createOrganization,
    getOrganization,
    getUserOrganizations,
    updateOrganization,
    addMemberToOrganization,
    setActiveOrganization,
    updateOrganizationSettings,
  };
}
