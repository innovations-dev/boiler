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
      // Validate the input
      const validatedInput = recordActivityInputSchema.parse(input);

      const orgAdapter = createOrgAdapter();
      const activity = await orgAdapter.recordOrgActivity(validatedInput);

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
