/**
 * @fileoverview Custom hook for pinging the custom org plugin
 * @module lib/hooks/org/use-ping
 */

'use client';

import { useQuery } from '@tanstack/react-query';

import { createOrgAdapter } from '@/lib/adapters/factory';
import { getCacheSettings } from '@/lib/query/cache-config';

/**
 * Hook for pinging the custom org plugin
 * @returns Query result with ping response
 */
export function usePing() {
  return useQuery({
    queryKey: ['org', 'ping'],
    queryFn: async () => {
      const orgAdapter = createOrgAdapter();
      return orgAdapter.ping();
    },
    // Use the specific cache settings for ping requests
    ...getCacheSettings('ping'),
  });
}
