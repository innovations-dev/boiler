import { z } from 'zod';

import { type Response } from '@/lib/types/responses/base';
import { type ErrorResponse } from '@/lib/types/responses/error';

// Re-export base response type as ApiResponse for backward compatibility
export type { Response as ApiResponse } from '@/lib/types/responses/base';

// Auth-specific schemas
export const createOrganizationRequestSchema = z.object({
  name: z.string().min(1),
  userId: z.string(),
});

export const updateOrganizationRequestSchema =
  createOrganizationRequestSchema.partial();

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
  type PaginationMeta,
  type PaginationParams,
  createPaginatedResponseSchema,
} from '@/lib/types/responses/pagination';
