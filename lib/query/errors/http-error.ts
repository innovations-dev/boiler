/**
 * @fileoverview HTTP Error handling utilities for standardized API error management.
 * Provides a set of typed error classes and utilities for consistent error handling
 * across the application's data fetching layer.
 *
 * @module lib/query/errors
 * @see {@link lib/logger} for logging integration
 * @see {@link lib/schemas/api-types} for API error codes
 */

import { ERROR_CODES } from '@/lib/types/responses/error';

/**
 * Base HTTP Error class for handling API errors with status codes
 *
 * @class HttpError
 * @extends Error
 *
 * @property {number} statusCode - HTTP status code
 * @property {string} code - Application-specific error code
 *
 * @example
 * ```typescript
 * throw new HttpError(500, "Database connection failed", ERROR_CODES.DATABASE_ERROR);
 * ```
 */
export class HttpError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code: string = ERROR_CODES.INTERNAL_SERVER_ERROR
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

/**
 * 401 Unauthorized Error
 * Used when authentication is required but failed or has not been provided
 *
 * @class UnauthorizedError
 * @extends HttpError
 *
 * @example
 * ```typescript
 * throw new UnauthorizedError("Invalid or expired token");
 * ```
 */
export class UnauthorizedError extends HttpError {
  constructor(message: string) {
    super(401, message, ERROR_CODES.UNAUTHORIZED);
    this.name = 'UnauthorizedError';
  }
}

/**
 * 403 Forbidden Error
 * Used when the server understands the request but refuses to authorize it
 *
 * @class ForbiddenError
 * @extends HttpError
 *
 * @example
 * ```typescript
 * throw new ForbiddenError("Insufficient permissions to access resource");
 * ```
 */
export class ForbiddenError extends HttpError {
  constructor(message: string) {
    super(403, message, ERROR_CODES.FORBIDDEN);
    this.name = 'ForbiddenError';
  }
}

/**
 * 404 Not Found Error
 * Used when the requested resource could not be found
 *
 * @class NotFoundError
 * @extends HttpError
 *
 * @example
 * ```typescript
 * throw new NotFoundError("User not found");
 * ```
 */
export class NotFoundError extends HttpError {
  constructor(message: string) {
    super(404, message, ERROR_CODES.NOT_FOUND);
    this.name = 'NotFoundError';
  }
}

/**
 * 400 Bad Request Error
 * Used when the server cannot or will not process the request due to client error
 *
 * @class BadRequestError
 * @extends HttpError
 *
 * @example
 * ```typescript
 * throw new BadRequestError("Invalid input parameters");
 * ```
 */
export class BadRequestError extends HttpError {
  constructor(message: string) {
    super(400, message, ERROR_CODES.BAD_REQUEST);
    this.name = 'BadRequestError';
  }
}

/**
 * 429 Rate Limit Error
 * Used when the user has sent too many requests in a given amount of time
 *
 * @class RateLimitError
 * @extends HttpError
 *
 * @example
 * ```typescript
 * throw new RateLimitError("API rate limit exceeded");
 * ```
 */
export class RateLimitError extends HttpError {
  constructor(message: string = 'Too many requests. Please try again later.') {
    super(429, message, ERROR_CODES.TOO_MANY_REQUESTS);
    this.name = 'RateLimitError';
  }
}

/**
 * Converts unknown errors to typed HTTP errors
 * Provides consistent error handling across the application
 *
 * @function handleHttpError
 * @param {unknown} error - The error to be handled
 * @returns {Error} A typed error instance
 *
 * @example
 * ```typescript
 * // In an API route
 * try {
 *   await someOperation();
 * } catch (error) {
 *   const typedError = handleHttpError(error);
 *   logger.error("Operation failed", {
 *     statusCode: typedError instanceof HttpError ? typedError.statusCode : 500,
 *     errorCode: typedError instanceof HttpError ? typedError.code : 'UNKNOWN'
 *   });
 * }
 *
 * // In a React Query hook
 * const query = useQuery({
 *   queryFn: async () => {
 *     try {
 *       const response = await fetch('/api/data');
 *       if (!response.ok) {
 *         throw handleHttpError(await response.json());
 *       }
 *       return response.json();
 *     } catch (error) {
 *       throw handleHttpError(error);
 *     }
 *   }
 * });
 * ```
 */
export function handleHttpError(error: unknown): Error {
  if (error instanceof HttpError) return error;

  if (error instanceof Error) {
    if ('status' in error) {
      const status = (error as { status: number }).status;
      const message = error.message;

      switch (status) {
        case 400:
          return new BadRequestError(message);
        case 401:
          return new UnauthorizedError(message);
        case 403:
          return new ForbiddenError(message);
        case 404:
          return new NotFoundError(message);
        case 429:
          return new RateLimitError(message);
        default:
          return new HttpError(status, message);
      }
    }
    return error;
  }

  return new HttpError(500, 'An unexpected error occurred');
}
