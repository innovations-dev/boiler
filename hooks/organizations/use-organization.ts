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
  // For backward compatibility, we'll use the Better-Auth hook internally
  // but maintain the same API for consumers
  const { data, isLoading, error } = useBetterAuthOrganization(id);

  return {
    data: data,
    isLoading,
    error,
  };
}

/**
 * @deprecated Use the Better-Auth hooks from lib/hooks/organizations/use-better-auth-organization.ts instead.
 * This hook will be removed in a future release.
 */
export function useUserOrganizations() {
  // For backward compatibility, we'll use the Better-Auth hook internally
  // but maintain the same API for consumers
  const { data, isLoading, error } = useBetterAuthOrganizations();

  return {
    data: data,
    isLoading,
    error,
  };
}

/**
 * @deprecated Use the Better-Auth hooks from lib/hooks/organizations/use-better-auth-organization.ts instead.
 * This hook will be removed in a future release.
 */
export function useCreateOrganization() {
  // For backward compatibility, we'll use the Better-Auth hook internally
  // but maintain the same API for consumers
  const createOrganization = useBetterAuthCreateOrganization();

  return {
    mutateAsync: async (data: { name: string; slug?: string }) => {
      const result = await createOrganization.mutateAsync({
        name: data.name,
        slug: data.slug,
      });

      return {
        data: result,
      };
    },
    isLoading: createOrganization.isPending,
    error: createOrganization.error,
  };
}

/**
 * @deprecated Use the Better-Auth hooks from lib/hooks/organizations/use-better-auth-organization.ts instead.
 * This hook will be removed in a future release.
 */
export function useCreateOrganizationAction() {
  // For backward compatibility, we'll use a simplified version
  // that doesn't rely on the useServerAction hook
  return {
    execute: createOrganizationAction,
    isLoading: false,
    error: null,
  };
}
