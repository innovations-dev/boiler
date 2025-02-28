import { type BetterAuthOptions, type Session } from 'better-auth';
import { UserWithRole } from 'better-auth/plugins';
import { eq } from 'drizzle-orm';

import { db } from '@/lib/db';
import {
  createPersonalOrganization,
  setActiveOrganization,
} from '@/lib/db/queries/organizations';
import { member } from '@/lib/db/schema';
import { logger } from '@/lib/logger';

export const databaseHooks: BetterAuthOptions['databaseHooks'] = {
  session: {
    create: {
      after: async (betterAuthSession: Omit<Session, 'user'>) => {
        if (betterAuthSession.activeOrganizationId) return;

        try {
          // Check if the user has an existing organization through membership
          const existingMember = await db.query.member.findFirst({
            where: eq(member.userId, betterAuthSession.userId),
            with: {
              organization: true,
            },
          });

          // If the user doesn't have an existing organization, create a new personal one
          const org =
            existingMember?.organization ||
            (await createPersonalOrganization(betterAuthSession.userId));

          logger.debug('session:create:after ~ Setting active organization', {
            userId: betterAuthSession.userId,
            organizationId: org.id,
            organizationSlug: org.slug,
            sessionId: betterAuthSession.id,
          });

          // Set the active organization by updating the session table
          await setActiveOrganization({
            sessionId: betterAuthSession.id,
            organizationId: org.id,
          });

          return;
        } catch (error) {
          logger.error(
            'session:create:after ~ Failed to set active organization',
            {
              component: 'DatabaseHooks',
              path: 'auth/database-hooks',
              hook: 'session:create:after',
              userId: betterAuthSession.userId,
              sessionId: betterAuthSession.id,
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
