/**
 * @fileoverview Core organization types and interfaces
 * @module lib/types/organization
 *
 * @deprecated This file is deprecated. Import directly from the schema files:
 * - Base organization schemas: import from '@/lib/db/_schema/index'
 * - Organization member/metrics/permissions: import from '@/lib/db/_schema/organization'
 * - Invitation schemas: import from '@/lib/db/_schema/invitation'
 */

import { z } from 'zod';

import {
  createMemberSchema,
  CreateOrganizationInput,
  createOrganizationSchema,
  Organization,
  OrganizationRole,
  organizationRoleSchema,
  organizationSchema,
  OrganizationSettings,
  organizationSettingsSchema,
  UpdateOrganizationInput,
  updateOrganizationSchema,
} from '@/lib/db/_schema';

// Re-export schemas and types from the database schema
export {
  createOrganizationSchema,
  organizationRoleSchema,
  organizationSchema,
  organizationSettingsSchema,
  updateOrganizationSchema,
  createMemberSchema,
};

// Re-export types
export type {
  Organization,
  OrganizationRole,
  OrganizationSettings,
  CreateOrganizationInput,
  UpdateOrganizationInput,
};

// ===== Additional Schemas =====

/**
 * @deprecated Import from '@/lib/db/_schema/organization' instead
 */
export const organizationMemberSchema = z.object({
  id: z.string(),
  userId: z.string(),
  organizationId: z.string(),
  role: organizationRoleSchema,
  joinedAt: z.date(),
  lastActiveAt: z.date(),
});

/**
 * @deprecated Import from '@/lib/db/_schema/organization' instead
 */
export type OrganizationMember = z.infer<typeof organizationMemberSchema>;

/**
 * @deprecated Import from '@/lib/db/_schema/organization' instead
 */
export const organizationMetricsSchema = z.object({
  totalMembers: z.number().int().min(0),
  activeSessions: z.number().int().min(0),
  pendingInvitations: z.number().int().min(0),
  lastActivityAt: z.date(),
});

/**
 * @deprecated Import from '@/lib/db/_schema/organization' instead
 */
export type OrganizationMetrics = z.infer<typeof organizationMetricsSchema>;

/**
 * @deprecated Import from '@/lib/db/_schema/organization' instead
 */
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

/**
 * @deprecated Import from '@/lib/db/_schema/organization' instead
 */
export type OrganizationInvitation = z.infer<
  typeof organizationInvitationSchema
>;

// ===== Permission Schemas =====

/**
 * @deprecated Import from '@/lib/db/_schema/organization' instead
 */
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

/**
 * @deprecated Import from '@/lib/db/_schema/organization' instead
 */
export type OrganizationPermission = z.infer<
  typeof organizationPermissionSchema
>;

/**
 * @deprecated Import from '@/lib/db/_schema/organization' instead
 */
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
