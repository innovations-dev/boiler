/**
 * @fileoverview Organization schemas and types
 * @module lib/db/_schema/organization
 */

import { z } from 'zod';

import { organizationRoleSchema } from './index';

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
  activeSessions: z.number().int().min(0),
  pendingInvitations: z.number().int().min(0),
  lastActivityAt: z.date(),
});

export type OrganizationMetrics = z.infer<typeof organizationMetricsSchema>;

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
