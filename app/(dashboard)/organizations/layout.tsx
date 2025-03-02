import { redirect } from 'next/navigation';

import { getOrganizationAccess } from '@/lib/auth/organization/get-organization-access';
import { logger } from '@/lib/logger';

export default async function OrganizationLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug?: string };
}) {
  logger.debug('Organization layout rendering', {
    slug: params.slug,
    hasSlug: !!params.slug,
    component: 'OrganizationLayout',
    timestamp: new Date().toISOString(),
  });

  // If there's no slug, just render the children (for /organizations page)
  if (!params.slug) {
    logger.debug('Organization layout - no slug, rendering children directly', {
      component: 'OrganizationLayout',
    });
    return (
      <div className="organization-layout">
        <main>{children}</main>
      </div>
    );
  }

  const { hasAccess, session } = await getOrganizationAccess(params.slug);

  logger.debug('Organization layout access check result', {
    slug: params.slug,
    hasAccess,
    hasSession: !!session,
    userId: session?.user?.id,
    component: 'OrganizationLayout',
  });

  if (!session) {
    const redirectUrl = '/sign-in?callbackUrl=/organizations/' + params.slug;
    logger.debug('Organization layout - no session, redirecting to sign-in', {
      redirectUrl,
      component: 'OrganizationLayout',
    });
    redirect(redirectUrl);
  }

  if (!hasAccess) {
    logger.debug(
      'Organization layout - no access, redirecting to organizations',
      {
        slug: params.slug,
        userId: session.user.id,
        component: 'OrganizationLayout',
      }
    );
    redirect('/organizations');
  }

  logger.debug('Organization layout - access granted, rendering children', {
    slug: params.slug,
    userId: session.user.id,
    component: 'OrganizationLayout',
  });

  return (
    <div className="organization-layout">
      {/* Organization header, navigation, etc. */}
      <main>{children}</main>
    </div>
  );
}
