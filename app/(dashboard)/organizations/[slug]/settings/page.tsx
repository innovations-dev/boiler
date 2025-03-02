import { notFound, redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';

import { Shell } from '@/components/shell';
import { withOrganizationAccess } from '@/lib/auth/organization/with-organization-access';
import { db } from '@/lib/db';
import { member, organization } from '@/lib/db/schema';
import { logger } from '@/lib/logger';

import { OrganizationForm } from '../../../_components/settings/organization-form';

interface SettingsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { slug } = await params;

  return withOrganizationAccess(slug, async (session) => {
    const org = await db.query.organization.findFirst({
      where: eq(organization.slug, slug),
      with: {
        members: {
          where: eq(member.userId, session.user.id),
        },
      },
    });

    if (!org) {
      logger.debug('Organization not found', {
        slug,
        component: 'SettingsPage',
      });
      notFound();
    }

    // Check if user has permission to edit settings (must be OWNER or ADMIN)
    const userMember = org.members[0];

    if (!userMember) {
      redirect('/organizations/' + slug);
    }

    if (userMember.role !== 'OWNER' && userMember.role !== 'ADMIN') {
      redirect('/organizations/' + slug);
    }

    logger.debug('Access granted to settings page', {
      userId: session.user.id,
      orgId: org.id,
      role: userMember.role,
      component: 'SettingsPage',
    });

    return (
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
    );
  });
}
