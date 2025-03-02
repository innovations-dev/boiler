import { notFound, redirect } from 'next/navigation';
import { and, eq } from 'drizzle-orm';

import { Shell } from '@/components/shell';
import { getOrganizationAccess } from '@/lib/auth/organization/get-organization-access';
import { db } from '@/lib/db';
import { member, organization } from '@/lib/db/schema';
import { logger } from '@/lib/logger';

import { OrganizationForm } from '../../../_components/settings/organization-form';

interface SettingsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { slug } = await params;

  const { hasAccess, session } = await getOrganizationAccess(slug);

  logger.debug('Organization access check result', {
    hasAccess,
    hasSession: !!session,
    userId: session?.user?.id,
    userEmail: session?.user?.email,
    component: slug + ': SettingsPage',
  });

  // Redirect if not authenticated
  if (!session) {
    const redirectUrl =
      '/sign-in?callbackUrl=/organizations/' + slug + '/settings';
    logger.debug('No session, redirecting to sign-in', {
      redirectUrl,
      component: 'SettingsPage',
    });
    redirect(redirectUrl);
  }

  // Redirect if no access
  if (!hasAccess) {
    logger.debug('No access, redirecting to organizations', {
      slug,
      userId: session.user.id,
      component: 'SettingsPage',
    });
    redirect('/organizations');
  }

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
}
