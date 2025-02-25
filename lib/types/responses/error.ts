/**
 * @fileoverview Core error type definitions and utilities for handling responses and errors
 * @module lib/types/responses/error
 */

import { z } from 'zod';

/**
 * Standardized error codes for the application
 * @constant
 */
export const ERROR_CODES = {
  BAD_REQUEST: 'BAD_REQUEST',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

/**
 * Base schema for error responses
 */
export const errorSchema = z.object({
  message: z.string(),
  code: z.enum([
    'BAD_REQUEST',
    'UNAUTHORIZED',
    'FORBIDDEN',
    'NOT_FOUND',
    'CONFLICT',
    'TOO_MANY_REQUESTS',
    'INTERNAL_SERVER_ERROR',
    'VALIDATION_ERROR',
    'UNKNOWN_ERROR',
  ]),
  status: z.number(),
  details: z.record(z.unknown()).optional(),
});

export interface ErrorResponse {
  message: string;
  code: ErrorCode;
  status: number;
  details?: Record<string, unknown>;
}
