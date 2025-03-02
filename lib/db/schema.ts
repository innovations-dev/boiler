import { relations, sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// Import organization extensions schema
import {
  organizationActivities,
  organizationCustomPermissions,
  organizationMetrics,
  organizationWorkspaces,
} from './schema/organization-extensions';

export const user = sqliteTable(
  'user',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    emailVerified: integer('email_verified', { mode: 'boolean' }).notNull(),
    image: text('image'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
    role: text('role'),
    banned: integer('banned', { mode: 'boolean' }),
    banReason: text('ban_reason'),
    banExpires: integer('ban_expires', { mode: 'timestamp' }),
  },
  (t) => [
    index('email_idx').on(t.email),
    index('email_verified_idx').on(t.emailVerified),
    index('name_idx').on(t.name),
    index('role_idx').on(t.role),
  ]
);

export const session = sqliteTable(
  'session',
  {
    id: text('id').primaryKey(),
    expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
    token: text('token').notNull().unique(),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    impersonatedBy: text('impersonated_by'),
    activeOrganizationId: text('active_organization_id'),
  },
  (t) => [
    index('user_idx').on(t.userId),
    index('active_organization_idx').on(t.activeOrganizationId),
  ]
);

export const account = sqliteTable(
  'account',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: integer('access_token_expires_at', {
      mode: 'timestamp',
    }),
    refreshTokenExpiresAt: integer('refresh_token_expires_at', {
      mode: 'timestamp',
    }),
    scope: text('scope'),
    password: text('password'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  },
  (t) => [
    index('acct_user_idx').on(t.userId),
    index('acct_id_idx').on(t.accountId),
    index('acct_provider_idx').on(t.providerId),
  ]
);

export const verification = sqliteTable(
  'verification',
  {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }),
    updatedAt: integer('updated_at', { mode: 'timestamp' }),
  },
  (t) => [index('identifier_idx').on(t.identifier)]
);

export const organization = sqliteTable(
  'organization',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    slug: text('slug').unique(),
    logo: text('logo'),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .default(sql`unixepoch()`)
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .default(sql`unixepoch()`)
      .notNull(),
    metadata: text('metadata'),
  },
  (t) => [
    index('org_slug_idx').on(t.slug),
    index('org_id_idx').on(t.id),
    index('org_name_idx').on(t.name),
  ]
);

export const member = sqliteTable(
  'member',
  {
    id: text('id').primaryKey(),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    role: text('role').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  },
  (t) => [
    index('member_org_idx').on(t.organizationId),
    index('member_user_idx').on(t.userId),
    index('member_role_idx').on(t.role),
  ]
);

export const invitation = sqliteTable(
  'invitation',
  {
    id: text('id').primaryKey(),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),
    email: text('email').notNull(),
    role: text('role'),
    status: text('status').notNull(),
    expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
    inviterId: text('inviter_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
  },
  (t) => [
    index('invitation_org_idx').on(t.organizationId),
    index('invitation_email_idx').on(t.email),
    index('invitation_id_idx').on(t.id),
  ]
);

export const usersToOrganizations = sqliteTable('users_to_organizations', {
  userId: text('user_id')
    .notNull()
    .references(() => user.id),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organization.id),
});

export const usersToOrganizationsRelations = relations(
  usersToOrganizations,
  ({ one }) => ({
    organization: one(organization, {
      fields: [usersToOrganizations.organizationId],
      references: [organization.id],
    }),
    user: one(user, {
      fields: [usersToOrganizations.userId],
      references: [user.id],
    }),
  })
);

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
  activeOrganization: one(organization, {
    fields: [session.activeOrganizationId],
    references: [organization.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const organizationRelations = relations(organization, ({ many }) => ({
  members: many(member),
  invitations: many(invitation),
  activeSessions: many(session, { relationName: 'activeOrganization' }),
  users: many(usersToOrganizations),
  metrics: many(organizationMetrics),
  activities: many(organizationActivities),
  workspaces: many(organizationWorkspaces),
}));

export const memberRelations = relations(member, ({ one }) => ({
  organization: one(organization, {
    fields: [member.organizationId],
    references: [organization.id],
  }),
  user: one(user, {
    fields: [member.userId],
    references: [user.id],
  }),
}));

export const invitationRelations = relations(invitation, ({ one }) => ({
  inviter: one(user, {
    fields: [invitation.inviterId],
    references: [user.id],
  }),
  organization: one(organization, {
    fields: [invitation.organizationId],
    references: [organization.id],
  }),
}));

// Organization extensions relations
export const organizationMetricsRelations = relations(
  organizationMetrics,
  ({ one }) => ({
    organization: one(organization, {
      fields: [organizationMetrics.organizationId],
      references: [organization.id],
    }),
  })
);

export const organizationActivitiesRelations = relations(
  organizationActivities,
  ({ one }) => ({
    organization: one(organization, {
      fields: [organizationActivities.organizationId],
      references: [organization.id],
    }),
    user: one(user, {
      fields: [organizationActivities.userId],
      references: [user.id],
    }),
  })
);

export const organizationWorkspacesRelations = relations(
  organizationWorkspaces,
  ({ one }) => ({
    organization: one(organization, {
      fields: [organizationWorkspaces.organizationId],
      references: [organization.id],
    }),
  })
);

export const organizationCustomPermissionsRelations = relations(
  organizationCustomPermissions,
  ({ one }) => ({
    organization: one(organization, {
      fields: [organizationCustomPermissions.organizationId],
      references: [organization.id],
    }),
    user: one(user, {
      fields: [organizationCustomPermissions.userId],
      references: [user.id],
    }),
    createdByUser: one(user, {
      fields: [organizationCustomPermissions.createdBy],
      references: [user.id],
      relationName: 'permissionCreator',
    }),
  })
);

// Export organization extensions schema
export {
  organizationMetrics,
  organizationActivities,
  organizationWorkspaces,
  organizationCustomPermissions,
};
