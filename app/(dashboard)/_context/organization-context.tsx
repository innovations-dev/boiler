'use client';

/**
 * @fileoverview Organization context provider and hooks
 * @module lib/context/organization
 * @deprecated This context provider uses legacy organization types and will be replaced with a Better-Auth based implementation.
 * Please use the Better-Auth hooks directly in new components.
 */
import { createContext, useCallback, useContext, useMemo } from 'react';

import {
  Organization as BetterAuthOrganization,
  OrganizationMember as BetterAuthOrganizationMember,
} from '@/lib/better-auth/organization';
import { Organization, OrganizationRole } from '@/lib/db/_schema';
import {
  OrganizationMember,
  OrganizationPermission,
  ROLE_PERMISSIONS,
} from '@/lib/db/_schema/organization';
import { AppError } from '@/lib/errors';
import { ERROR_CODES } from '@/lib/types/responses/error';

// Type adapter to ensure compatibility between Better-Auth and legacy types
type CompatibleOrganization = Organization | BetterAuthOrganization;
type CompatibleOrganizationMember =
  | OrganizationMember
  | BetterAuthOrganizationMember;

interface OrganizationContextValue {
  organization: CompatibleOrganization;
  currentMember: CompatibleOrganizationMember;
  hasPermission: (permission: OrganizationPermission) => boolean;
  isRole: (role: OrganizationRole) => boolean;
}

const OrganizationContext = createContext<OrganizationContextValue | null>(
  null
);

interface OrganizationProviderProps {
  organization: CompatibleOrganization;
  currentMember: CompatibleOrganizationMember;
  children: React.ReactNode;
}

/**
 * Organization context provider
 * @deprecated This provider uses legacy organization types and will be replaced with a Better-Auth based implementation.
 * Please use the Better-Auth hooks directly in new components.
 */
export function OrganizationProvider({
  organization,
  currentMember,
  children,
}: OrganizationProviderProps) {
  // Adapt the role from Better-Auth format to legacy format if needed
  const memberRole = (
    currentMember.role as string
  ).toUpperCase() as OrganizationRole;

  /**
   * Check if the user has a specific permission
   * @deprecated This uses legacy permission checking logic. In the future, use Better-Auth permission checking.
   */
  const hasPermission = useCallback(
    (permission: OrganizationPermission) => {
      const rolePermissions = ROLE_PERMISSIONS[memberRole];
      return rolePermissions?.includes(permission) || false;
    },
    [memberRole]
  );

  /**
   * Check if the user has a specific role
   * @deprecated This uses legacy role checking logic. In the future, use Better-Auth role checking.
   */
  const isRole = useCallback(
    (role: OrganizationRole) => memberRole === role,
    [memberRole]
  );

  const value = useMemo(
    () => ({
      organization,
      currentMember,
      hasPermission,
      isRole,
    }),
    [organization, currentMember, hasPermission, isRole]
  );

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
}

/**
 * Hook to access the organization context
 * @returns The organization context value
 * @throws {AppError} If used outside of an OrganizationProvider
 * @deprecated This hook uses legacy organization types. In the future, use Better-Auth hooks directly.
 */
export function useOrganization() {
  const context = useContext(OrganizationContext);

  if (!context) {
    throw new AppError(
      'useOrganization must be used within an OrganizationProvider',
      {
        code: ERROR_CODES.CONFIGURATION_ERROR,
        status: 500,
      }
    );
  }

  return context;
}

/**
 * Hook to access organization permissions
 * @returns The hasPermission and isRole functions
 * @deprecated This hook uses legacy permission checking logic. In the future, use Better-Auth permission checking.
 */
export function useOrganizationPermissions() {
  const { hasPermission, isRole } = useOrganization();
  return { hasPermission, isRole };
}

/**
 * Hook to require a specific permission
 * @param permission The permission to require
 * @throws {AppError} If the user does not have the required permission
 * @deprecated This hook uses legacy permission checking logic. In the future, use Better-Auth permission checking.
 */
export function useRequirePermission(permission: OrganizationPermission) {
  const { hasPermission } = useOrganization();

  if (!hasPermission(permission)) {
    throw new AppError('You do not have permission to access this resource', {
      code: ERROR_CODES.FORBIDDEN,
      status: 403,
    });
  }
}
