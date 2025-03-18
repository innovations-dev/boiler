/**
 * @fileoverview Configuration for React Query cache management and defaults
 * @module lib/query/cache-config
 */

import { type QueryClient } from '@tanstack/react-query';

/**
 * Cache configuration settings for different data types
 * @typedef {Object} CacheConfig
 * @property {Object} queries - Query-specific cache settings
 */
export const cacheConfig = {
  queries: {
    // Default cache settings
    default: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
    // User data - shorter stale time due to importance of freshness
    user: {
      staleTime: 60 * 1000, // 1 minute
      gcTime: 5 * 60 * 1000, // 5 minutes
    },
    // Organization data - moderate caching
    organizations: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
    // Organization subtypes
    org_metrics: {
      staleTime: 2 * 60 * 1000, // 2 minutes - metrics change frequently
      gcTime: 5 * 60 * 1000, // 5 minutes
    },
    org_activity: {
      staleTime: 30 * 1000, // 30 seconds - activity is very dynamic
      gcTime: 5 * 60 * 1000, // 5 minutes
    },
    org_workspaces: {
      staleTime: 5 * 60 * 1000, // 5 minutes - workspaces change less frequently
      gcTime: 15 * 60 * 1000, // 15 minutes
    },
    // Ping requests - very short cache times
    ping: {
      staleTime: 10 * 1000, // 10 seconds - ping should be fresh
      gcTime: 60 * 1000, // 1 minute
    },
    session: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },

    // Static data - long cache times
    static: {
      staleTime: 24 * 60 * 60 * 1000, // 24 hours
      gcTime: 48 * 60 * 60 * 1000, // 48 hours
    },
  },
};

/**
 * Configures default cache settings for a QueryClient instance
 * @param {QueryClient} queryClient - The React Query client instance to configure
 *
 * @example
 * // In your app initialization:
 * const queryClient = new QueryClient();
 * configureCacheDefaults(queryClient);
 *
 * @example
 * // Custom usage with provider:
 * function QueryProvider({ children }: { children: React.ReactNode }) {
 *   const [queryClient] = useState(() => {
 *     const client = new QueryClient();
 *     configureCacheDefaults(client);
 *     return client;
 *   });
 *
 *   return (
 *     <QueryClientProvider client={queryClient}>
 *       {children}
 *     </QueryClientProvider>
 *   );
 * }
 *
 * @description
 * This function sets up default caching behavior with:
 * - 3 retry attempts for failed queries
 * - Exponential backoff for retry delays (capped at 30s)
 * - Disabled refetching on window focus
 *
 * Different cache durations are configured for various data types:
 * - Default: 5min stale / 10min garbage collection
 * - User data: 1min stale / 5min garbage collection
 * - Organization data: 5min stale / 10min garbage collection
 * - Static data: 24h stale / 48h garbage collection
 */
export function configureCacheDefaults(queryClient: QueryClient) {
  queryClient.setDefaultOptions({
    queries: {
      ...cacheConfig.queries.default,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
    },
  });
}

/**
 * Helper function to get cache settings for a specific query type
 *
 * This function retrieves the appropriate cache settings based on the query type
 * and optional subtype. It first checks for a combined type+subType configuration,
 * then falls back to the type-level configuration, and finally to the default settings.
 *
 * @param {string} type - The primary type of query (e.g., 'user', 'org', 'ping')
 * @param {string} [subType] - Optional subtype for more specific settings (e.g., 'metrics', 'activity')
 * @returns Cache settings object with staleTime and gcTime properties
 *
 * @example
 * // Get cache settings for organization metrics
 * const settings = getCacheSettings('org', 'metrics');
 *
 * @example
 * // Use in a React Query hook
 * function useMyQuery() {
 *   return useQuery({
 *     queryKey: ['my', 'query'],
 *     queryFn: async () => { ... },
 *     ...getCacheSettings('myType', 'mySubType'),
 *   });
 * }
 */
export function getCacheSettings(type: string, subType?: string) {
  // First check if there's a specific configuration for the type+subType
  if (subType) {
    const combinedKey =
      `${type}_${subType}` as keyof typeof cacheConfig.queries;
    if (cacheConfig.queries[combinedKey]) {
      return cacheConfig.queries[combinedKey];
    }
  }

  // Fall back to the type-level configuration
  return (
    cacheConfig.queries[type as keyof typeof cacheConfig.queries] ||
    cacheConfig.queries.default
  );
}
