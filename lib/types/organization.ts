/**
 * @fileoverview Core organization types and interfaces
 * @module lib/types/organization
 */

import { z } from 'zod';

export const organizationRoleSchema = z.enum([
  'OWNER',
  'ADMIN',
  'MEMBER',
  'GUEST',
]);
export type OrganizationRole = z.infer<typeof organizationRoleSchema>;

export const organizationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Organization = z.infer<typeof organizationSchema>;

export const organizationMemberSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  organizationId: z.string().uuid(),
  role: organizationRoleSchema,
  joinedAt: z.date(),
  lastActiveAt: z.date(),
});

export type OrganizationMember = z.infer<typeof organizationMemberSchema>;

export const organizationMetricsSchema = z.object({
  totalMembers: z.number().int().min(0),
  activeSessions: z.number().int().min(0),
  pendingInvitations: z.number().int().min(0),
  lastActivityAt: z.date(),
});

export type OrganizationMetrics = z.infer<typeof organizationMetricsSchema>;

export const organizationInvitationSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  organizationId: z.string().uuid(),
  inviterId: z.string().uuid(),
  role: organizationRoleSchema,
  status: z.enum(['pending', 'accepted', 'rejected', 'canceled']),
  expiresAt: z.date(),
  createdAt: z.date(),
});

export type OrganizationInvitation = z.infer<
  typeof organizationInvitationSchema
>;

// Permission checking types
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
  OrganizationRole,
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

export const organizationSettingsSchema = z.object({
  name: z.string().min(2).max(50),
  slug: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/),
  logo: z.string().nullable().optional(),
});

export type OrganizationSettings = z.infer<typeof organizationSettingsSchema>;
