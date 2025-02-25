/**
 * @fileoverview API type definitions and utilities for handling API responses, errors, and pagination
 * @module lib/schemas/api-types
 */

import { z } from 'zod';

/**
 * Standardized API error codes from Better-Auth's OpenAPI spec
 * @constant
 */
export const API_ERROR_CODES = {
  BAD_REQUEST: 'BAD_REQUEST', // 400
  UNAUTHORIZED: 'UNAUTHORIZED', // 401
  FORBIDDEN: 'FORBIDDEN', // 403
  NOT_FOUND: 'NOT_FOUND', // 404
  CONFLICT: 'CONFLICT', // 409
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS', // 429
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR', // 500
  DATABASE_ERROR: 'DATABASE_ERROR',
} as const;

export type ApiErrorCode =
  (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES];

export const apiErrorSchema = z.object({
  message: z.string(),
  code: z.enum([
    'BAD_REQUEST',
    'UNAUTHORIZED',
    'FORBIDDEN',
    'NOT_FOUND',
    'CONFLICT',
    'TOO_MANY_REQUESTS',
    'INTERNAL_SERVER_ERROR',
  ]),
  status: z.number(),
  details: z.record(z.unknown()).optional(),
});

export interface ApiError {
  message: string;
  code: ApiErrorCode;
  status: number;
  details?: Record<string, unknown>;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: ApiError;
}

export function createApiResponseSchema<T extends z.ZodType>(schema: T) {
  return z.object({
    success: z.boolean(),
    data: schema,
    message: z.string().optional(),
    error: apiErrorSchema.optional(),
  });
}
