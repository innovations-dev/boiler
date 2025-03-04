import { notFound } from 'next/navigation';

import { OrganizationServiceImpl } from '@/lib/domains/organization/service-impl';
import { logger } from '@/lib/logger';

interface OrganizationPageProps {
  params: {
    slug: string;
  };
}

export default async function OrganizationPage({
  params: { slug },
}: OrganizationPageProps) {
  logger.debug('Organization page rendering', {
    component: 'OrganizationPage',
    slug,
    timestamp: new Date().toISOString(),
  });

  try {
    const organizationService = new OrganizationServiceImpl();
    const organization = await organizationService.getBySlug(slug);

    if (!organization) {
      logger.debug('Organization not found', {
        component: 'OrganizationPage',
        slug,
      });
      notFound();
    }

    logger.debug('Organization fetched successfully', {
      component: 'OrganizationPage',
      organizationId: organization.id,
      name: organization.name,
      slug: organization.slug,
    });

    return (
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-4">{organization.name}</h1>
        {/* Add your organization page content here */}
      </div>
    );
  } catch (error) {
    logger.error('Error fetching organization:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      component: 'OrganizationPage',
      slug,
    });
    notFound();
  }
}
