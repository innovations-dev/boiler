// hooks/action/use-server-action.ts
'use client';

import { useCallback, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';

import { auditLogger } from '@/lib/audit';
import { handleUnknownError, ValidationError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { type Response } from '@/lib/types/responses/base';
import { type ErrorResponse } from '@/lib/types/responses/error';

// Better-Auth specific response types
interface BetterAuthError {
  error: {
    message: string;
    code: string;
    statusCode: number;
  };
}

interface BetterAuthSuccess<T> {
  data: T;
}

export type BetterAuthResponse<T> = BetterAuthSuccess<T> | BetterAuthError;

export type ServerActionOptions<TData> = {
  action: (
    ...args: any[]
  ) => Promise<Response<TData> | BetterAuthResponse<TData>>;
  onSuccess?: (data: TData) => void;
  onError?: (error: ErrorResponse | Error) => void | Promise<void>;
  context?: string;
};

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

function isApiResponse<T>(response: unknown): response is Response<T> {
  return (
    typeof response === 'object' && response !== null && 'success' in response
  );
}

function isResponse<T>(response: unknown): response is Response<T> {
  return (
    typeof response === 'object' &&
    response !== null &&
    'data' in response &&
    (!('error' in response) ||
      (typeof response.error === 'object' && response.error !== null))
  );
}

function handleError(
  error: unknown,
  context: string,
  errorMessage: string,
  onError?: (error: ErrorResponse | Error) => void | Promise<void>
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
  response: Response<T>,
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

function handleActionResponse<T>(
  response: Response<T>,
  options?: Pick<ServerActionOptions<T>, 'onSuccess' | 'onError'>
): Response<T> {
  if (response.success && options?.onSuccess) {
    options.onSuccess(response.data);
  } else if (!response.success && options?.onError && response.error) {
    options.onError(response.error);
  }
  return response;
}

function normalizeResponse<T>(
  response: Response<T> | BetterAuthResponse<T>
): Response<T> {
  if (isResponse<T>(response)) {
    return response;
  }

  if (isBetterAuthError(response)) {
    return {
      success: false,
      data: undefined as unknown as T,
      error: {
        message: response.error.message,
        code: 'UNAUTHORIZED',
        status: response.error.statusCode,
      },
    };
  }

  // Must be BetterAuthSuccess
  return {
    success: true,
    data: (response as BetterAuthSuccess<T>).data,
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
}: ServerActionOptions<TData> & {
  schema?: z.ZodSchema<TInput>;
  successMessage?: string;
  errorMessage?: string;
  resetForm?: () => void;
}) {
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

export function useValidatedAction<TData, TInput>({
  action,
  schema,
  onSuccess,
  onError,
  context = 'unknown',
  successMessage,
  errorMessage,
  resetForm,
}: ServerActionOptions<TData> & {
  schema?: z.ZodSchema<TInput>;
  successMessage?: string;
  errorMessage?: string;
  resetForm?: () => void;
}) {
  // ... rest of the function ...
}
