'use client';

import { Activity, Mail, Users } from 'lucide-react';

import { useActiveSessions } from '@/lib/hooks/organizations/use-active-sessions';
import { useOrganizationMetrics } from '@/lib/hooks/organizations/use-organization-data';

import { MetricCard } from './metric-card';

interface MetricsGridProps {
  slug: string;
}

export function MetricsGrid({ slug }: MetricsGridProps) {
  const { data: metrics, isLoading: isLoadingMetrics } =
    useOrganizationMetrics(slug);
  const { data: activeSessions, isLoading: isLoadingActiveSessions } =
    useActiveSessions(slug);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <MetricCard
        title="Total Members"
        value={metrics?.totalMembers ?? 0}
        icon={<Users className="h-4 w-4" />}
        description="Total organization members"
        isLoading={isLoadingMetrics}
      />
      <MetricCard
        title="Active Sessions"
        value={activeSessions?.activeSessions ?? 0}
        icon={<Activity className="h-4 w-4" />}
        description="Currently active users"
        isLoading={isLoadingActiveSessions}
      />
      <MetricCard
        title="Pending Invitations"
        value={metrics?.pendingInvitations ?? 0}
        icon={<Mail className="h-4 w-4" />}
        description="Awaiting response"
        isLoading={isLoadingMetrics}
      />
    </div>
  );
}
