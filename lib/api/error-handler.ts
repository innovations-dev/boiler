/**
 * @fileoverview API Route Error Handler
 * Provides centralized error handling for API routes with structured error responses
 * and logging. This handler ensures consistent error formatting and proper error
 * tracking across all API endpoints.
 *
 * Features:
 * - Structured error responses
 * - Error logging with metadata
 * - HTTP status code mapping
 * - Development-specific error details
 *
 * @module lib/api/error-handler
 * @see {@link lib/errors} for error types and handling utilities
 */

import { NextResponse } from 'next/server';

import { handleUnknownError } from '@/lib/errors';
import { logger } from '@/lib/logger';

/**
 * Standard error response structure for API routes
 * @interface APIErrorResponse
 */
interface APIErrorResponse {
  error: {
    message: string;
    code: string;
    status: number;
    stack?: string;
  };
}

/**
 * Handles API route errors and returns a formatted error response
 * Ensures consistent error handling across all API routes
 *
 * @function handleAPIError
 * @param {unknown} error - The error to handle
 * @param {string} path - API route path where the error occurred
 * @param {string} method - HTTP method that triggered the error
 * @returns {NextResponse<APIErrorResponse>} Formatted error response
 *
 * @example
 * ```typescript
 * // In an API route
 * try {
 *   // API logic
 * } catch (error) {
 *   return handleAPIError(error, '/api/users', 'GET');
 * }
 * ```
 */
export function handleAPIError(
  error: unknown,
  path: string,
  method: string
): NextResponse<APIErrorResponse> {
  const appError = handleUnknownError(error);

  // Log the error with context
  logger.error(
    'API route error',
    {
      component: 'APIRoute',
      path,
      method,
      errorCode: appError.code,
      errorStatus: appError.status,
    },
    appError
  );

  // Return structured error response
  return NextResponse.json(
    {
      error: {
        message: appError.message,
        code: appError.code,
        status: appError.status,
        ...(process.env.NODE_ENV === 'development' && {
          stack: appError.stack,
        }),
      },
    },
    { status: appError.status }
  );
}
