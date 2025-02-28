'use client';

import dynamic from 'next/dynamic';

// Dynamically import the OrganizationNav component
const OrganizationNav = dynamic(
  () => import('./org-nav').then((mod) => mod.OrganizationNav),
  {
    ssr: false,
    loading: () => (
      <div className="h-12 border-b flex items-center px-4">
        <div className="h-5 w-32 bg-muted animate-pulse rounded" />
      </div>
    ),
  }
);

export function OrganizationNavWrapper() {
  return <OrganizationNav />;
}
