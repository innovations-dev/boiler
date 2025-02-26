'use client';

import { Suspense } from 'react';

import { Shell } from '@/components/shell';

import { MetricsGrid } from './components/metrics/metrics-grid';
import { MetricsSkeleton } from './components/metrics/metrics-skeleton';

interface OrganizationPageProps {
  params: {
    slug: string;
  };
}

export default function OrganizationPage({ params }: OrganizationPageProps) {
  return (
    <Shell>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>
        <Suspense fallback={<MetricsSkeleton />}>
          <MetricsGrid slug={params.slug} />
        </Suspense>
      </div>
    </Shell>
  );
}
