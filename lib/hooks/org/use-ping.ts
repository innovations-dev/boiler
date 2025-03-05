/**
 * @fileoverview Custom hook for pinging the custom org plugin
 * @module lib/hooks/org/use-ping
 */

'use client';

import { useQuery } from '@tanstack/react-query';

import { createOrgAdapter } from '@/lib/adapters/factory';

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
  });
}
