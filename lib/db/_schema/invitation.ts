/**
 * @fileoverview Invitation schemas and types
 * @module lib/db/_schema/invitation
 */

import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from 'drizzle-zod';
import { z } from 'zod';

import { invitation } from '../schema';
import { organizationRoleSchema } from './index';

// Helper function for date transformation
const dateTransformer = (val: Date | string | null | undefined) => {
  if (val === null || val === undefined) return new Date();
  return typeof val === 'string' ? new Date(val) : val;
};

// Base invitation schema
export const invitationSchema = createSelectSchema(invitation);

// Enhanced invitation schema with proper types
export const enhancedInvitationSchema = invitationSchema.extend({
  expiresAt: z
    .union([z.date(), z.string(), z.null(), z.undefined()])
    .transform(dateTransformer),
  status: z.enum(['pending', 'accepted', 'rejected', 'canceled']),
  role: organizationRoleSchema,
});

// Schema for creating a new invitation
export const createInvitationSchema = createInsertSchema(invitation).extend({
  status: z.enum(['pending', 'accepted', 'rejected', 'canceled']),
  role: organizationRoleSchema,
});

// Schema for updating an invitation
export const updateInvitationSchema = createUpdateSchema(invitation).extend({
  status: z.enum(['pending', 'accepted', 'rejected', 'canceled']).optional(),
  role: organizationRoleSchema.optional(),
});

// Types
export type Invitation = z.infer<typeof enhancedInvitationSchema>;
export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;
export type UpdateInvitationInput = z.infer<typeof updateInvitationSchema>;
