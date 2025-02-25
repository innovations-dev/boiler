/**
 * @fileoverview Pagination type definitions and utilities
 * @module lib/types/responses/pagination
 */

import { z } from 'zod';

import { createResponseSchema } from './base';

/**
 * Schema for pagination metadata
 */
export const paginationSchema = z.object({
  items: z.array(z.unknown()),
  totalCount: z.number().int().min(0),
  currentPage: z.number().int().min(1),
  totalPages: z.number().int().min(0),
  hasNextPage: z.boolean(),
  hasPreviousPage: z.boolean(),
  nextCursor: z.string().optional(),
});

export type PaginationMeta = z.infer<typeof paginationSchema>;

/**
 * Schema for pagination request parameters
 */
export const paginationParamsSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  cursor: z.string().optional(),
});

export type PaginationParams = z.infer<typeof paginationParamsSchema>;

/**
 * Creates a schema for paginated responses
 * @template T - The Zod schema type for individual items
 * @param {T} itemSchema - Schema for validating individual items
 * @returns {z.ZodType} Combined schema for paginated response
 */
export function createPaginatedResponseSchema<T extends z.ZodType>(
  itemSchema: T
) {
  return createResponseSchema(
    paginationSchema.extend({
      items: z.array(itemSchema),
    })
  );
}
