import { AuthContext, betterAuth, type BetterAuthOptions } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';
import {
  admin,
  customSession,
  magicLink,
  multiSession,
  openAPI,
  organization,
} from 'better-auth/plugins';

import { env } from '@/env';

import { db } from '../db';
import * as schema from '../db/schema';
import { logger } from '../logger';
import { getBaseUrl } from '../utils';
import { getActiveOrganization } from './database-hooks';
import { adminConfig, magicLinkConfig, organizationConfig } from './plugins';
import { githubConfig, providers } from './providers';
import { settings } from './settings';

const enabledProviders = ['password', 'github'];

const baseURL = getBaseUrl().toString();
const betterAuthOptions: BetterAuthOptions = {
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
        'Better-Auth error occurred',
        {
          component: 'BetterAuth',
          context: ctx,
        },
        error
      );
    },
  },
};

const betterAuthPlugins: BetterAuthOptions['plugins'] = [
  admin(adminConfig),
  organization(organizationConfig),
  magicLink(magicLinkConfig),
  openAPI(),
  multiSession(),
];

export const auth = betterAuth({
  ...betterAuthOptions,
  plugins: [
    ...(betterAuthPlugins ?? []),
    customSession(
      async ({ user, session }) => {
        logger.debug('🚀 ~ customSession ~ user:', session);
        try {
          const activeOrganization = await getActiveOrganization({
            userId: user.id,
          });

          // TODO: implement workspaces
          // const activeWorkspace = await getActiveWorkspace();

          return {
            ...session,
            user,
            activeOrganizationId: activeOrganization?.id,
            // TODO: implement workspaces
            // activeWorkspaceId: activeWorkspace?.id, // TODO: is this correct?
          };
        } catch (error) {
          logger.error(
            'customSession error:',
            {
              component: 'CustomSession',
              userId: user?.id,
            },
            error
          );
          return {
            session,
            user,
            activeOrganizationId: null,
            // TODO: implement workspaces
            // activeWorkspaceId: null, // TODO: is this correct?
          };
        }
      },
      {
        ...betterAuthOptions,
      }
    ),
    nextCookies(),
  ],
  emailAndPassword: {
    enabled: enabledProviders.includes('password'),
    ...(enabledProviders.includes('password')
      ? { ...providers.emailAndPassword }
      : {}),
  },
  emailVerification: {
    ...(enabledProviders.includes('password')
      ? { ...providers.emailVerification }
      : {}),
  },
  socialProviders: enabledProviders.includes('github')
    ? {
        github: githubConfig,
      }
    : {},
  ...settings,
} satisfies BetterAuthOptions);
