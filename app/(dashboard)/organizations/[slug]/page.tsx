import { Suspense } from 'react';
import { redirect } from 'next/navigation';

import { Shell } from '@/components/shell';
import { getOrganizationAccess } from '@/lib/auth/organization/get-organization-access';

import { MetricsGrid } from '../../_components/metrics/metrics-grid';
import { MetricsSkeleton } from '../../_components/metrics/metrics-skeleton';

interface OrganizationPageProps {
  params: Promise<{ slug: string }>;
}

export default async function OrganizationPage({
  params,
}: OrganizationPageProps) {
  const { slug } = await params;

  const { hasAccess, session } = await getOrganizationAccess(slug);

  if (!session) {
    redirect('/sign-in?callbackUrl=/organizations/' + slug);
  }

  if (!hasAccess) {
    redirect('/organizations');
  }

  return (
    <Shell>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>
        <Suspense fallback={<MetricsSkeleton />}>
          <MetricsGrid slug={slug} />
        </Suspense>
      </div>
    </Shell>
  );
}
