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
import { UpdateMetricsInput as BaseUpdateMetricsInput } from '@/lib/types/org';

/**
 * Extended interface for metrics update input with orgId
 */
export interface UpdateMetricsInput extends BaseUpdateMetricsInput {
  orgId: string;
}

/**
 * Hook for updating organization metrics
 * @returns Mutation for updating organization metrics
 */
export function useUpdateMetrics() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateMetricsInput) => {
      const { orgId, ...metricsData } = input;

      // Validate the input
      const validatedInput = updateMetricsInputSchema.parse(metricsData);

      const orgAdapter = createOrgAdapter();
      const metrics = await orgAdapter.updateOrgMetrics(orgId, validatedInput);

      // Validate the response
      return orgMetricsSchema.parse(metrics);
    },
    onSuccess: (data, variables) => {
      // Update the metrics in the cache
      queryClient.setQueryData(queryKeys.org.metrics(variables.orgId), data);
    },
  });
}
