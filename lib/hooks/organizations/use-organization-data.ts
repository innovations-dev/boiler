/**
 * @fileoverview Organization data fetching hooks
 * @module lib/hooks/organizations
 */

import { useQuery } from '@tanstack/react-query';

import { AppError } from '@/lib/errors';
import { queryKeys } from '@/lib/query/keys';
import {
  organizationMemberSchema,
  organizationMetricsSchema,
  organizationSchema,
  type Organization,
  type OrganizationMember,
  type OrganizationMetrics,
} from '@/lib/types/organization';
import { ERROR_CODES } from '@/lib/types/responses/error';

async function fetchOrganization(slug: string): Promise<Organization> {
  const response = await fetch(`/api/organizations/${slug}`);

  if (!response.ok) {
    throw new AppError('Failed to fetch organization', {
      code: ERROR_CODES.NOT_FOUND,
      status: response.status,
    });
  }

  const data = await response.json();
  return organizationSchema.parse(data);
}

async function fetchOrganizationMember(
  slug: string,
  userId: string
): Promise<OrganizationMember> {
  const response = await fetch(`/api/organizations/${slug}/members/${userId}`);

  if (!response.ok) {
    throw new AppError('Failed to fetch organization member', {
      code: ERROR_CODES.NOT_FOUND,
      status: response.status,
    });
  }

  const data = await response.json();
  return organizationMemberSchema.parse(data);
}

async function fetchOrganizationMetrics(
  slug: string
): Promise<OrganizationMetrics> {
  const response = await fetch(`/api/organizations/${slug}/metrics`);

  if (!response.ok) {
    throw new AppError('Failed to fetch organization metrics', {
      code: ERROR_CODES.NOT_FOUND,
      status: response.status,
    });
  }

  const data = await response.json();
  return organizationMetricsSchema.parse(data);
}

export function useOrganizationData(slug: string) {
  return useQuery({
    queryKey: queryKeys.organizations.detail(slug),
    queryFn: () => fetchOrganization(slug),
  });
}

export function useOrganizationMember(slug: string, userId: string) {
  return useQuery({
    queryKey: queryKeys.organizations.members.detail(slug, userId),
    queryFn: () => fetchOrganizationMember(slug, userId),
  });
}

export function useOrganizationMetrics(slug: string) {
  return useQuery({
    queryKey: queryKeys.organizations.metrics(slug),
    queryFn: () => fetchOrganizationMetrics(slug),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}
