/**
 * @fileoverview Custom hook for recording organization activity using React Query mutations
 * @module lib/hooks/org/use-record-activity
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createOrgAdapter } from '@/lib/adapters/factory';
import { queryKeys } from '@/lib/query/keys';
import {
  orgActivitySchema,
  recordActivityInputSchema,
} from '@/lib/schemas/org-schemas';

/**
 * Interface for activity recording input
 */
export interface RecordActivityInput {
  orgId: string;
  userId: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Hook for recording organization activity
 * @returns Mutation for recording organization activity
 */
export function useRecordActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: RecordActivityInput) => {
      // Map the input to match the schema
      const mappedInput = {
        orgId: input.orgId,
        userId: input.userId,
        action: input.action,
        resource: input.resourceType || '',
        resourceId: input.resourceId,
        metadata: input.metadata,
      };

      // Validate the input
      const validatedInput = recordActivityInputSchema.parse(mappedInput);

      const orgAdapter = createOrgAdapter();
      // Map the validated input back to the interface expected by the adapter
      const adapterInput = {
        orgId: validatedInput.orgId,
        userId: validatedInput.userId,
        action: validatedInput.action,
        resourceType: validatedInput.resourceType,
        resourceId: validatedInput.resourceId || '',
        metadata: validatedInput.metadata,
      } as const;
      const activity = await orgAdapter.recordActivity(adapterInput);

      // Validate the response
      return orgActivitySchema.parse(activity);
    },
    onSuccess: (data, variables) => {
      // Invalidate the activity query to refetch with the new activity
      queryClient.invalidateQueries({
        queryKey: queryKeys.org.activity(variables.orgId),
      });
    },
  });
}
