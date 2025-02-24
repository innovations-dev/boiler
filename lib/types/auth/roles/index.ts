/**
 * @constant USER_ROLES
 * @description Defines the available user role types in the application.
 * These roles are used for authorization and access control.
 * @example
 * import { USER_ROLES } from '@/lib/constants/roles';
 *
 * // Check if user has admin role
 * if (userRole === USER_ROLES.ADMIN) {
 *   // Handle admin-specific logic
 * }
 */
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
} as const;

/**
 * @constant MEMBER_ROLES
 * @description Defines the available member role types in the application.
 * These roles are used for authorization and access control.
 * @example
 * import { MEMBER_ROLES } from '@/lib/constants/roles';
 *
 * // Check if user has admin role
 * if (memberRole === MEMBER_ROLES.OWNER) {
 *   // Handle owner-specific logic
 * }
 */
export const MEMBER_ROLES = {
  OWNER: 'owner',
  MEMBER: 'member',
} as const;

/**
 * @typedef {keyof typeof USER_ROLES} UserRole
 * @description TypeScript type representing valid user roles.
 * Used for type-safety when working with user roles.
 * @enum {string}
 * @readonly
 * @example
 * import type { UserRole } from '@/lib/constants/roles';
 *
 * function checkPermission(role: UserRole) {
 *   // Type-safe role checking
 * }
 */
export type UserRole = keyof typeof USER_ROLES;
export type MemberRole = keyof typeof MEMBER_ROLES;

/**
 * @constant USER_ROLE_LABELS
 * @description Human-readable labels for each user role.
 * Useful for displaying role names in the UI.
 * @type {Record<UserRole, string>}
 * @example
 * import { USER_ROLE_LABELS } from '@/lib/constants/roles';
 *
 * // Display user role in UI
 * function RoleLabel({ role }: { role: UserRole }) {
 *   return <span>{USER_ROLE_LABELS[role]}</span>;
 * }
 */
export const USER_ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Administrator',
  USER: 'Regular User',
};

/**
 * @constant MEMBER_ROLE_LABELS
 * @description Human-readable labels for each member role.
 * Useful for displaying role names in the UI.
 * @type {Record<MemberRole, string>}
 * @example
 * import { MEMBER_ROLE_LABELS } from '@/lib/constants/roles';
 *
 * // Display member role in UI
 * function RoleLabel({ role }: { role: MemberRole }) {
 *   return <span>{MEMBER_ROLE_LABELS[role]}</span>;
 * }
 */

export const MEMBER_ROLE_LABELS: Record<MemberRole, string> = {
  OWNER: 'Owner',
  MEMBER: 'Member',
};
