// import { APIError as BetterAuthAPIError } from 'better-auth/api';

import { logger, type AuthContext, type BetterAuthOptions } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';

import { env } from '@/env';

import { db } from '../db';
import * as schema from '../db/schema';
import { getBaseUrl } from '../utils';

const baseURL = getBaseUrl().toString();

export const settings: BetterAuthOptions = {
  baseURL,
  secret: env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: 'sqlite',
    schema,
  }),
  trustedOrigins: [baseURL],
  onAPIError: {
    throw: true,
    onError: (error: unknown, ctx: AuthContext) => {
      logger.error(
        'Better-Auth onError triggered',
        {
          component: 'BetterAuth',
          context: ctx,
        },
        error
      );
    },
  },
  user: {
    deleteUser: {
      enabled: true,
      // beforeDelete: async (user: User) => {
      //   if (user.email.includes("admin")) {
      //     throw new BetterAuthAPIError("BAD_REQUEST", {
      //       cause: "Admin accounts can't be deleted",
      //     });
      //   }
      //   // TODO: Delete user from all organizations
      //   // await db.delete(schema.member).where(eq(schema.member.userId, user.id));
      //   // TODO: Delete user from all member
      //   // await db.delete(schema.member).where(eq(schema.member.userId, user.id));
      //   // TODO: Delete user from all invitations
      //   // await db.delete(schema.invitation).where(eq(schema.invitation.userId, user.id));
      //   // TODO: Delete user from all sessions
      //   // await db.delete(schema.session).where(eq(schema.session.userId, user.id));
      //   // TODO: Delete user from all accounts
      //   // await db.delete(schema.account).where(eq(schema.account.userId, user.id));
      // },
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ['github'],
    },
  },
  logger: {
    level: 'debug',
    log: (message: string) => {
      console.log(`[BetterAuth EXPOSED] : ` + message);
    },
  },
  session: {
    /**
     * Better Auth defaults:
     * expiresIn: 60 * 60 * 24 * 7, // 7 days
     * updateAge: 60 * 60 * 24, // 1 day (session update
     * interval)
     */
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    },
  },
};
