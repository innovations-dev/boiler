'use server';

import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

import { db } from '@/lib/db';
import type { Member, Organization } from '@/lib/db/_schema';
import { member, organization } from '@/lib/db/schema';

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
  slug?: string;
  userId: string; // creator who becomes first admin
}): Promise<Organization> {
  const { name, slug, userId } = data;

  // Start a transaction
  return db.transaction(async (tx) => {
    // Create organization
    const [org] = await tx
      .insert(organization)
      .values({
        id: nanoid(),
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Add creator as admin member
    await tx.insert(member).values({
      id: nanoid(),
      organizationId: org.id,
      userId,
      role: 'ADMIN',
      createdAt: new Date(),
    });

    return org;
  });
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
