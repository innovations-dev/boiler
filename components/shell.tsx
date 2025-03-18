'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

// Dynamically import the OrganizationNavWrapper
const OrganizationNavWrapper = dynamic(
  () =>
    import('@/app/_components/navigation/org-nav-wrapper').then(
      (mod) => mod.OrganizationNavWrapper
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-12 border-b flex items-center px-4">
        <div className="h-5 w-32 bg-muted animate-pulse rounded" />
      </div>
    ),
  }
);

interface ShellProps {
  children: React.ReactNode;
}

export function Shell({ children }: ShellProps) {
  const pathname = usePathname();
  const isOrganizationPath =
    pathname?.includes('/organizations/') && !pathname?.includes('/api/');

  return (
    <div className="flex min-h-screen flex-col">
      {isOrganizationPath && pathname && pathname.split('/').length > 2 && (
        <OrganizationNavWrapper />
      )}
      <main className="flex-1">{children}</main>
    </div>
  );
}
