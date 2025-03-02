import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

import { getOrganizationAccess } from '@/lib/auth/organization/get-organization-access';
import { db } from '@/lib/db';
import { organizationSchema } from '@/lib/db/_schema';
import { member, organization } from '@/lib/db/schema';
import { AppError } from '@/lib/errors';
import { withOrganizationContext } from '@/lib/logger';
import { ERROR_CODES } from '@/lib/types/responses/error';

/**
 * Validate organization exists and user is a member
 * @param slug The slug of the organization
 * @param userId The ID of the user
 * @returns The organization and member
 *
 * @example
 * const { organization, member } = await validateOrganizationAccess('my-org', '123');
 * console.log(organization);
 * console.log(member);
 *
 * @throws {AppError} If the organization is not found
 * @throws {AppError} If the user is not a member of the organization
 */
async function validateOrganizationAccess(slug: string, userId: string) {
  const org = await db.query.organization.findFirst({
    where: eq(organization.slug, slug),
    with: {
      members: {
        where: eq(member.userId, userId),
      },
    },
  });

  if (!org) {
    throw new AppError('Organization not found', {
      code: ERROR_CODES.NOT_FOUND,
      status: 404,
    });
  }

  if (!org.members.length) {
    throw new AppError('Not a member of this organization', {
      code: ERROR_CODES.FORBIDDEN,
      status: 403,
    });
  }

  return { organization: org, member: org.members[0] };
}

/**
 * Get organization by slug
 * @param request The request object
 * @param params The parameters object
 * @returns The organization
 *
 * @example
 * const organization = await GET(request, { params: { slug: 'my-org' } });
 * console.log(organization);
 *
 * @throws {AppError} If the organization is not found
 * @throws {AppError} If the user is not a member of the organization
 */

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  // Create organization-specific logger
  const orgLogger = withOrganizationContext(params.slug);

  try {
    orgLogger.debug('Processing organization API request');

    const { hasAccess, session } = await getOrganizationAccess(params.slug);

    if (!session) {
      orgLogger.warn('Unauthenticated access attempt', {
        path: request.nextUrl.pathname,
        // uses vercel ip header: https://vercel.com/docs/edge-network/headers/request-headers#x-real-ip
        ip: request.headers.get('x-real-ip') || 'unknown',
      });

      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!hasAccess) {
      orgLogger.warn('Unauthorized access attempt', {
        userId: session.user.id,
        path: request.nextUrl.pathname,
      });

      return NextResponse.json(
        { message: 'You do not have access to this organization' },
        { status: 403 }
      );
    }

    orgLogger.info('Authorized access', { userId: session.user.id });

    const userId = request.headers.get('x-user-id');
    if (!userId) {
      throw new AppError('User ID not found in request', {
        code: ERROR_CODES.UNAUTHORIZED,
        status: 401,
      });
    }

    const { organization, member } = await validateOrganizationAccess(
      params.slug,
      userId
    );

    return Response.json(organizationSchema.parse(organization));
  } catch (error) {
    orgLogger.error(
      'Error in organization API route',
      {
        path: request.nextUrl.pathname,
      },
      error
    );

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Schema for PATCH request
const updateOrganizationSchema = z.object({
  name: z.string().min(1).max(100).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      throw new AppError('User ID not found in request', {
        code: ERROR_CODES.UNAUTHORIZED,
        status: 401,
      });
    }

    const { organization: org, member } = await validateOrganizationAccess(
      params.slug,
      userId
    );

    // Check if user has permission to edit
    if (!['OWNER', 'ADMIN'].includes(member.role)) {
      throw new AppError('Not authorized to edit organization', {
        code: ERROR_CODES.FORBIDDEN,
        status: 403,
      });
    }

    const body = await req.json();
    const data = updateOrganizationSchema.parse(body);

    const [updated] = await db
      .update(organization)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(organization.id, org.id))
      .returning();

    return Response.json(organizationSchema.parse(updated));
  } catch (error) {
    if (error instanceof AppError) {
      return Response.json(
        { message: error.message, code: error.code },
        { status: error.status }
      );
    }
    throw error;
  }
}
