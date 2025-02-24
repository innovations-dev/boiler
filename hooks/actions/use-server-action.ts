// hooks/action/use-server-action.ts
'use client';

import { useTransition } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';

import { ApiResponse } from '@/lib/types/auth/requests';

// Better-Auth specific response types
type BetterAuthErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'RATE_LIMIT'
  | 'INTERNAL_ERROR'
  | 'UNKNOWN_ERROR'
  | 'FETCH_ERROR';

type BetterAuthError = {
  code?: BetterAuthErrorCode;
  message?: string;
  statusCode?: number;
};

type Data<T> = T & { status: boolean };
type Error$1<T> = { error: T };
export type BetterAuthResponse<T> = Data<T> | Error$1<BetterAuthError>;

interface UseServerActionOptions<TData, TInput> {
  // The server action to execute
  action: (
    input: TInput
  ) => Promise<ApiResponse<TData> | BetterAuthResponse<TData>>;
  // Optional success callback
  onSuccess?: (data: TData) => void | Promise<void>;
  // Optional error callback
  onError?: (error: Error) => void | Promise<void>;
  // Optional validation schema for input
  schema?: z.ZodType<TInput>;
  // Context for error logging
  context?: string;
  // Custom success message
  successMessage?: string;
  // Custom error message
  errorMessage?: string;
  // Optional form reset function
  resetForm?: () => void;
}

function handleError(
  error: unknown,
  context: string,
  errorMessage: string,
  onError?: (error: Error) => void | Promise<void>
) {
  console.error(`Server action error [${context}]:`, error);
  toast.error(error instanceof Error ? error.message : errorMessage);
  if (onError && error instanceof Error) {
    void onError(error);
  }
}

function handleSuccess(
  response: { message?: string },
  successMessage?: string,
  onSuccess?: (data: any) => void | Promise<void>,
  resetForm?: () => void
) {
  if (successMessage || response.message) {
    toast.success(successMessage || response.message);
  }
  if (onSuccess) {
    void onSuccess(response);
  }
  resetForm?.();
}

function isBetterAuthResponse<T>(
  response: unknown
): response is BetterAuthResponse<T> {
  return (
    typeof response === 'object' &&
    response !== null &&
    !('success' in response) &&
    ('error' in response || 'status' in response)
  );
}

function normalizeResponse<T>(
  response: ApiResponse<T> | BetterAuthResponse<T>
): ApiResponse<T> {
  if (isBetterAuthResponse(response)) {
    const isError = 'error' in response;

    if (isError && response.error) {
      return {
        success: false,
        data: {} as T,
        error: {
          code: 'UNAUTHORIZED',
          message: response.error.message || 'An error occurred',
          status: response.error.statusCode || 400,
        },
      };
    }

    return {
      success: true,
      data: response as T,
    };
  }
  return response;
}

/**
 * Custom hook for handling server actions with validation, error handling, and loading states.
 * Provides consistent error handling, response normalization, and feedback through toasts.
 *
 * @template TData - The expected return data type from the server action
 * @template TInput - The input type for the server action
 *
 * @param {Object} options - Hook configuration options
 * @param {(input: TInput) => Promise<TData>} options.action - The server action to execute
 * @param {(data: TData) => void | Promise<void>} [options.onSuccess] - Callback for successful execution
 * @param {(error: Error) => void | Promise<void>} [options.onError] - Callback for error handling
 * @param {z.ZodSchema<TInput>} [options.schema] - Optional Zod schema for input validation
 * @param {string} [options.context="serverAction"] - Context identifier for error logging
 * @param {string} [options.successMessage] - Custom success message for toast
 * @param {string} [options.errorMessage="An error occurred"] - Custom error message for toast
 * @param {() => void} [options.resetForm] - Optional callback to reset form state
 *
 * @returns {{ execute: (input: TInput) => Promise<void>, isPending: boolean }}
 * Object containing the execute function and loading state
 *
 * @example
 * ```tsx
 * const { execute, isPending } = useServerAction({
 *   action: createUser,
 *   schema: userSchema,
 *   onSuccess: (user) => {
 *     router.push(`/users/${user.id}`);
 *   },
 *   successMessage: "User created successfully",
 *   context: "createUser",
 * });
 *
 * // In your submit handler
 * const onSubmit = async (data: UserFormData) => {
 *   await execute(data);
 * };
 * ```
 *
 * @example
 * ```tsx
 * // With form reset and error handling
 * const form = useForm<UserFormData>();
 *
 * const { execute, isPending } = useServerAction({
 *   action: createUser,
 *   schema: userSchema,
 *   onSuccess: (user) => {
 *     router.push(`/users/${user.id}`);
 *   },
 *   onError: (error) => {
 *     // Handle specific error cases
 *     if (error instanceof ApiError && error.code === "DUPLICATE_EMAIL") {
 *       form.setError("email", { message: "Email already exists" });
 *     }
 *   },
 *   resetForm: () => form.reset(),
 *   context: "createUser",
 * });
 * ```
 */
export function useServerAction<TData, TInput>({
  action,
  onSuccess,
  onError,
  schema,
  context = 'serverAction',
  successMessage,
  errorMessage = 'An error occurred',
  resetForm,
}: UseServerActionOptions<TData, TInput>) {
  const [isPending, startTransition] = useTransition();

  const execute = async (input: TInput) => {
    try {
      if (schema) input = schema.parse(input);
      const response = normalizeResponse(await action(input));

      if (!response.success) {
        handleError(response.error, context, errorMessage, onError);
        return;
      }

      handleSuccess(response, successMessage, onSuccess, resetForm);
    } catch (error) {
      console.error(`Server action error [${context}]:`, error);
      console.error(
        {
          context,
          errorMessage,
        },
        error
      );
      onError?.(error as Error);
    }
  };

  return { execute, isPending };
}
