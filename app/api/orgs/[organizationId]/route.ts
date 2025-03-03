import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

import { withOrganizationApiAccess } from '@/lib/auth/organization/with-organization-access';
import { db } from '@/lib/db';
import { organizationSchema } from '@/lib/db/_schema';
import { member, organization } from '@/lib/db/schema';
import { AppError } from '@/lib/errors';
import { withOrganizationContext } from '@/lib/logger';
import { ERROR_CODES } from '@/lib/types/responses/error';

/**
 * Validate organization exists and user is a member
 * @param organizationId The ID of the organization
 * @param userId The ID of the user
 * @returns The organization and member
 *
 * @example
 * const { organization, member } = await validateOrganizationAccess('my-org-id', '123');
 * console.log(organization);
 * console.log(member);
 *
 * @throws {AppError} If the organization is not found
 * @throws {AppError} If the user is not a member of the organization
 */
async function validateOrganizationAccess(
  organizationId: string,
  userId: string
) {
  const org = await db.query.organization.findFirst({
    where: eq(organization.id, organizationId),
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

  if (org.members.length === 0) {
    throw new AppError('User is not a member of this organization', {
      code: ERROR_CODES.FORBIDDEN,
      status: 403,
    });
  }

  return {
    organization: org,
    member: org.members[0],
  };
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
  { params }: { params: Promise<{ organizationId: string }> }
) {
  // Await params before using its properties
  const resolvedParams = await params;
  const { organizationId } = resolvedParams;

  return withOrganizationApiAccess(request, organizationId, async (session) => {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      throw new AppError('User ID not found in request', {
        code: ERROR_CODES.UNAUTHORIZED,
        status: 401,
      });
    }

    const { organization, member } = await validateOrganizationAccess(
      organizationId,
      userId
    );

    return Response.json(organizationSchema.parse(organization));
  });
}

// Schema for PATCH request
const updateOrganizationSchema = z.object({
  name: z.string().min(1).max(100).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  // Await params before using its properties
  const resolvedParams = await params;
  const { organizationId } = resolvedParams;

  return withOrganizationApiAccess(req, organizationId, async (session) => {
    try {
      const userId = req.headers.get('x-user-id');
      if (!userId) {
        throw new AppError('User ID not found in request', {
          code: ERROR_CODES.UNAUTHORIZED,
          status: 401,
        });
      }

      const { organization: org, member } = await validateOrganizationAccess(
        organizationId,
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

      return NextResponse.json(organizationSchema.parse(updated));
    } catch (error) {
      if (error instanceof AppError) {
        return NextResponse.json(
          { message: error.message, code: error.code },
          { status: error.status }
        );
      }
      throw error;
    }
  });
}
