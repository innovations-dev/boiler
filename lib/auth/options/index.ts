import { AuthContext, BetterAuthOptions } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';

import { env } from '@/env';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';
import { getBaseUrl } from '@/lib/utils';

import * as schema from '../../db/schema';
import { settings } from '../settings';

const baseURL = getBaseUrl().toString();
export const betterAuthOptions: BetterAuthOptions = {
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
  ...settings,
};
