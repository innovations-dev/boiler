import { Suspense } from 'react';
import { redirect } from 'next/navigation';

import { OrganizationProvider } from '@/app/(dashboard)/_context/organization-context';
import { Shell } from '@/components/shell';
import { withOrganizationAccess } from '@/lib/auth/organization/with-organization-access';
import { organizationService } from '@/lib/better-auth/organization';

import { MetricsGrid } from '../../_components/metrics/metrics-grid';
import { MetricsSkeleton } from '../../_components/metrics/metrics-skeleton';

interface OrganizationPageProps {
  params: Promise<{ slug: string }>;
}

export default async function OrganizationPage({
  params,
}: OrganizationPageProps) {
  const { slug } = await params;

  return withOrganizationAccess(slug, async (session) => {
    try {
      // Fetch organization data using Better-Auth
      const organization = await organizationService.getFullOrganization(slug);

      // Find the current user's membership
      const currentMember = organization.members.find(
        (member) => member.userId === session?.user?.id
      );

      if (!currentMember) {
        throw new Error('User is not a member of this organization');
      }

      return (
        <OrganizationProvider
          organization={organization}
          currentMember={currentMember}
        >
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
        </OrganizationProvider>
      );
    } catch (error) {
      // Handle authentication errors
      if (error instanceof Error && error.message.includes('not authorized')) {
        // Redirect to sign-in page
        const redirectUrl = `/sign-in?callbackUrl=/organizations/${slug}&error=session_expired`;
        redirect(redirectUrl);
      }

      // Re-throw other errors
      throw error;
    }
  });
}
