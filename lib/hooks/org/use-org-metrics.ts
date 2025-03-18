/**
 * @fileoverview Custom hook for fetching organization metrics using React Query
 * @module lib/hooks/org/use-org-metrics
 */

'use client';

import { useQuery } from '@tanstack/react-query';

import { createOrgAdapter } from '@/lib/adapters/factory';
import { getCacheSettings } from '@/lib/query/cache-config';
import { queryKeys } from '@/lib/query/keys';
import { orgMetricsSchema } from '@/lib/schemas/org-schemas';

/**
 * Hook for fetching organization metrics
 * @param {string} orgId - Organization ID
 * @returns Query result with organization metrics
 */
export function useOrgMetrics(orgId: string) {
  return useQuery({
    queryKey: queryKeys.org.metrics(orgId),
    queryFn: async () => {
      const orgAdapter = createOrgAdapter();
      const metrics = await orgAdapter.getOrgMetrics(orgId);

      // Validate the response data
      return orgMetricsSchema.parse(metrics);
    },
    enabled: Boolean(orgId),
    // Use the specific cache settings for organization metrics
    ...getCacheSettings('org', 'metrics'),
  });
}
