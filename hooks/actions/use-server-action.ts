// hooks/action/use-server-action.ts
'use client';

import { useTransition } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';

import { auditLogger } from '@/lib/audit';
import { handleUnknownError, ValidationError } from '@/lib/errors';
import { logger } from '@/lib/logger';
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

interface BetterAuthError {
  error: {
    message: string;
    statusCode: number;
  };
}

type BetterAuthSuccess<T> = T;
type BetterAuthResponse<T> = BetterAuthSuccess<T> | BetterAuthError;

interface UseServerActionOptions<TData, TInput> {
  action: (
    input: TInput
  ) => Promise<ApiResponse<TData> | BetterAuthResponse<TData>>;
  onSuccess?: (data: TData) => void | Promise<void>;
  onError?: (error: Error) => void | Promise<void>;
  schema?: z.ZodSchema<TInput>;
  context?: string;
  successMessage?: string;
  errorMessage?: string;
  resetForm?: () => void;
}

function isBetterAuthError(response: unknown): response is BetterAuthError {
  if (!response || typeof response !== 'object') return false;
  const maybeError = response as BetterAuthError;
  return (
    'error' in maybeError &&
    typeof maybeError.error === 'object' &&
    maybeError.error !== null &&
    'message' in maybeError.error &&
    'statusCode' in maybeError.error
  );
}

function isApiResponse<T>(response: unknown): response is ApiResponse<T> {
  return (
    typeof response === 'object' && response !== null && 'success' in response
  );
}

function handleError(
  error: unknown,
  context: string,
  errorMessage: string,
  onError?: (error: Error) => void | Promise<void>
) {
  const appError = handleUnknownError(error);

  logger.error(
    errorMessage,
    {
      component: 'ServerAction',
      context,
      errorCode: appError.code,
      errorStatus: appError.status,
    },
    appError
  );

  toast.error(appError.message || errorMessage);

  if (onError) {
    void onError(appError);
  }
}

function handleSuccess<T>(
  response: ApiResponse<T>,
  successMessage?: string,
  onSuccess?: (data: T) => void | Promise<void>,
  resetForm?: () => void
) {
  if (successMessage) {
    toast.success(successMessage);
  }
  if (onSuccess) {
    void onSuccess(response.data);
  }
  if (resetForm) {
    resetForm();
  }
}

function normalizeResponse<T>(
  response: ApiResponse<T> | BetterAuthResponse<T>
): ApiResponse<T> {
  if (isBetterAuthError(response)) {
    return {
      success: false,
      data: {} as T,
      error: {
        code: 'UNAUTHORIZED',
        message: response.error.message,
        status: response.error.statusCode,
      },
    };
  }

  if (isApiResponse<T>(response)) {
    return response;
  }

  return {
    success: true,
    data: response as T,
  };
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
      // Validate input if schema is provided
      if (schema) {
        try {
          input = schema.parse(input);
        } catch (validationError) {
          if (validationError instanceof z.ZodError) {
            const error = new ValidationError('Validation failed', {
              zodError: validationError,
            });
            handleError(error, context, errorMessage, onError);
            return;
          }
        }
      }

      const response = normalizeResponse(await action(input));

      if (!response.success) {
        handleError(response.error, context, errorMessage, onError);
        return;
      }

      handleSuccess(response, successMessage, onSuccess, resetForm);

      // Log successful action
      auditLogger.logDataChange('data.update', {
        component: 'ServerAction',
        context,
        action: context,
      });
    } catch (error) {
      handleError(error, context, errorMessage, onError);
    }
  };

  const wrappedExecute = (input: TInput) => {
    startTransition(() => {
      void execute(input);
    });
  };

  return { execute: wrappedExecute, isPending };
}
