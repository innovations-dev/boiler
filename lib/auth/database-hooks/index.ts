/**
 * @fileoverview
 * @deprecated Use new better-auth plugin implementation instead
 */
import type { BetterAuthOptions, Session } from 'better-auth';
import { UserWithRole } from 'better-auth/plugins';
import { eq } from 'drizzle-orm';

// import { organizationService } from '@/lib/better-auth/organization';
import { db } from '@/lib/db';
import { member } from '@/lib/db/schema';
import { logger } from '@/lib/logger';

export const databaseHooks: BetterAuthOptions['databaseHooks'] = {
  session: {
    create: {
      after: async (betterAuthSession: Session) => {
        if (betterAuthSession?.activeOrganizationId) return;
        try {
          // Check if the user has an existing organization through membership
          const existingMember = await db.query.member.findFirst({
            where: eq(member.userId, betterAuthSession.userId),
            with: {
              organization: true,
            },
          });

          // If the user doesn't have an existing organization, we'll skip creating one for now
          // as we're transitioning to the new Better-Auth plugin implementation
          if (!existingMember?.organization) {
            logger.debug(
              'session:create:after ~ No existing organization found, skipping creation',
              {
                userId: betterAuthSession.userId,
                sessionId: betterAuthSession.id,
              }
            );
            return;
          }

          logger.debug('session:create:after ~ Found existing organization', {
            userId: betterAuthSession.userId,
            organizationId: existingMember.organization.id,
            organizationSlug: existingMember.organization.slug,
            sessionId: betterAuthSession.id,
          });

          // We'll skip setting the active organization for now
          // as we're transitioning to the new Better-Auth plugin implementation

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
        // We'll skip creating a personal organization for now
        // as we're transitioning to the new Better-Auth plugin implementation
        logger.debug(
          'user:create:after ~ Skipping personal organization creation',
          {
            userId: user.id,
          }
        );
      },
    },
  },
};
