/**
 * @fileoverview Custom hook for fetching organization activity using React Query
 * @module lib/hooks/org/use-org-activity
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { createOrgAdapter } from '@/lib/adapters/factory';
import { queryKeys } from '@/lib/query/keys';
import {
  orgActivitySchema,
  paginationOptionsSchema,
} from '@/lib/schemas/org-schemas';

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
      const activity = await orgAdapter.getOrgActivity(
        orgId,
        paginationOptions
      );

      // Validate the response data
      return orgActivitySchema.array().parse(activity);
    },
    enabled: Boolean(orgId),
  });
}
