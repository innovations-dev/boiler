/**
 * @fileoverview Custom hook that combines React Query with Zod schema validation and structured logging.
 * Provides type-safe data fetching with automatic validation and error handling.
 *
 * @module lib/query/hooks/useValidatedQuery
 * @see {@link lib/logger} for logging implementation
 * @see {@link https://tanstack.com/query/latest/docs/react/reference/useQuery} React Query documentation
 */

import {
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';
import { z } from 'zod';

import { logger } from '@/lib/logger';

import { handleHttpError, HttpError } from '../errors/http-error';

/**
 * Extended options for useValidatedQuery hook
 * @template T - Zod schema type for response validation
 */
interface UseValidatedQueryOptions<T extends z.ZodType>
  extends Omit<UseQueryOptions<z.infer<T>>, 'queryKey' | 'queryFn'> {
  /** Skip validation for already validated cached data */
  skipValidation?: boolean;
  /** Suppress error toasts */
  silent?: boolean;
  /** Component name for logging context */
  component?: string;
  /** Operation context for logging */
  context?: string;
}

/**
 * Custom hook that combines React Query with Zod schema validation and structured logging.
 *
 * @template T - Zod schema type for response validation
 *
 * @param key - React Query cache key array
 * @param queryFn - Async function that performs the data fetch
 * @param schema - Zod schema for validating the response
 * @param options - Additional configuration options
 *
 * @returns React Query result object with validated data
 *
 * @example
 * ```typescript
 * const userSchema = z.object({
 *   id: z.string(),
 *   name: z.string(),
 *   email: z.string().email()
 * });
 *
 * function useUserProfile(userId: string) {
 *   return useValidatedQuery(
 *     ['user', userId],
 *     () => fetchUser(userId),
 *     userSchema,
 *     {
 *       component: 'UserProfile',
 *       context: 'fetchUser'
 *     }
 *   );
 * }
 * ```
 */
export function useValidatedQuery<T extends z.ZodType>(
  key: readonly unknown[],
  queryFn: () => Promise<z.infer<T>>,
  schema: T,
  options?: UseValidatedQueryOptions<T>
) {
  const queryClient = useQueryClient();
  const queryKeyString = Array.isArray(key) ? key.join(':') : String(key);

  return useQuery<z.infer<T>>({
    queryKey: key,
    queryFn: async () => {
      try {
        const rawData = await queryFn();
        const cachedData = queryClient.getQueryData<z.infer<T>>(key);

        if (options?.skipValidation && cachedData) {
          return rawData;
        }

        const validatedData = schema.parse(rawData);
        queryClient.setQueryData(key, validatedData);

        logger.debug('Query succeeded', {
          component: options?.component ?? 'useValidatedQuery',
          context: options?.context ?? queryKeyString,
          queryKey: queryKeyString,
        });

        return validatedData;
      } catch (error) {
        const handledError = handleHttpError(error);

        logger.error(
          'Query failed',
          {
            component: options?.component ?? 'useValidatedQuery',
            context: options?.context ?? queryKeyString,
            queryKey: queryKeyString,
            errorName: handledError.name,
            ...(handledError instanceof HttpError && {
              statusCode: handledError.statusCode,
              errorCode: handledError.code,
            }),
          },
          handledError
        );

        throw handledError;
      }
    },
    ...options,
  });
}
