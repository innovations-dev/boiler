/**
 * @fileoverview Infinite query hook with Zod validation and error handling
 * @module lib/query/hooks/useValidatedInfiniteQuery
 */

import {
  useInfiniteQuery,
  type QueryFunctionContext,
  type UseInfiniteQueryOptions,
} from '@tanstack/react-query';
import { z } from 'zod';

import { logger } from '@/lib/logger';

import { handleHttpError, HttpError } from '../errors/http-error';

/**
 * Extended options for infinite query with validation
 */
interface UseValidatedInfiniteQueryOptions<T extends z.ZodType>
  extends Omit<
    UseInfiniteQueryOptions<z.infer<T>, Error>,
    'queryKey' | 'queryFn'
  > {
  /** Skip validation for already validated cached data */
  skipValidation?: boolean;
  /** Component name for logging context */
  component?: string;
  /** Operation context for logging */
  context?: string;
}

/**
 * Hook for infinite queries with built-in Zod validation and error handling
 *
 * @template T - Zod schema type for response validation
 *
 * @example
 * ```typescript
 * const pageSchema = z.object({
 *   users: z.array(userSchema),
 *   nextCursor: z.string().nullable(),
 * });
 *
 * function useInfiniteUsers() {
 *   return useValidatedInfiniteQuery(
 *     queryKeys.users.infinite(),
 *     async ({ pageParam = 0 }) => {
 *       return fetchUsers({ cursor: pageParam });
 *     },
 *     pageSchema,
 *     {
 *       getNextPageParam: (lastPage) => lastPage.nextCursor,
 *       component: 'UserList',
 *       context: 'infiniteUsers',
 *     }
 *   );
 * }
 * ```
 */
export function useValidatedInfiniteQuery<T extends z.ZodType>(
  queryKey: readonly unknown[],
  queryFn: (context: QueryFunctionContext) => Promise<z.infer<T>>,
  schema: T,
  options: UseValidatedInfiniteQueryOptions<T> & {
    getNextPageParam: (lastPage: z.infer<T>) => unknown;
  }
) {
  const queryKeyString = Array.isArray(queryKey)
    ? queryKey.join(':')
    : String(queryKey);

  return useInfiniteQuery({
    queryKey,
    queryFn: async (context) => {
      try {
        const data = await queryFn(context);
        const validatedData = schema.parse(data);

        logger.debug('Infinite query page fetched', {
          component: options?.component ?? 'useValidatedInfiniteQuery',
          context: options?.context ?? queryKeyString,
          queryKey: queryKeyString,
          pageParam: context.pageParam,
        });

        return validatedData;
      } catch (error) {
        const handledError = handleHttpError(error);

        logger.error(
          'Infinite query failed',
          {
            component: options?.component ?? 'useValidatedInfiniteQuery',
            context: options?.context ?? queryKeyString,
            queryKey: queryKeyString,
            pageParam: context.pageParam,
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
