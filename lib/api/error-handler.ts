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
import { type ErrorResponse } from '@/lib/types/responses/error';

/**
 * Handles API errors and returns a formatted error response
 * @param error - The error to handle
 * @param path - The API path where the error occurred
 * @param method - The HTTP method that was used
 * @returns {NextResponse<ErrorResponse>} Formatted error response
 *
 * @example
 * ```ts
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
): NextResponse<ErrorResponse> {
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

  return NextResponse.json(
    {
      message: appError.message,
      code: appError.code,
      status: appError.status,
    },
    { status: appError.status }
  );
}
