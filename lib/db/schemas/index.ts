import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from 'drizzle-zod';
import { z } from 'zod';

import { session } from '../schema';

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
