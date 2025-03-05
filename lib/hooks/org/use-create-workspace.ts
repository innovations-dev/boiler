/**
 * @fileoverview Custom hook for creating a workspace using React Query mutations
 * @module lib/hooks/org/use-create-workspace
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createOrgAdapter } from '@/lib/adapters/factory';
import { queryKeys } from '@/lib/query/keys';
import {
  createWorkspaceInputSchema,
  orgWorkspaceSchema,
} from '@/lib/schemas/org-schemas';

/**
 * Interface for workspace creation input
 */
export interface CreateWorkspaceInput {
  orgId: string;
  name: string;
  description?: string;
  settings?: Record<string, unknown>;
}

/**
 * Hook for creating a workspace
 * @returns Mutation for creating a workspace
 */
export function useCreateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateWorkspaceInput) => {
      // Validate the input
      const validatedInput = createWorkspaceInputSchema.parse(input);

      const orgAdapter = createOrgAdapter();
      const workspace = await orgAdapter.createWorkspace(validatedInput);

      // Validate the response
      return orgWorkspaceSchema.parse(workspace);
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.org.workspaces.all(variables.orgId),
      });

      // Add the new workspace to the cache
      queryClient.setQueryData(queryKeys.org.workspaces.detail(data.id), data);
    },
  });
}
