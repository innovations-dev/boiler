import { betterAuth, type BetterAuthOptions } from 'better-auth';
import { nextCookies } from 'better-auth/next-js';
import { customSession } from 'better-auth/plugins';

import { databaseHooks } from './database-hooks';
import { betterAuthPlugins } from './plugins';
import { customSession as customSessionConfig } from './plugins/custom-session';
import { githubConfig, providers } from './providers';
import { settings } from './settings';

const enabledProviders = ['password', 'github'];

export const auth = betterAuth({
  ...settings,
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
  databaseHooks, // Used for session + org management
  plugins: [
    ...(betterAuthPlugins ?? []),
    customSession(customSessionConfig, settings),
    nextCookies(),
  ],
} satisfies BetterAuthOptions);
