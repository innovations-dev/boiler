import { betterAuth, type BetterAuthOptions } from 'better-auth';
import { nextCookies } from 'better-auth/next-js';

import { databaseHooks } from './database-hooks';
import { betterAuthOptions } from './options';
import { betterAuthPlugins, githubConfig, providers } from './providers';

const enabledProviders = ['password', 'github'];

export const auth = betterAuth({
  ...betterAuthOptions,
  plugins: [...(betterAuthPlugins ?? []), nextCookies()],
  databaseHooks, // Used for session + org management
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
} satisfies BetterAuthOptions);
