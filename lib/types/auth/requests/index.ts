import { z } from 'zod';

/**
 * @fileoverview Auth-specific schemas and types
 */

// Export base response types
export type { Response } from '@/lib/types/responses/base';

// Auth-specific schemas
export const createOrganizationRequestSchema = z.object({
  name: z.string().min(1),
  userId: z.string(),
});

export const updateOrganizationRequestSchema =
  createOrganizationRequestSchema.partial();

// Re-export pagination types
export {
  type PaginationMeta,
  type PaginationParams,
  createPaginatedResponseSchema,
} from '@/lib/types/responses/pagination';
