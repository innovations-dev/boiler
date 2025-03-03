/**
 * @fileoverview Custom hook for comprehensive error handling
 *
 * This hook provides a consistent way to handle errors across the application,
 * with support for different error types, field-specific errors, and recovery options.
 */

import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import { handleUnknownError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { ErrorResponse } from '@/lib/types/responses/error';

interface UseErrorHandlerOptions {
  /** Context identifier for logging */
  context: string;
  /** Whether to show toast notifications for errors */
  showToasts?: boolean;
  /** Custom error recovery function */
  onRecovery?: () => void;
}

interface ErrorState {
  /** The main error response */
  error: ErrorResponse | null;
  /** Field-specific errors for forms */
  fieldErrors: Record<string, string> | null;
  /** Whether the error is being recovered from */
  isRecovering: boolean;
}

/**
 * Hook for handling errors consistently across the application
 */
export function useErrorHandler({
  context,
  showToasts = true,
  onRecovery,
}: UseErrorHandlerOptions) {
  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    fieldErrors: null,
    isRecovering: false,
  });

  /**
   * Handle an error and update the error state
   */
  const handleError = useCallback(
    (error: unknown, actionContext?: string) => {
      const fullContext = actionContext
        ? `${context}.${actionContext}`
        : context;
      const errorResponse = handleUnknownError(error, fullContext);

      // Extract field errors if available
      let fieldErrors: Record<string, string> | null = null;
      if (error instanceof Error && 'context' in error && error.context) {
        const errorContext = error.context as Record<string, string[] | string>;

        fieldErrors = Object.entries(errorContext).reduce(
          (acc, [field, messages]) => {
            acc[field] = Array.isArray(messages) ? messages[0] : messages;
            return acc;
          },
          {} as Record<string, string>
        );
      }

      // Update error state
      setErrorState({
        error: errorResponse,
        fieldErrors,
        isRecovering: false,
      });

      // Show toast notification if enabled
      if (showToasts) {
        toast.error(errorResponse.message, {
          description: `Error code: ${errorResponse.code}`,
          action: onRecovery
            ? {
                label: 'Retry',
                onClick: () => recoverFromError(),
              }
            : undefined,
        });
      }

      // Log the error
      logger.error(
        `Error in ${fullContext}`,
        {
          errorCode: errorResponse.code,
          errorStatus: errorResponse.status,
        },
        error
      );

      return { errorResponse, fieldErrors };
    },
    [context, showToasts, onRecovery]
  );

  /**
   * Clear all errors
   */
  const clearErrors = useCallback(() => {
    setErrorState({
      error: null,
      fieldErrors: null,
      isRecovering: false,
    });
  }, []);

  /**
   * Attempt to recover from an error
   */
  const recoverFromError = useCallback(() => {
    setErrorState((prev) => ({
      ...prev,
      isRecovering: true,
    }));

    if (onRecovery) {
      try {
        onRecovery();
      } catch (recoveryError) {
        handleError(recoveryError, 'recovery');
        return;
      }
    }

    clearErrors();
  }, [onRecovery, clearErrors, handleError]);

  /**
   * Get field error message if available
   */
  const getFieldError = useCallback(
    (fieldName: string): string | undefined => {
      return errorState.fieldErrors?.[fieldName];
    },
    [errorState.fieldErrors]
  );

  return {
    error: errorState.error,
    fieldErrors: errorState.fieldErrors,
    isRecovering: errorState.isRecovering,
    handleError,
    clearErrors,
    recoverFromError,
    getFieldError,
  };
}
