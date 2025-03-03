import { notFound, redirect } from 'next/navigation';

import { OrganizationProvider } from '@/app/(dashboard)/_context/organization-context';
import { Shell } from '@/components/shell';
import { withOrganizationAccess } from '@/lib/auth/organization/with-organization-access';
import { organizationService } from '@/lib/better-auth/organization';
import { logger } from '@/lib/logger';

import { OrganizationForm } from '../../../_components/settings/organization-form';

interface SettingsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { slug } = await params;

  return withOrganizationAccess(slug, async (session) => {
    try {
      // Use Better-Auth client to get the organization
      const org = await organizationService.getFullOrganization(slug);

      // Check if user has permission to edit settings (must be OWNER or ADMIN)
      const userMember = org.members?.find((m) => m.userId === session.user.id);

      if (!userMember) {
        logger.debug('User is not a member of the organization', {
          userId: session.user.id,
          orgSlug: slug,
          component: 'SettingsPage',
        });
        redirect('/organizations/' + slug);
      }

      if (userMember.role !== 'OWNER' && userMember.role !== 'ADMIN') {
        logger.debug('User does not have permission to edit settings', {
          userId: session.user.id,
          orgSlug: slug,
          role: userMember.role,
          component: 'SettingsPage',
        });
        redirect('/organizations/' + slug);
      }

      logger.debug('Access granted to settings page', {
        userId: session.user.id,
        orgId: org.id,
        role: userMember.role,
        component: 'SettingsPage',
      });

      return (
        <OrganizationProvider organization={org} currentMember={userMember}>
          <Shell>
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Organization Settings
                </h1>
                <p className="text-muted-foreground">
                  Manage your organization profile and preferences
                </p>
              </div>

              <OrganizationForm organization={org} />
            </div>
          </Shell>
        </OrganizationProvider>
      );
    } catch (error) {
      logger.error('Error fetching organization', {
        slug,
        error: error instanceof Error ? error.message : String(error),
        component: 'SettingsPage',
      });
      notFound();
    }
  });
}
