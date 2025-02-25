import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

import { db } from '@/lib/db';
import { member, organization } from '@/lib/db/schema';
import { AppError } from '@/lib/errors';
import { organizationSchema } from '@/lib/types/organization';
import { ERROR_CODES } from '@/lib/types/responses/error';

// Validate organization exists and user is a member
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

export async function GET(
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

    const { organization, member } = await validateOrganizationAccess(
      params.slug,
      userId
    );

    return Response.json(organizationSchema.parse(organization));
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
