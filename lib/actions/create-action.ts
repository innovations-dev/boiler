// lib/actions/create-action.ts
import { z } from 'zod';

import { handleUnknownError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { ApiErrorCode, ApiResponse } from '@/lib/types/auth/requests';
import { type Response } from '@/lib/types/responses/base';
import { type ErrorCode } from '@/lib/types/responses/error';

/**
 * Creates a type-safe server action with input validation and error handling
 *
 * @template Input - The type of the input data
 * @template Output - The type of the successful response data
 *
 * @param options - Configuration options
 * @param options.schema - Optional Zod schema for input validation
 * @param options.handler - Async function to process the validated input
 * @param options.input - The input data to validate and process
 * @param options.context - Context identifier for logging (default: "unknown")
 *
 * @returns A type-safe API response object
 *
 * @example
 * ```typescript
 * const createUser = async (input: CreateUserInput) => {
 *   return createAction({
 *     schema: createUserSchema,
 *     handler: async (data) => {
 *       return db.insert(users).values(data);
 *     },
 *     input,
 *     context: 'createUser'
 *   });
 * };
 * ```
 */
export async function createAction<Input, Output>({
  schema,
  handler,
  input,
  context = 'unknown',
}: {
  schema?: z.ZodType<Input>;
  handler: (validatedInput: Input) => Promise<Output>;
  input: Input;
  context?: string;
}): Promise<Response<Output>> {
  try {
    const validatedInput = schema ? schema.parse(input) : input;
    const result = await handler(validatedInput);

    logger.debug('Action succeeded', {
      context,
      action: context,
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    const appError = handleUnknownError(error);

    return {
      success: false,
      data: null as Output,
      error: {
        code: appError.code as ErrorCode,
        message: appError.message,
        status: appError.status,
      },
    };
  }
}
