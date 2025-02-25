/**
 * @fileoverview Custom hook that combines React Query mutations with Zod schema validation
 * and structured logging. Provides type-safe data mutations with automatic validation,
 * error handling, and optimistic updates support.
 *
 * @module lib/query/hooks/useValidatedMutation
 * @see {@link lib/logger} for logging implementation
 * @see {@link https://tanstack.com/query/latest/docs/react/reference/useMutation} React Query documentation
 */

import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
  type UseMutationResult,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import { z } from 'zod';

import { logger } from '@/lib/logger';

import { handleHttpError, HttpError } from '../errors/http-error';

/**
 * Configuration options for validated mutations
 * @template TData - The type of data returned by the mutation
 * @template TVariables - The type of variables passed to the mutation
 * @template TContext - The type of context data for rollbacks
 */
interface MutationConfig<TData, TVariables, TContext = unknown> {
  /** The mutation function to execute */
  mutationFn: (variables: TVariables) => Promise<TData>;
  /** Schema for validating mutation response */
  schema?: z.ZodType<TData>;
  /** Schema for validating input variables */
  variablesSchema?: z.ZodType<TVariables>;
  /** Success callback */
  onSuccess?: (
    data: TData,
    variables: TVariables,
    context: TContext
  ) => void | Promise<void>;
  /** Optimistic update callback */
  onMutate?: (variables: TVariables) => Promise<TContext>;
  /** Error callback */
  onError?: (
    error: Error,
    variables: TVariables,
    context: TContext
  ) => void | Promise<void>;
  /** Success message to display */
  successMessage?: string;
  /** Error message to display */
  errorMessage?: string;
  /** Component name for logging context */
  component?: string;
  /** Operation context for logging */
  context?: string;
  /** Suppress toast notifications */
  silent?: boolean;
  /** Additional mutation options */
  options?: Omit<
    UseMutationOptions<TData, Error, TVariables, TContext>,
    'mutationFn' | 'onSuccess' | 'onError' | 'onMutate'
  >;
  /** Query key for cache updates */
  queryKey?: string[];
}

/**
 * Custom hook for type-safe mutations with validation and logging
 *
 * @template TData - The type of data returned by the mutation
 * @template TVariables - The type of variables passed to the mutation
 * @template TContext - The type of context data for rollbacks
 *
 * @param config - Mutation configuration options
 *
 * @returns React Query mutation result object
 *
 * @example
 * ```typescript
 * const updateUser = useValidatedMutation({
 *   mutationFn: (data: UpdateUserInput) => api.patch(`/users/${data.id}`, data),
 *   schema: userSchema,
 *   variablesSchema: updateUserSchema,
 *   component: 'UserProfile',
 *   context: 'updateUser',
 *   successMessage: 'User updated successfully',
 *   queryKey: ['users'],
 *   // Optimistic update
 *   onMutate: async (newData) => {
 *     const previousData = queryClient.getQueryData(['users']);
 *     queryClient.setQueryData(['users'], newData);
 *     return { previousData };
 *   }
 * });
 * ```
 */
export function useValidatedMutation<
  TData,
  TVariables = void,
  TContext = unknown,
>({
  mutationFn,
  schema,
  variablesSchema,
  onSuccess,
  onMutate,
  onError,
  successMessage,
  errorMessage = 'An error occurred',
  component = 'useValidatedMutation',
  context = 'mutation',
  silent = false,
  options = {},
  queryKey,
}: MutationConfig<TData, TVariables, TContext>): UseMutationResult<
  TData,
  Error,
  TVariables,
  TContext
> {
  const queryClient = useQueryClient();

  return useMutation<TData, Error, TVariables, TContext>({
    mutationFn: async (variables: TVariables) => {
      try {
        if (variablesSchema) {
          variables = variablesSchema.parse(variables);
        }
        const result = await mutationFn(variables);

        if (schema) {
          return schema.parse(result);
        }

        logger.debug('Mutation succeeded', {
          component,
          context,
          operation: context,
        });

        return result;
      } catch (error) {
        const handledError = handleHttpError(error);

        logger.error(
          'Mutation failed',
          {
            component,
            context,
            operation: context,
            variables,
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
    onMutate: async (variables: TVariables): Promise<TContext | undefined> => {
      if (onMutate) {
        if (queryKey) await queryClient.cancelQueries({ queryKey });
        const contextData = await onMutate(variables);
        if (!contextData || typeof contextData !== 'object') return undefined;
        return contextData as TContext;
      }
      return undefined;
    },
    onSuccess: async (data, variables, contextData) => {
      if (!silent && successMessage) {
        toast.success(successMessage);
      }

      logger.info(successMessage || 'Operation completed successfully', {
        component,
        context,
        operation: context,
      });

      await onSuccess?.(data, variables, contextData);
    },
    onError: async (
      error: Error,
      variables: TVariables,
      contextData: TContext | undefined
    ) => {
      if (!silent) {
        toast.error(error.message ?? errorMessage);
      }

      logger.error(
        errorMessage,
        {
          component,
          context,
          operation: context,
          variables,
        },
        error
      );

      await onError?.(error, variables, contextData as TContext);
    },
    ...options,
  });
}
