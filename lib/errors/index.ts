/**
 * @fileoverview Centralized error handling system for the application.
 * This module provides a comprehensive set of error classes and utilities for consistent
 * error handling, logging, and response formatting across the application.
 *
 * Key features:
 * - Custom error classes with standardized structure
 * - Error code management
 * - Consistent error logging
 * - Error metadata handling
 * - Type-safe error creation
 *
 * @module lib/errors
 * @see {@link lib/api/error-handler} for API-specific error handling
 * @see {@link lib/logger} for error logging implementation
 */

import { BetterAuthError } from 'better-auth';
import { z, ZodError } from 'zod';

import { logger } from '@/lib/logger';
import {
  ERROR_CODES,
  type ErrorCode,
  type ErrorResponse,
} from '@/lib/types/responses/error';

// Extend BetterAuthError type with required properties
interface EnhancedBetterAuthError extends BetterAuthError {
  code: ErrorCode;
  status: number;
}

/**
 * Standard structure for error metadata across the application.
 * Used to create consistent error objects with additional context.
 *
 * @interface ErrorMetadata
 * @property {ErrorCode} code - Machine-readable error code
 * @property {number} [status] - HTTP status code (if applicable)
 * @property {Record<string, unknown>} [context] - Additional error context
 * @property {unknown} [cause] - Original error that caused this error
 *
 * @example
 * ```typescript
 * const metadata: ErrorMetadata = {
 *   code: 'NOT_FOUND',
 *   status: 404,
 *   context: { resourceId: '123' }
 * };
 * ```
 */
export interface ErrorMetadata {
  code: ErrorCode;
  status?: number;
  context?: Record<string, unknown>;
  cause?: unknown;
}

/**
 * Base application error class that all other error classes extend.
 * Provides consistent error structure and automatic error logging.
 *
 * Features:
 * - Standardized error properties
 * - Automatic error logging on creation
 * - JSON serialization support
 * - Error context and metadata handling
 *
 * @class AppError
 * @extends Error
 *
 * @example
 * ```typescript
 * throw new AppError('Failed to process request', {
 *   code: 'BAD_REQUEST',
 *   status: 400,
 *   context: { validationErrors: ['Invalid email'] }
 * });
 * ```
 */
export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly status: number;
  public readonly context?: Record<string, unknown>;

  constructor(message: string, metadata: ErrorMetadata) {
    super(message);
    this.name = this.constructor.name;
    this.code = metadata.code;
    this.status = metadata.status || 500;
    this.context = metadata.context;
    this.cause = metadata.cause;

    // Log error when created
    logger.error(
      message,
      {
        errorName: this.name,
        errorCode: this.code,
        ...this.context,
      },
      this
    );
  }

  /**
   * Converts the error to a JSON-serializable object.
   * Useful for API responses and error logging.
   *
   * @returns {Record<string, unknown>} JSON representation of the error
   */
  public toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      status: this.status,
      ...(this.context && { context: this.context }),
    };
  }
}

/**
 * Specialized error class for authentication-related errors.
 * Used when a user is not authenticated or session is invalid.
 *
 * @class AuthenticationError
 * @extends AppError
 *
 * @example
 * ```typescript
 * throw new AuthenticationError('Session expired', {
 *   userId: '123',
 *   sessionId: 'abc'
 * });
 * ```
 */
export class AuthenticationError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, {
      code: 'UNAUTHORIZED',
      status: 401,
      context,
    });
  }
}

/**
 * Specialized error class for database-related errors.
 * Used for database connection, query, and transaction errors.
 *
 * @class AppDatabaseError
 * @extends AppError
 *
 * @example
 * ```typescript
 * throw new AppDatabaseError('Failed to connect to database', error);
 * ```
 */
export class AppDatabaseError extends AppError {
  constructor(message: string, cause?: unknown) {
    super(message, {
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
      status: 500,
      cause,
    });
  }
}

type ErrorWithCode = Error & { code?: string };

const errorHandlers = {
  [BetterAuthError.name]: (error: EnhancedBetterAuthError): ErrorResponse => ({
    message: error.message,
    code: error.code,
    status: error.status ?? 400,
  }),

  [ZodError.name]: (error: ZodError): ErrorResponse => ({
    message: 'Validation failed',
    code: ERROR_CODES.VALIDATION_ERROR,
    status: 400,
  }),

  [AppDatabaseError.name]: (error: AppDatabaseError): ErrorResponse => ({
    message: 'Database error occurred',
    code: ERROR_CODES.INTERNAL_SERVER_ERROR,
    status: 500,
  }),

  [Error.name]: (error: ErrorWithCode): ErrorResponse => ({
    message: error.message,
    code:
      (error.code as keyof typeof ERROR_CODES) ??
      ERROR_CODES.INTERNAL_SERVER_ERROR,
    status: 500,
  }),
} as const;

export function handleUnknownError(
  error: unknown,
  path?: string
): ErrorResponse {
  logger.error(
    'Error occurred',
    {
      path,
      errorType: error instanceof Error ? error.constructor.name : typeof error,
    },
    error
  );

  if (error instanceof Error) {
    const handler =
      errorHandlers[error.constructor.name] ?? errorHandlers[Error.name];
    return handler(error as never);
  }

  return {
    message: 'An unknown error occurred',
    code: ERROR_CODES.INTERNAL_SERVER_ERROR,
    status: 500,
  };
}

/**
 * Collection of standardized error messages for common scenarios.
 * Ensures consistent error messaging across the application.
 *
 * @constant
 * @type {Record<string, string>}
 *
 * @example
 * ```typescript
 * throw new AppError(ERROR_MESSAGES.NOT_FOUND, {
 *   code: 'NOT_FOUND',
 *   status: 404
 * });
 * ```
 */
export const ERROR_MESSAGES = {
  INVALID_INPUT: 'Invalid input provided',
  UNAUTHORIZED: 'You must be logged in to perform this action',
  FORBIDDEN: 'You do not have permission to perform this action',
  NOT_FOUND: 'The requested resource was not found',
  RATE_LIMIT: 'Too many requests. Please try again later',
  DATABASE: 'A database error occurred',
  UNKNOWN: 'An unexpected error occurred',
} as const;

/**
 * Specialized error class for validation errors.
 * Used when input validation fails, typically with Zod schemas.
 *
 * @class ValidationError
 * @extends AppError
 *
 * @example
 * ```typescript
 * throw new ValidationError('Invalid form data', {
 *   zodError: validationError,
 *   formData: data
 * });
 * ```
 */
export class ValidationError extends AppError {
  constructor(
    message: string,
    context?: { zodError?: z.ZodError; [key: string]: unknown }
  ) {
    super(message, {
      code: 'BAD_REQUEST',
      status: 400,
      context,
    });
  }
}

export class FormError extends AppError {
  constructor(message: string) {
    super(message, {
      code: ERROR_CODES.VALIDATION_ERROR,
      status: 400,
    });
  }
}

export class ConfigError extends AppError {
  constructor(message: string) {
    super(message, {
      code: ERROR_CODES.CONFIGURATION_ERROR,
      status: 500,
    });
  }
}

export class EmailError extends AppError {
  constructor(
    message: string,
    code: ErrorCode = ERROR_CODES.INTERNAL_SERVER_ERROR
  ) {
    super(message, {
      code,
      status: 500,
    });
  }
}
