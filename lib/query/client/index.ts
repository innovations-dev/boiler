/**
 * @fileoverview Query client configuration and default options.
 * Provides a configured QueryClient instance with error handling, logging, and cache management.
 *
 * @module lib/query/client
 * @see {@link lib/logger} for logging implementation
 * @see {@link lib/query/cache-config} for cache configuration
 * @see {@link lib/query/errors/http-error} for error handling
 */

import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';

import { logger } from '@/lib/logger';

import { cacheConfig, configureCacheDefaults } from '../cache-config';
import { handleHttpError, HttpError } from '../errors/http-error';

/**
 * Default error handler for React Query operations.
 * Provides consistent error handling and logging across all queries and mutations.
 *
 * Features:
 * - Converts unknown errors to typed HttpErrors
 * - Structured logging with context
 * - Error metadata extraction
 * - Integration with global logging system
 *
 * @param {unknown} error - The error that occurred
 * @param {string} [context] - Additional context for the error
 * @returns {void}
 *
 * @example
 * ```typescript
 * // Error handling in a custom hook
 * const { data } = useValidatedQuery(
 *   queryKeys.users.detail(id),
 *   async () => {
 *     try {
 *       return await fetchUser(id);
 *     } catch (error) {
 *       defaultQueryErrorHandler(error, `fetchUser:${id}`);
 *       throw error;
 *     }
 *   },
 *   userSchema
 * );
 * ```
 */
export function defaultQueryErrorHandler(
  error: unknown,
  context?: string
): void {
  const handledError = handleHttpError(error);

  logger.error(
    'Query error occurred',
    {
      component: 'QueryClient',
      context: context ?? 'query',
      errorName: handledError.name,
      ...(handledError instanceof HttpError && {
        statusCode: handledError.statusCode,
        errorCode: handledError.code,
      }),
    },
    handledError
  );
}

/**
 * Creates a configured QueryClient instance with default options and error handling.
 *
 * Configuration includes:
 * - Default cache settings from cacheConfig
 * - Limited retry attempts
 * - Disabled window focus refetching
 * - Error handling setup
 * - Environment-specific configurations
 *
 * Cache Management:
 * - Uses QueryCache for query result caching
 * - Uses MutationCache for mutation result caching
 * - Configures garbage collection times based on environment
 *
 * @returns {QueryClient} Configured QueryClient instance
 *
 * @example
 * ```typescript
 * // In your app's QueryProvider
 * function QueryProvider({ children }: { children: React.ReactNode }) {
 *   const [queryClient] = useState(() => createQueryClient());
 *
 *   return (
 *     <QueryClientProvider client={queryClient}>
 *       {children}
 *       <ReactQueryDevtools /> // Enable in development
 *     </QueryClientProvider>
 *   );
 * }
 * ```
 */
export function createQueryClient(): QueryClient {
  const client = new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        defaultQueryErrorHandler(error, query.queryKey.join(':'));
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        defaultQueryErrorHandler(
          error,
          mutation.options.mutationKey?.join(':') ?? 'mutation'
        );
      },
    }),
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
        ...cacheConfig.queries.default,
      },
      mutations: {
        retry: 0,
      },
    },
  });

  configureCacheDefaults(client);
  return client;
}
