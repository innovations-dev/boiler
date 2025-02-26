import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from 'drizzle-zod';
import { z } from 'zod';

import { member, organization, session, user } from '../schema';

// Base schemas from Drizzle
export const userSchema = createSelectSchema(user);
export const organizationSchema = createSelectSchema(organization);
export const memberSchema = createSelectSchema(member);

// Input schemas for operations
export const createOrganizationSchema = z.object({
  name: z.string().min(2).max(50),
  slug: z.string().min(2).max(50).optional(),
});

export const updateOrganizationSchema = createOrganizationSchema.partial();

export const createMemberSchema = z.object({
  organizationId: z.string(),
  userId: z.string(),
  role: z.enum(['ADMIN', 'MEMBER']),
});

// Type exports
export type User = z.infer<typeof userSchema>;
export type Organization = z.infer<typeof organizationSchema>;
export type Member = z.infer<typeof memberSchema>;
export const corecedSessionSelectSchema = createSelectSchema(session, {
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

export type CoercedSession = z.infer<typeof corecedSessionSelectSchema>;
export type Session = z.infer<typeof sessionSelectSchema>;
export type SessionInsert = typeof session.$inferInsert;

export const setActiveOrganizationInputSchema = z.object({
  sessionId: z.string(),
  organizationId: z.string(),
});
