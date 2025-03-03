'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Activity, Mail, Users } from 'lucide-react';
import { toast } from 'sonner';

import { useOrganization } from '@/lib/hooks/organizations/use-better-auth-organization';
import { useOrganizationMetrics } from '@/lib/hooks/organizations/use-organization-extensions';

import { MetricCard } from './metric-card';

interface MetricsGridProps {
  slug: string;
}

export function MetricsGrid({ slug }: MetricsGridProps) {
  const router = useRouter();

  // Fetch organization data
  const {
    data: organization,
    error: organizationError,
    isLoading: isLoadingOrganization,
  } = useOrganization(slug);

  const organizationId = organization?.id;

  // Fetch metrics with our enhanced caching strategy
  const {
    data: metrics,
    isLoading: isLoadingMetrics,
    error: metricsError,
    refetch: refetchMetrics,
  } = useOrganizationMetrics(organizationId || '');

  // Handle authentication errors
  useEffect(() => {
    const errors = [organizationError, metricsError].filter(Boolean);

    if (errors.length > 0) {
      // Check if any error is an authentication error
      const authError = errors.find(
        (error) =>
          error?.message?.includes('not authorized') ||
          error?.message?.includes('unauthorized') ||
          error?.message?.includes('session expired')
      );

      if (authError) {
        toast.error('Your session has expired. Please sign in again.');
        router.push(
          `/sign-in?callbackUrl=/organizations/${slug}&error=session_expired`
        );
      } else {
        // For non-auth errors, we can try to refetch
        const retryableError = errors.find(
          (error) =>
            error?.message?.includes('Failed to fetch') ||
            error?.message?.includes('network')
        );

        if (retryableError && organizationId) {
          // Wait a moment and try again
          const timer = setTimeout(() => {
            refetchMetrics();
          }, 2000);

          return () => clearTimeout(timer);
        }
      }
    }
  }, [
    organizationError,
    metricsError,
    router,
    slug,
    organizationId,
    refetchMetrics,
  ]);

  // Show loading state if we're loading the organization or don't have an ID yet
  const isLoading = isLoadingOrganization || !organizationId;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <MetricCard
        title="Total Members"
        value={metrics?.totalMembers ?? 0}
        icon={<Users className="h-4 w-4" />}
        description="Total organization members"
        isLoading={isLoading || isLoadingMetrics}
      />
      <MetricCard
        title="Active Sessions"
        value={metrics?.activeSessions ?? 0}
        icon={<Activity className="h-4 w-4" />}
        description="Currently active users"
        isLoading={isLoading || isLoadingMetrics}
      />
      <MetricCard
        title="Pending Invitations"
        value={metrics?.pendingInvitations ?? 0}
        icon={<Mail className="h-4 w-4" />}
        description="Awaiting response"
        isLoading={isLoading || isLoadingMetrics}
      />
    </div>
  );
}
