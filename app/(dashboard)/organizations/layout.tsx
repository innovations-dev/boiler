import { withOrganizationAccess } from '@/lib/auth/organization/with-organization-access';
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

  // Use the withOrganizationAccess utility to handle access checks
  return withOrganizationAccess(params.slug, async (session) => {
    logger.debug('Organization layout - access granted, rendering children', {
      slug: params.slug,
      userId: session?.user?.id,
      component: 'OrganizationLayout',
    });

    return (
      <div className="organization-layout">
        {/* Organization header, navigation, etc. */}
        <main>{children}</main>
      </div>
    );
  });
}
