import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from 'drizzle-zod';
import { z } from 'zod';

import { member, organization, session, user } from '../schema';

// ===== Helper Functions =====

// Date transformation helper
const dateTransformer = (val: Date | string | null | undefined) => {
  if (val === null || val === undefined) return new Date();
  return typeof val === 'string' ? new Date(val) : val;
};

// ===== Base Schemas =====

// Base schemas from Drizzle
export const userSchema = createSelectSchema(user);
export const memberSchema = createSelectSchema(member);

// Role definitions
export const organizationRoleSchema = z.enum([
  'OWNER',
  'ADMIN',
  'MEMBER',
  'GUEST',
]);

// Base organization schema - defines the core structure
const organizationBaseSchema = createSelectSchema(organization, {
  createdAt: z
    .union([z.date(), z.string(), z.null()])
    .transform(dateTransformer),
  updatedAt: z
    .union([z.date(), z.string(), z.null(), z.undefined()])
    .transform(dateTransformer),
  metadata: z.string().nullable().optional().default('{}'),
  id: z.string(),
  slug: z.string().nullable(),
});

// ===== Derived Organization Schemas =====

// Complete organization schema for API responses
export const organizationSchema = organizationBaseSchema.passthrough();

// Schema for creating a new organization
export const createOrganizationSchema = organizationBaseSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .partial({
    slug: true,
    logo: true,
    metadata: true,
  });

// Schema for updating an organization
export const updateOrganizationSchema = createOrganizationSchema.partial();

// Schema for organization settings
export const organizationSettingsSchema = z.object({
  name: z.string().min(2).max(50),
  slug: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/),
  logo: z.string().nullable().optional(),
});

// ===== Member Schemas =====

export const createMemberSchema = z.object({
  organizationId: z.string(),
  userId: z.string(),
  role: z.enum(['ADMIN', 'MEMBER']),
});

// ===== Session Schemas =====

export const coercedSessionSelectSchema = createSelectSchema(session, {
  expiresAt: z.coerce.string(),
  createdAt: z.coerce.string(),
  updatedAt: z.coerce.string(),
  token: z.string().transform((val) => val.replace(/['"]/g, '')),
  // TODO: temporarily nullish until we have a way to get the organization id
  activeOrganizationId: z.string().nullish(),
});

export const sessionSelectSchema = createSelectSchema(session);
export const sessionInsertSchema = createInsertSchema(session);
export const sessionUpdateSchema = createUpdateSchema(session);

export const setActiveOrganizationInputSchema = z.object({
  sessionId: z.string(),
  organizationId: z.string(),
});

// ===== Type Exports =====

export type User = z.infer<typeof userSchema>;
export type Organization = z.infer<typeof organizationSchema>;
export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
export type OrganizationSettings = z.infer<typeof organizationSettingsSchema>;
export type OrganizationRole = z.infer<typeof organizationRoleSchema>;
export type Member = z.infer<typeof memberSchema>;
export type CoercedSession = z.infer<typeof coercedSessionSelectSchema>;
export type Session = z.infer<typeof sessionSelectSchema>;
export type SessionInsert = typeof session.$inferInsert;
