import { NextRequest, NextResponse } from 'next/server';

import { validateSession } from '@/lib/auth/session';
import { DbOrganizationExtensionsRepository } from '@/lib/domains/organization/repository-impl';
import { OrganizationExtensionsServiceImpl } from '@/lib/domains/organization/service-impl';
import { EnhancedOrganization } from '@/lib/domains/organization/types';
import { logger } from '@/lib/logger';

/**
 * Enhanced Organization API Route
 *
 * This endpoint returns comprehensive organization data including:
 * - Basic organization information
 * - Organization metrics (member counts, activity stats)
 * - Organization workspaces
 *
 * The route uses the slug-based path structure to avoid Next.js routing conflicts
 * with the organizationId-based routes.
 *
 * @route GET /api/organizations-by-slug/[slug]/enhanced
 * @param {NextRequest} request - The incoming request object
 * @param {Object} params - The route parameters object (Promise)
 * @param {string} params.slug - The organization slug
 * @returns {Promise<NextResponse>} JSON response with enhanced organization data
 * @throws {Error} If fetching the organization data fails
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse<EnhancedOrganization | { error: string }>> {
  let resolvedParams: { slug: string } = { slug: '' };

  try {
    // Get the session using the validateSession helper
    const session = await validateSession(request);

    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    resolvedParams = await params;
    const { slug } = resolvedParams;
    logger.debug('Fetching enhanced organization data', { slug });

    // Initialize the repository and service
    const repository = new DbOrganizationExtensionsRepository();
    const service = new OrganizationExtensionsServiceImpl(repository);

    // Get the enhanced organization data
    const enhancedOrganization = await service.getEnhancedOrganization(slug);

    logger.debug('Enhanced organization data fetched successfully', {
      slug,
      organizationId: enhancedOrganization.id,
      workspaceCount: enhancedOrganization.workspaces?.length || 0,
    });

    return NextResponse.json(enhancedOrganization);
  } catch (error) {
    logger.error('Error fetching enhanced organization', {
      error: error instanceof Error ? error.message : String(error),
      slug: resolvedParams.slug,
      userId: request.headers.get('x-user-id') || undefined,
    });

    return NextResponse.json(
      { error: 'Failed to fetch enhanced organization' },
      { status: 500 }
    );
  }
}
