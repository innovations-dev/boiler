import { ERROR_CODES, type ErrorCode } from '@/lib/types/responses/error';

export class HttpError extends Error {
  constructor(
    message: string,
    public code: ErrorCode = ERROR_CODES.INTERNAL_SERVER_ERROR,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export function handleHttpError(error: unknown): Error {
  if (error instanceof HttpError) return error;
  return new HttpError(error instanceof Error ? error.message : String(error));
}
