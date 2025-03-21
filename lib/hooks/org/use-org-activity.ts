/**
 * @fileoverview Custom hook for fetching organization activity using React Query
 * @module lib/hooks/org/use-org-activity
 */

'use client';

import { useQuery } from '@tanstack/react-query';

import { createOrgAdapter } from '@/lib/adapters/factory';
import { getCacheSettings } from '@/lib/query/cache-config';
import { queryKeys } from '@/lib/query/keys';
import { orgActivitySchema } from '@/lib/schemas/org-schemas';

/**
 * Interface for pagination options
 */
export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

/**
 * Hook for fetching organization activity
 * @param {string} orgId - Organization ID
 * @param {PaginationOptions} paginationOptions - Pagination options
 * @returns Query result with organization activity
 */
export function useOrgActivity(
  orgId: string,
  paginationOptions?: PaginationOptions
) {
  return useQuery({
    queryKey: [...queryKeys.org.activity(orgId), paginationOptions],
    queryFn: async () => {
      const orgAdapter = createOrgAdapter();

      // Convert pagination options to the format expected by the adapter
      const options = paginationOptions
        ? {
            limit: paginationOptions.limit,
            offset: paginationOptions.page
              ? (paginationOptions.page - 1) * (paginationOptions.limit || 10)
              : undefined,
          }
        : undefined;

      // Use getActivityHistory instead of getOrgActivity
      const activity = await orgAdapter.getActivityHistory(orgId, options);

      // Validate the response data
      return orgActivitySchema.array().parse(activity);
    },
    enabled: Boolean(orgId),
    // Use the specific cache settings for organization activity
    ...getCacheSettings('org', 'activity'),
  });
}
