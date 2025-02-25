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
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  CONFLICT: 'CONFLICT',
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',
  CONFIGURATION_ERROR: 'CONFIGURATION_ERROR',
  EMAIL_ERROR: 'EMAIL_ERROR',
  TEMPLATE_ERROR: 'TEMPLATE_ERROR',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

/**
 * Base schema for error responses
 */
export const errorSchema = z.object({
  message: z.string(),
  code: z.enum([
    ERROR_CODES.BAD_REQUEST,
    ERROR_CODES.UNAUTHORIZED,
    ERROR_CODES.FORBIDDEN,
    ERROR_CODES.NOT_FOUND,
    ERROR_CODES.VALIDATION_ERROR,
    ERROR_CODES.INTERNAL_SERVER_ERROR,
    ERROR_CODES.CONFLICT,
    ERROR_CODES.TOO_MANY_REQUESTS,
    ERROR_CODES.CONFIGURATION_ERROR,
    ERROR_CODES.EMAIL_ERROR,
    ERROR_CODES.TEMPLATE_ERROR,
  ]),
  status: z.number(),
});

export interface ErrorResponse {
  message: string;
  code: ErrorCode;
  status: number;
}
