'use client';

/**
 * @fileoverview Organization context provider and hooks
 * @module lib/context/organization
 */
import { createContext, useCallback, useContext, useMemo } from 'react';

import { AppError } from '@/lib/errors';
import {
  ROLE_PERMISSIONS,
  type Organization,
  type OrganizationMember,
  type OrganizationPermission,
  type OrganizationRole,
} from '@/lib/types/organization';
import { ERROR_CODES } from '@/lib/types/responses/error';

interface OrganizationContextValue {
  organization: Organization;
  currentMember: OrganizationMember;
  hasPermission: (permission: OrganizationPermission) => boolean;
  isRole: (role: OrganizationRole) => boolean;
}

const OrganizationContext = createContext<OrganizationContextValue | null>(
  null
);

interface OrganizationProviderProps {
  organization: Organization;
  currentMember: OrganizationMember;
  children: React.ReactNode;
}

export function OrganizationProvider({
  organization,
  currentMember,
  children,
}: OrganizationProviderProps) {
  const hasPermission = useCallback(
    (permission: OrganizationPermission) => {
      const rolePermissions = ROLE_PERMISSIONS[currentMember.role];
      return rolePermissions.includes(permission);
    },
    [currentMember.role]
  );

  const isRole = useCallback(
    (role: OrganizationRole) => currentMember.role === role,
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

export function useRequirePermission(permission: OrganizationPermission) {
  const { hasPermission } = useOrganization();

  if (!hasPermission(permission)) {
    throw new AppError('You do not have permission to access this resource', {
      code: ERROR_CODES.FORBIDDEN,
      status: 403,
    });
  }
}
