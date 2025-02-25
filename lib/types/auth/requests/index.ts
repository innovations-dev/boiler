// Auth-specific schemas
import { z } from 'zod';

/**
 * @fileoverview Auth-specific type definitions and re-exports of response types
 * @deprecated For response types, use imports from lib/types/responses/* directly
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

export {
  type PaginationMeta,
  type PaginationParams,
  createPaginatedResponseSchema,
} from '@/lib/types/responses/pagination';

/**
 * Schema for creating organization requests
 * @property {string} name - Organization name (2-100 characters)
 * @property {string} slug - Organization slug (2-100 characters)
 */
export const createOrganizationRequestSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(100),
});

export const updateOrganizationRequestSchema =
  createOrganizationRequestSchema.partial();
