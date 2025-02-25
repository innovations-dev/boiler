'use client';

import { Activity, Mail, Users } from 'lucide-react';

import { useOrganizationMetrics } from '@/lib/hooks/organizations/use-organization-data';

import { MetricCard } from './metric-card';

interface MetricsGridProps {
  slug: string;
}

export function MetricsGrid({ slug }: MetricsGridProps) {
  const { data: metrics, isLoading } = useOrganizationMetrics(slug);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <MetricCard
        title="Total Members"
        value={metrics?.totalMembers ?? 0}
        icon={<Users className="h-4 w-4" />}
        description="Total organization members"
        isLoading={isLoading}
      />
      <MetricCard
        title="Active Sessions"
        value={metrics?.activeSessions ?? 0}
        icon={<Activity className="h-4 w-4" />}
        description="Currently active users"
        isLoading={isLoading}
      />
      <MetricCard
        title="Pending Invitations"
        value={metrics?.pendingInvitations ?? 0}
        icon={<Mail className="h-4 w-4" />}
        description="Awaiting response"
        isLoading={isLoading}
      />
    </div>
  );
}
