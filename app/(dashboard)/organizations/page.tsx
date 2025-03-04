import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth';
import { OrganizationServiceImpl } from '@/lib/domains/organization/service-impl';
import { logger } from '@/lib/logger';

/**
 * Organizations index page
 * This page handles redirections from other pages when access checks fail
 * It redirects to the first organization the user has access to, or to the new organization page
 */
export default async function OrganizationsIndexPage() {
  logger.debug('Organizations index page rendering', {
    component: 'OrganizationsIndexPage',
    timestamp: new Date().toISOString(),
  });

  let session: any = null;

  try {
    // Get the current session
    // In Next.js 15, we need to await headers() and pass it to getSession
    const headersList = await headers();
    const headersObj = new Headers();

    // Copy headers from the headersList to a standard Headers object
    headersList.forEach((value, key) => {
      headersObj.set(key, value);
    });

    session = await auth.api.getSession({
      headers: await headers(),
    });

    logger.debug('Organizations index page session check', {
      hasSession: !!session,
      userId: session?.user?.id,
      component: 'OrganizationsIndexPage',
    });

    if (!session?.user) {
      logger.debug(
        'Organizations index page - no session, redirecting to sign-in',
        {
          component: 'OrganizationsIndexPage',
        }
      );
      redirect('/sign-in?callbackUrl=/organizations');
    }

    // Get the user's organizations using our domain service
    logger.debug('Organizations index page - fetching user organizations', {
      userId: session.user.id,
      component: 'OrganizationsIndexPage',
    });

    try {
      // Use our domain service to get organizations
      const organizationService = new OrganizationServiceImpl();
      const userOrgs = await organizationService.list();

      logger.debug('User organizations fetched successfully', {
        count: userOrgs.length,
        orgs: userOrgs.map((org) => ({
          id: org.id,
          name: org.name,
          slug: org.slug,
        })),
        component: 'OrganizationsIndexPage',
      });

      // If the user has organizations, redirect to the first one
      if (userOrgs.length > 0) {
        const firstOrg = userOrgs[0];

        if (!firstOrg.slug) {
          logger.error('Organization has no slug', {
            userId: session.user.id,
            orgId: firstOrg.id,
            component: 'OrganizationsIndexPage',
          });
          redirect('/organizations/new');
        }

        logger.debug(
          'Organizations index page - redirecting to first organization',
          {
            userId: session.user.id,
            orgId: firstOrg.id,
            orgSlug: firstOrg.slug,
            component: 'OrganizationsIndexPage',
          }
        );
        redirect(`/organizations/${firstOrg.slug}`);
      }

      // If the user has no organizations, redirect to the new organization page
      logger.debug(
        'Organizations index page - no organizations, redirecting to new',
        {
          userId: session.user.id,
          component: 'OrganizationsIndexPage',
        }
      );
      redirect('/organizations/new');
    } catch (apiError) {
      logger.error('Error fetching organizations', {
        error: apiError instanceof Error ? apiError.message : String(apiError),
        stack: apiError instanceof Error ? apiError.stack : undefined,
        userId: session.user.id,
        component: 'OrganizationsIndexPage',
      });

      // Render a simple page instead of redirecting to avoid loops
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <h1 className="text-2xl font-bold mb-4">Organizations</h1>
          <p className="text-muted-foreground mb-6">
            We encountered an issue loading your organizations.
          </p>
          <a
            href="/organizations/new"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Create New Organization
          </a>
        </div>
      );
    }
  } catch (error) {
    logger.error('Organizations index page - error fetching organizations', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      errorObject: JSON.stringify(error, Object.getOwnPropertyNames(error)),
      component: 'OrganizationsIndexPage',
    });

    // Render a simple page instead of redirecting to avoid loops
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Organizations</h1>
        <p className="text-muted-foreground mb-6">
          We encountered an issue loading your organizations.
        </p>
        <a
          href="/organizations/new"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Create New Organization
        </a>
      </div>
    );
  }
}
