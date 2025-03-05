/**
 * @fileoverview Custom hook for fetching organization workspaces using React Query
 * @module lib/hooks/org/use-org-workspaces
 */

'use client';

import { useQuery } from '@tanstack/react-query';

import { createOrgAdapter } from '@/lib/adapters/factory';
import { queryKeys } from '@/lib/query/keys';
import { orgWorkspaceSchema } from '@/lib/schemas/org-schemas';

import type { PaginationOptions } from './use-org-activity';

/**
 * Hook for fetching all workspaces for an organization
 * @param {string} orgId - Organization ID
 * @param {PaginationOptions} paginationOptions - Pagination options
 * @returns Query result with organization workspaces
 */
export function useOrgWorkspaces(
  orgId: string,
  paginationOptions?: PaginationOptions
) {
  return useQuery({
    queryKey: [...queryKeys.org.workspaces.all(orgId), paginationOptions],
    queryFn: async () => {
      const orgAdapter = createOrgAdapter();
      const workspaces = await orgAdapter.getOrgWorkspaces(
        orgId,
        paginationOptions
      );

      // Validate the response data
      return orgWorkspaceSchema.array().parse(workspaces);
    },
    enabled: Boolean(orgId),
  });
}

/**
 * Hook for fetching a specific workspace
 * @param {string} workspaceId - Workspace ID
 * @returns Query result with workspace details
 */
export function useOrgWorkspace(workspaceId: string) {
  return useQuery({
    queryKey: queryKeys.org.workspaces.detail(workspaceId),
    queryFn: async () => {
      const orgAdapter = createOrgAdapter();
      const workspace = await orgAdapter.getOrgWorkspace(workspaceId);

      // Validate the response data
      return orgWorkspaceSchema.parse(workspace);
    },
    enabled: Boolean(workspaceId),
  });
}
