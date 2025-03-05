/**
 * @fileoverview Custom hook for updating organization metrics using React Query mutations
 * @module lib/hooks/org/use-update-metrics
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createOrgAdapter } from '@/lib/adapters/factory';
import { queryKeys } from '@/lib/query/keys';
import {
  orgMetricsSchema,
  updateMetricsInputSchema,
} from '@/lib/schemas/org-schemas';

/**
 * Interface for metrics update input
 */
export interface UpdateMetricsInput {
  orgId: string;
  activeUsers?: number;
  totalWorkspaces?: number;
  lastActivityDate?: Date;
}

/**
 * Hook for updating organization metrics
 * @returns Mutation for updating organization metrics
 */
export function useUpdateMetrics() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateMetricsInput) => {
      // Validate the input
      const validatedInput = updateMetricsInputSchema.parse(input);

      const orgAdapter = createOrgAdapter();
      const metrics = await orgAdapter.updateOrgMetrics(validatedInput);

      // Validate the response
      return orgMetricsSchema.parse(metrics);
    },
    onSuccess: (data, variables) => {
      // Update the metrics in the cache
      queryClient.setQueryData(queryKeys.org.metrics(variables.orgId), data);
    },
  });
}
