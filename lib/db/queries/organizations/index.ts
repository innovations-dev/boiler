'use server';

import { headers } from 'next/headers';
import { betterFetch } from '@better-fetch/fetch';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { z } from 'zod';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import {
  organizationSchema,
  organizationSettingsSchema,
  type Member,
  type Organization,
} from '@/lib/db/_schema';
import { member, organization, session } from '@/lib/db/schema';
import { handleUnknownError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { getBaseUrl, slugify } from '@/lib/utils';

// Define the OrganizationSettings type from the schema
type OrganizationSettings = z.infer<typeof organizationSettingsSchema>;

export async function getOrganization(
  id: string
): Promise<Organization | undefined> {
  return db.query.organization.findFirst({
    where: eq(organization.id, id),
    with: {
      members: {
        with: {
          user: true,
        },
      },
    },
  });
}

export async function getUserOrganizations(
  userId: string
): Promise<Organization[]> {
  return db.query.organization.findMany({
    with: {
      members: {
        where: eq(member.userId, userId),
        with: {
          user: true,
        },
      },
    },
  });
}

export async function createOrganization(data: {
  name: string;
  userId: string; // creator who becomes first admin
  slug?: string;
  logo?: string;
  metadata?: string;
}): Promise<Organization> {
  const { name, userId, logo, metadata } = data;

  // Get the session to verify authentication
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error('Authentication required to create an organization');
  }

  // Verify that the user has permission to create an organization
  if (session.user.id !== data.userId) {
    throw new Error('You can only create organizations for yourself');
  }

  // Make a direct API call to the Better-Auth organization/create endpoint
  // This is the correct way to interact with Better-Auth's organization functionality
  try {
    // Get the request headers to forward cookies
    const requestHeaders = await headers();
    const cookieHeader = requestHeaders.get('cookie') || '';

    // Ensure slug is provided or generated
    const slug = data.slug || slugify(name);

    const response = await betterFetch<Organization>(
      `${getBaseUrl()}/api/auth/organization/create`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: cookieHeader,
        },
        body: JSON.stringify({
          name,
          slug,
          userId,
          ...(logo ? { logo } : {}),
          ...(metadata ? { metadata } : {}),
        }),
      }
    );

    if (response.error) {
      console.error('Failed to create organization:', response.error);
      throw new Error(
        response.error.message || 'Failed to create organization'
      );
    }

    if (!response.data) {
      console.error('No organization data returned from API');
      throw new Error('No organization data returned from API');
    }

    // Validate the response data against the schema
    try {
      // Use a more permissive schema for the API response
      const validatedOrg = organizationSchema
        .passthrough()
        .parse(response.data);
      return validatedOrg;
    } catch (validationError) {
      console.error('Organization validation error:', validationError);
      // If validation fails, still return the data but log the error
      // This allows the client to handle the data even if it doesn't match the schema exactly
      return response.data as Organization;
    }
  } catch (error) {
    console.error('Failed to create organization:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to create organization'
    );
  }
}

export async function updateOrganization(
  id: string,
  data: Partial<Pick<Organization, 'name' | 'slug' | 'logo'>>
): Promise<Organization> {
  const [updated] = await db
    .update(organization)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(organization.id, id))
    .returning();

  return updated;
}

export async function addMemberToOrganization(data: {
  organizationId: string;
  userId: string;
  role: Member['role'];
}): Promise<Member> {
  const [newMember] = await db
    .insert(member)
    .values({
      id: nanoid(),
      ...data,
      createdAt: new Date(),
    })
    .returning();

  return newMember;
}

export async function setActiveOrganization(data: {
  sessionId: string;
  organizationId: string;
}): Promise<void> {
  const { sessionId, organizationId } = data;

  await db
    .update(session)
    .set({
      activeOrganizationId: organizationId,
      updatedAt: new Date(),
    })
    .where(eq(session.id, sessionId));
}

export async function createPersonalOrganization(userId: string) {
  return await db.transaction(async (tx) => {
    const [org] = await tx
      .insert(organization)
      .values({
        id: nanoid(),
        name: 'Personal',
        slug: `personal-${userId}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    await tx.insert(member).values({
      id: nanoid(),
      userId,
      organizationId: org.id,
      role: 'owner',
      createdAt: new Date(),
    });

    return org;
  });
}

export async function getActiveOrganization(userId: string) {
  return db.query.member.findFirst({
    where: eq(member.userId, userId),
    with: {
      organization: true,
      // TODO: implement workspaces
      // organization: {
      //   with: {
      //     workspaces: true,
      //   },
      // },
    },
  });
}

export async function updateOrganizationSettings(
  slug: string,
  data: OrganizationSettings
) {
  try {
    logger.debug('Updating organization settings', { slug, data });

    // Validate input
    const validatedData = organizationSettingsSchema.parse(data);
    logger.debug('Validated organization settings data', validatedData);

    // Update organization
    const updatedOrg = await db
      .update(organization)
      .set({
        name: validatedData.name,
        slug: validatedData.slug,
        logo: validatedData.logo,
        updatedAt: new Date(),
      })
      .where(eq(organization.slug, slug))
      .returning();

    logger.debug('Organization updated', {
      success: updatedOrg.length > 0,
      updatedId: updatedOrg[0]?.id,
      updatedSlug: updatedOrg[0]?.slug,
    });

    return { success: true, data: updatedOrg[0] };
  } catch (error) {
    // Handle errors
    logger.error('Error updating organization settings', {
      slug,
      error: error instanceof Error ? error.message : String(error),
    });
    return handleUnknownError(error);
  }
}
