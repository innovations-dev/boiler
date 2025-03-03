'use client';

import { Activity, Mail, Users } from 'lucide-react';

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
  const { data: organization } = useOrganization(slug);
  const organizationId = organization?.id;

  const { data: metrics, isLoading: isLoadingMetrics } = useOrganizationMetrics(
    organizationId || ''
  );
  const { data: activeSessions, isLoading: isLoadingActiveSessions } =
    useActiveSessions(organizationId || '');

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
