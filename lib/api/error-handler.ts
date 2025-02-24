/**
 * @fileoverview Core API error handling utilities for standardized error responses.
 * This module provides the central error handling logic for API routes, ensuring
 * consistent error formatting, logging, and response structure across the application.
 *
 * @module lib/api/error-handler
 * @see {@link app/api/_lib/error-handlers} for API route-specific error handlers
 */

import { NextResponse } from 'next/server';

import { handleUnknownError } from '@/lib/errors';
import { logger } from '@/lib/logger';

/**
 * Standard structure for API error responses.
 * Ensures consistent error response format across all API endpoints.
 *
 * @interface APIErrorResponse
 * @property {string} error - Human-readable error message
 * @property {string} code - Machine-readable error code for client handling
 * @property {number} status - HTTP status code
 *
 * @example
 * ```typescript
 * const errorResponse: APIErrorResponse = {
 *   error: "Resource not found",
 *   code: "NOT_FOUND",
 *   status: 404
 * };
 * ```
 */
export interface APIErrorResponse {
  error: string;
  code: string;
  status: number;
}

/**
 * Processes and handles API errors with consistent logging and response formatting.
 * Converts various error types into a standardized API error response.
 *
 * @param {unknown} error - The error to handle (can be any type)
 * @param {string} path - The API route path where the error occurred
 * @param {string} method - The HTTP method that was being processed
 * @returns {NextResponse<APIErrorResponse>} Formatted error response with appropriate status
 *
 * @example
 * ```typescript
 * try {
 *   // API logic here
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
      error: appError.message,
      code: appError.code,
      status: appError.status,
    },
    { status: appError.status }
  );
}
