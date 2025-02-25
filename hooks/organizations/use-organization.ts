'use client';

import { revalidatePath } from 'next/cache';
import { useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import {
  createOrganizationAction,
  getOrganizationAction,
  getUserOrganizationsAction,
} from '@/app/_actions/organizations';
import { createOrganizationSchema, organizationSchema } from '@/lib/db/_schema';
import { AppError } from '@/lib/errors';
import { useValidatedMutation } from '@/lib/query/hooks/useValidatedMutation';
import { useValidatedQuery } from '@/lib/query/hooks/useValidatedQuery';
import { ERROR_CODES } from '@/lib/types/responses/error';

import { useServerAction } from '../actions/use-server-action';

// React Query Hooks
export function useOrganization(id: string) {
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

export function useUserOrganizations(userId: string) {
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
    }
  );
}

export function useCreateOrganization() {
  const queryClient = useQueryClient();

  return useValidatedMutation({
    mutationFn: async (input) => {
      const response = await createOrganizationAction(input);
      return response.data;
    },
    schema: organizationSchema,
    variablesSchema: createOrganizationSchema.extend({ userId: z.string() }),
    component: 'CreateOrganization',
    context: 'createOrganization',
    successMessage: 'Organization created successfully',
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['organizations', 'user', variables.userId],
      });
    },
  });
}

// Server Action Hooks
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
