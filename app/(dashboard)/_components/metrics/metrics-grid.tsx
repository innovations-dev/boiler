'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Activity, Mail, Users } from 'lucide-react';
import { toast } from 'sonner';

import {
  useActiveSessions,
  useOrganization,
  useOrganizationMetrics,
} from '@/lib/hooks/organizations/use-better-auth-organization';

import { MetricCard } from './metric-card';

interface MetricsGridProps {
  slug: string;
}

export function MetricsGrid({ slug }: MetricsGridProps) {
  const router = useRouter();

  const { data: organization, error: organizationError } =
    useOrganization(slug);
  const organizationId = organization?.id;

  const {
    data: metrics,
    isLoading: isLoadingMetrics,
    error: metricsError,
  } = useOrganizationMetrics(organizationId || '');
  const {
    data: activeSessions,
    isLoading: isLoadingActiveSessions,
    error: activeSessionsError,
  } = useActiveSessions(organizationId || '');

  // Handle authentication errors
  useEffect(() => {
    const errors = [
      organizationError,
      metricsError,
      activeSessionsError,
    ].filter(Boolean);

    if (errors.length > 0) {
      // Check if any error is an authentication error
      const authError = errors.find(
        (error) =>
          error?.message?.includes('not authorized') ||
          error?.message?.includes('unauthorized')
      );

      if (authError) {
        toast.error('Your session has expired. Please sign in again.');
        router.push(
          `/sign-in?callbackUrl=/organizations/${slug}&error=session_expired`
        );
      }
    }
  }, [organizationError, metricsError, activeSessionsError, router, slug]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <MetricCard
        title="Total Members"
        value={metrics?.totalMembers ?? 0}
        icon={<Users className="h-4 w-4" />}
        description="Total organization members"
        isLoading={isLoadingMetrics || !organizationId}
      />
      <MetricCard
        title="Active Sessions"
        value={activeSessions?.activeSessions ?? 0}
        icon={<Activity className="h-4 w-4" />}
        description="Currently active users"
        isLoading={isLoadingActiveSessions || !organizationId}
      />
      <MetricCard
        title="Pending Invitations"
        value={metrics?.pendingInvitations ?? 0}
        icon={<Mail className="h-4 w-4" />}
        description="Awaiting response"
        isLoading={isLoadingMetrics || !organizationId}
      />
    </div>
  );
}
