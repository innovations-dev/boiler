import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  shared: {
    NODE_ENV: z.enum(['development', 'test', 'production']),
    SKIP_ENV_VALIDATION: z.string().optional(),
    NEXT_PUBLIC_APP_URL: z.string().url(),
    VERCEL_APP_URL: z.string().url().optional(),
  },

  /**
   * Server-side environment variables schema
   */
  server: {
    NODE_ENV: z.enum(['development', 'test', 'production']),
    BETTER_AUTH_URL: z.string().url(),
    BETTER_AUTH_SECRET: z.string(),
    GITHUB_CLIENT_ID: z.string(),
    GITHUB_CLIENT_SECRET: z.string(),
    GITHUB_REDIRECT_URI: z.string().url(),
    // RESEND_API_KEY: z.string(),
    // EMAIL_FROM: z.string(),
    // TEST_EMAIL: z.string(),
    TURSO_DATABASE_URL: z.string(),
    TURSO_AUTH_TOKEN: z.string(),
  },

  /**
   * Client-side environment variables schema
   */
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url(),
    NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION: z.string().optional(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually. This will allow you to use
   * the env variables in the client side.
   */
  experimental__runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    SKIP_ENV_VALIDATION: process.env.SKIP_ENV_VALIDATION,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    VERCEL_APP_URL: process.env.VERCEL_APP_URL,
    NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION:
      process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },

  /**
   * Skip validation of environment variables during build - usefule when you are using
   * the env variables in the client side
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
