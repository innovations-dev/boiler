import { notFound } from 'next/navigation';

import { OrganizationServiceImpl } from '@/lib/domains/organization/service-impl';
import { logger } from '@/lib/logger';

interface OrganizationSettingsPageProps {
  params: {
    slug: string;
  };
}

export default async function OrganizationSettingsPage({
  params: { slug },
}: OrganizationSettingsPageProps) {
  logger.debug('Organization settings page rendering', {
    component: 'OrganizationSettingsPage',
    slug,
    timestamp: new Date().toISOString(),
  });

  try {
    const organizationService = new OrganizationServiceImpl();
    const organization = await organizationService.getBySlug(slug);

    if (!organization) {
      logger.debug('Organization not found', {
        component: 'OrganizationSettingsPage',
        slug,
      });
      notFound();
    }

    logger.debug('Organization fetched successfully', {
      component: 'OrganizationSettingsPage',
      organizationId: organization.id,
      name: organization.name,
      slug: organization.slug,
    });

    return (
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-4">Organization Settings</h1>
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">Organization Details</h2>
            <p>Name: {organization.name}</p>
            <p>Slug: {organization.slug}</p>
            {/* Add more organization settings here */}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    logger.error('Error fetching organization:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      component: 'OrganizationSettingsPage',
      slug,
    });
    notFound();
  }
}
