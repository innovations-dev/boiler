/**
 * @fileoverview Custom hook for updating a workspace using React Query mutations
 * @module lib/hooks/org/use-update-workspace
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createOrgAdapter } from '@/lib/adapters/factory';
import { queryKeys } from '@/lib/query/keys';
import {
  orgWorkspaceSchema,
  updateWorkspaceInputSchema,
} from '@/lib/schemas/org-schemas';

/**
 * Interface for workspace update input
 */
export interface UpdateWorkspaceInput {
  workspaceId: string;
  orgId: string;
  name?: string;
  description?: string;
  settings?: Record<string, unknown>;
}

/**
 * Hook for updating a workspace
 * @returns Mutation for updating a workspace
 */
export function useUpdateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateWorkspaceInput) => {
      // Validate the input
      const { workspaceId, ...updateData } = input;
      const validatedInput = updateWorkspaceInputSchema.parse(updateData);

      const orgAdapter = createOrgAdapter();
      const workspace = await orgAdapter.updateWorkspace(
        workspaceId,
        validatedInput
      );

      // Validate the response
      return orgWorkspaceSchema.parse(workspace);
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.org.workspaces.all(variables.orgId),
      });

      // Update the workspace in the cache
      queryClient.setQueryData(queryKeys.org.workspaces.detail(data.id), data);
    },
  });
}
