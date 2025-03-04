/**
 * @fileoverview Organization detail page
 *
 * This page displays the organization dashboard.
 */

import { notFound } from 'next/navigation';

import { OrganizationDashboard } from '@/app/(dashboard)/_components/organization/dashboard';
import { OrganizationProvider } from '@/app/(dashboard)/_context/organization-context';
import { OrganizationServiceImpl } from '@/lib/domains/organization/service-impl';
import { handleUnknownError } from '@/lib/errors';
import { logger } from '@/lib/logger';

interface OrganizationPageProps {
  params: {
    slug: string;
  };
}

/**
 * Organization detail page
 */
export default async function OrganizationPage({
  params,
}: OrganizationPageProps) {
  const { slug } = await params;

  try {
    // Initialize services
    const service = new OrganizationServiceImpl();

    // Get organization data
    const organization = await service.getBySlug(slug);

    if (!organization) {
      logger.warn('Organization not found', { slug });
      return notFound();
    }

    // Find the current user's membership
    const currentMember = organization.members?.[0];

    logger.info('Organization page loaded successfully', {
      slug,
      organizationId: organization.id,
      memberCount: organization.members?.length || 0,
    });

    return (
      <OrganizationProvider
        organization={organization}
        currentMember={currentMember}
      >
        <OrganizationDashboard />
      </OrganizationProvider>
    );
  } catch (error) {
    const appError = handleUnknownError(error);

    logger.error('Failed to load organization page', {
      error: appError,
      slug,
    });

    throw error;
  }
}
