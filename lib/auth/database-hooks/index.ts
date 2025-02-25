import { type BetterAuthOptions, type Session } from 'better-auth';
import { UserWithRole } from 'better-auth/plugins';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

import { db } from '@/lib/db';
import { member, organization } from '@/lib/db/schema';
import { AppError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { ERROR_CODES } from '@/lib/types/responses/error';
import { getBaseUrl } from '@/lib/utils';

function createPersonalOrganization(userId: string) {
  return async () => {
    const personalOrg = await db.transaction(async (tx) => {
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

    return personalOrg;
  };
}

export const databaseHooks: BetterAuthOptions['databaseHooks'] = {
  session: {
    create: {
      after: async (session: Omit<Session, 'user'>) => {
        if (session.activeOrganizationId) return;

        try {
          // Check if the user has an existing organization
          const existingOrg = await db.query.organization.findFirst({
            where: eq(member.userId, session.userId),
            with: {
              members: true,
            },
          });

          // If the user doesn't have an existing organization, create a new personal one
          const org =
            existingOrg || (await createPersonalOrganization(session.userId)());

          // Set the active organization
          const endpoint = `${getBaseUrl().toString()}/api/auth/organizations/set-active`;
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              organizationId: org.id,
              organizationSlug: org.slug,
            }),
          });

          if (!response.ok) {
            throw new AppError('Failed to set active organization', {
              code: ERROR_CODES.BAD_REQUEST,
              status: 400,
            });
          }
          return;
        } catch (error) {
          logger.error(
            'Failed to set active organization',
            {
              component: 'DatabaseHooks',
              path: 'auth/database-hooks',
              hook: 'session:create:after',
            },
            error
          );
          return;
        }
      },
    },
  },
  user: {
    create: {
      after: async (user: UserWithRole) => {
        await createPersonalOrganization(user.id);
      },
    },
  },
};

export const getActiveOrganization = async ({ userId }: { userId: string }) => {
  try {
    const memberWithOrg = await db.query.member.findFirst({
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

    return memberWithOrg?.organization ?? null;
  } catch (error) {
    logger.error(
      'Failed to get active organization',
      {
        component: 'DatabaseHooks',
        path: 'auth/database-hooks',
        userId,
      },
      error
    );
    return null;
  }
};
