'use client';

import { revalidatePath } from 'next/cache';
import { useQueryClient } from '@tanstack/react-query';
import { nanoid } from 'nanoid';
import {
  z,
  type objectInputType,
  type objectOutputType,
  type ZodTypeAny,
} from 'zod';

import {
  createOrganizationAction,
  getOrganizationAction,
  getUserOrganizationsAction,
} from '@/app/_actions/organizations';
import { createOrganizationSchema, organizationSchema } from '@/lib/db/_schema';
import { AppError } from '@/lib/errors';
import {
  useCreateOrganization as useBetterAuthCreateOrganization,
  useOrganization as useBetterAuthOrganization,
  useOrganizations as useBetterAuthOrganizations,
} from '@/lib/hooks/organizations/use-better-auth-organization';
import { useValidatedMutation } from '@/lib/query/hooks/useValidatedMutation';
import { useValidatedQuery } from '@/lib/query/hooks/useValidatedQuery';
import { queryKeys } from '@/lib/query/keys';
import { ERROR_CODES } from '@/lib/types/responses/error';
import { slugify } from '@/lib/utils';

import { useServerAction } from '../actions/use-server-action';

/**
 * @deprecated Use the Better-Auth hooks from lib/hooks/organizations/use-better-auth-organization.ts instead.
 * This hook will be removed in a future release.
 */
export function useOrganization(id: string) {
  // For backward compatibility, we'll continue to use the old implementation
  // In a future release, we can switch to using the Better-Auth hook
  return useValidatedQuery(
    ['organizations', id],
    async () => {
      const response = await getOrganizationAction(id);
      if (!response.data) {
        throw new AppError('Organization not found', {
          code: ERROR_CODES.NOT_FOUND,
          status: 404,
        });
      }
      return response.data;
    },
    organizationSchema,
    {
      component: 'OrganizationDetail',
      context: 'getOrganization',
    }
  );
}

/**
 * @deprecated Use the Better-Auth hooks from lib/hooks/organizations/use-better-auth-organization.ts instead.
 * This hook will be removed in a future release.
 */
export function useUserOrganizations(userId: string) {
  // @ts-ignore - This function is deprecated and will be removed in a future release
  return useValidatedQuery(
    ['organizations', 'user', userId],
    async () => {
      const response = await getUserOrganizationsAction(userId);
      return response.data;
    },
    organizationSchema.array(),
    {
      component: 'OrganizationList',
      context: 'getUserOrganizations',
      enabled: !!userId,
    }
  );
}

/**
 * @deprecated Use the Better-Auth hooks from lib/hooks/organizations/use-better-auth-organization.ts instead.
 * This hook will be removed in a future release.
 */
export function useCreateOrganization() {
  const queryClient = useQueryClient();
  // @ts-ignore - This function is deprecated and will be removed in a future release
  return useValidatedMutation({
    mutationFn: async (input) => {
      // Process the input to ensure it matches the expected format
      const processedInput = {
        name: input.name,
        slug: input.slug || slugify(input.name),
        userId: input.userId,
        // Only include optional fields if they're defined and not null
        ...(input.logo && typeof input.logo === 'string'
          ? { logo: input.logo }
          : {}),
        ...(input.metadata && typeof input.metadata === 'string'
          ? { metadata: input.metadata }
          : {}),
      };

      try {
        const response = await createOrganizationAction(processedInput);

        // Handle case where response has no data
        if (!response || !response.data) {
          throw new AppError(
            'Failed to create organization: No data returned',
            {
              code: ERROR_CODES.INTERNAL_SERVER_ERROR,
              status: 500,
            }
          );
        }

        // Return the data directly
        return response.data;
      } catch (error) {
        console.error('Error in useCreateOrganization:', error);
        throw new AppError(
          error instanceof AppError
            ? error.message
            : 'Failed to create organization',
          {
            code: ERROR_CODES.INTERNAL_SERVER_ERROR,
            status: 500,
            cause: error,
          }
        );
      }
    },
    // Use the centralized schema for validation with passthrough to handle unexpected fields
    schema: organizationSchema.passthrough(),
    variablesSchema: createOrganizationSchema.extend({
      userId: z.string(),
    }),
    component: 'useCreateOrganization',
    context: `createOrganization`,
    successMessage: 'Organization created successfully',
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.organizations.create(
          variables.userId,
          variables.slug
        ),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.organizations.all(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.organizations.detail(variables.slug || ''),
      });
      queryClient.invalidateQueries({
        queryKey: ['organizations', 'user', variables.userId],
      });
    },
  });
}

/**
 * @deprecated Use the Better-Auth hooks from lib/hooks/organizations/use-better-auth-organization.ts instead.
 * This hook will be removed in a future release.
 */
export function useCreateOrganizationAction() {
  return useServerAction({
    action: async (input) => {
      const result = await createOrganizationAction(input);
      revalidatePath('/organizations/test');
      return result;
    },
    schema: createOrganizationSchema.extend({ userId: z.string() }),
    context: 'createOrganization',
    successMessage: 'Organization created successfully',
  });
}
