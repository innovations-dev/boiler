/**
 * @fileoverview Organization schemas and types
 * @module lib/db/_schema/organization
 */

import { z } from 'zod';

import { organizationRoleSchema } from './index';

// ===== Organization Schemas =====

export const createOrganizationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(
      /^[a-z0-9-]+$/,
      'Slug must contain only lowercase letters, numbers, and hyphens'
    ),
  logo: z.string().url().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type CreateOrganizationRequest = z.infer<
  typeof createOrganizationSchema
>;

export const updateOrganizationSchema = createOrganizationSchema
  .partial()
  .extend({
    id: z.string().min(1, 'Organization ID is required'),
  });

export type UpdateOrganizationRequest = z.infer<
  typeof updateOrganizationSchema
>;

// ===== Additional Schemas =====

// Organization member schema
export const organizationMemberSchema = z.object({
  id: z.string(),
  userId: z.string(),
  organizationId: z.string(),
  role: organizationRoleSchema,
  joinedAt: z.date(),
  lastActiveAt: z.date(),
});

export type OrganizationMember = z.infer<typeof organizationMemberSchema>;

// Organization metrics schema
export const organizationMetricsSchema = z.object({
  totalMembers: z.number().int().min(0),
  activeMembers: z.number().int().min(0),
  pendingInvitations: z.number().int().min(0),
  activeSessions: z.number().int().min(0),
  lastActivityAt: z.date(),
});

export type OrganizationMetrics = z.infer<typeof organizationMetricsSchema>;

// Organization activity schema
export const organizationActivitySchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  userId: z.string(),
  type: z.enum([
    'member_added',
    'member_removed',
    'member_role_updated',
    'organization_updated',
  ]),
  details: z.record(z.unknown()),
  createdAt: z.date(),
  user: z
    .object({
      id: z.string(),
      name: z.string().optional(),
      email: z.string().optional(),
      image: z.string().optional(),
    })
    .optional(),
});

export type OrganizationActivity = z.infer<typeof organizationActivitySchema>;

// Organization invitation schema
export const organizationInvitationSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  organizationId: z.string(),
  inviterId: z.string(),
  role: organizationRoleSchema,
  status: z.enum(['pending', 'accepted', 'rejected', 'canceled']),
  expiresAt: z.date(),
  createdAt: z.date(),
});

export type OrganizationInvitation = z.infer<
  typeof organizationInvitationSchema
>;

// ===== Permission Schemas =====

export const resourceTypeSchema = z.enum(['organization', 'project']);

export type ResourceType = z.infer<typeof resourceTypeSchema>;

export const permissionLevelSchema = z.enum(['read', 'write', 'admin']);

export type PermissionLevel = z.infer<typeof permissionLevelSchema>;

export const organizationPermissionSchema = z.enum([
  'org:view',
  'org:edit',
  'org:delete',
  'member:view',
  'member:invite',
  'member:remove',
  'member:role:edit',
  'settings:view',
  'settings:edit',
]);

export type OrganizationPermission = z.infer<
  typeof organizationPermissionSchema
>;

// Role to permissions mapping
export const ROLE_PERMISSIONS: Record<
  z.infer<typeof organizationRoleSchema>,
  OrganizationPermission[]
> = {
  OWNER: [
    'org:view',
    'org:edit',
    'org:delete',
    'member:view',
    'member:invite',
    'member:remove',
    'member:role:edit',
    'settings:view',
    'settings:edit',
  ],
  ADMIN: [
    'org:view',
    'org:edit',
    'member:view',
    'member:invite',
    'member:remove',
    'member:role:edit',
    'settings:view',
    'settings:edit',
  ],
  MEMBER: ['org:view', 'member:view', 'settings:view'],
  GUEST: ['org:view', 'member:view'],
} as const;
