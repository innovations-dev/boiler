/**
 * @fileoverview Core response type definitions and utilities
 * @module lib/types/responses/base
 */

import { z } from 'zod';

import { errorSchema, type ErrorResponse } from './error';

/**
 * Generic interface for all application responses
 * @template T - The type of data contained in the response
 */
export interface Response<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: ErrorResponse;
}

/**
 * Creates a Zod schema for validating responses
 * @template T - The Zod schema type for the data
 * @param {T} dataSchema - Zod schema for validating the response data
 * @returns {z.ZodType<Response<z.infer<T>>>} Combined response schema
 */
export function createResponseSchema<T extends z.ZodType>(schema: T) {
  return z.object({
    success: z.boolean(),
    data: schema,
    message: z.string().optional(),
    error: errorSchema.optional(),
  });
}

/**
 * Type guard to check if a value is a Response
 * @template T - The expected data type
 * @param {unknown} value - Value to check
 * @returns {boolean} True if value matches Response structure
 */
export function isResponse<T>(value: unknown): value is Response<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'data' in value &&
    (!('error' in value) ||
      (typeof value.error === 'object' && value.error !== null))
  );
}

/**
 * Creates an error response object
 * @param {Partial<ErrorResponse> & { message: string }} error - Error information
 * @returns {Response<never>} Formatted error response
 */
export function createErrorResponse(
  error: Partial<ErrorResponse> & { message: string }
): Response<never> {
  return {
    success: false,
    data: null as never,
    error: {
      code: error.code ?? 'INTERNAL_SERVER_ERROR',
      message: error.message,
      status: error.status ?? 500,
      details: error.details,
    },
  };
}
