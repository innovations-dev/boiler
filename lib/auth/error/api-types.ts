/**
 * @fileoverview Re-exports of response types for backward compatibility
 * @deprecated Use imports from lib/types/responses/* directly
 */

export {
  type ErrorCode as ApiErrorCode,
  type ErrorResponse as ApiError,
  ERROR_CODES as API_ERROR_CODES,
  errorSchema as apiErrorSchema,
} from '@/lib/types/responses/error';

export {
  type Response as ApiResponse,
  createResponseSchema as createApiResponseSchema,
} from '@/lib/types/responses/base';
