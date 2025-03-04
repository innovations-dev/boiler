/**
 * @fileoverview Organization context provider and hooks using Better-Auth
 */

'use client';

import { createContext, useCallback, useContext, useMemo } from 'react';

import {
  Organization,
  OrganizationMember,
} from '@/lib/better-auth/organization';
import { AppError } from '@/lib/errors';
import {
  useOrganization as useBetterAuthOrganization,
  useHasPermission,
  useOrganizationMember,
} from '@/lib/hooks/organizations/use-better-auth-organization';
import { ERROR_CODES } from '@/lib/types/responses/error';

interface OrganizationContextValue {
  organization: Organization;
  currentMember: OrganizationMember;
  hasPermission: (permission: string) => boolean;
  isRole: (role: string) => boolean;
}

const OrganizationContext = createContext<OrganizationContextValue | null>(
  null
);

interface OrganizationProviderProps {
  organization: Organization;
  currentMember: OrganizationMember;
  children: React.ReactNode;
}

/**
 * Organization context provider
 */
export function OrganizationProvider({
  organization,
  currentMember,
  children,
}: OrganizationProviderProps) {
  /**
   * Check if the current user has a specific permission in the organization
   * Using the Better-Auth permission system
   *
   * Note: For immediate UI decisions, we use role-based defaults
   * For accurate permission checks, use the useCheckPermission hook
   */
  const hasPermission = useCallback(
    (permission: string) => {
      if (!organization?.id) return false;

      // Role-based permission logic for immediate UI decisions
      // This is a fallback for synchronous permission checks
      if (currentMember.role === 'OWNER') return true;

      if (currentMember.role === 'ADMIN') {
        const ownerOnlyPermissions = [
          'delete_organization',
          'transfer_ownership',
        ];
        return !ownerOnlyPermissions.includes(permission);
      }

      if (currentMember.role === 'MEMBER') {
        const memberPermissions = [
          'view_organization',
          'view_members',
          'create_content',
          'edit_own_content',
        ];
        return memberPermissions.includes(permission);
      }

      return false;
    },
    [organization?.id, currentMember.role]
  );

  const isRole = useCallback(
    (role: string) => currentMember.role === role,
    [currentMember.role]
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
 * Hook to access organization context
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

export function useOrganizationPermissions() {
  const { hasPermission, isRole } = useOrganization();
  return { hasPermission, isRole };
}

/**
 * Hook to check if the current user has a specific permission
 * This uses the Better-Auth permission system for accurate permission checking
 */
export function useCheckPermission(permission: string) {
  const { organization } = useOrganization();
  return useHasPermission(organization.id, permission);
}

export function useRequirePermission(permission: string) {
  const { hasPermission } = useOrganization();

  if (!hasPermission(permission)) {
    throw new AppError('You do not have permission to access this resource', {
      code: ERROR_CODES.FORBIDDEN,
      status: 403,
    });
  }
}
