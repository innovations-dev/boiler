import { BetterAuthOptions, User } from 'better-auth';

import { env } from '@/env';
import { getBaseUrl } from '@/lib/utils';

import { sendResetPasswordEmail } from './send-reset-password';
import { sendVerificationEmail } from './send-verification-email';

const baseURL = getBaseUrl().toString();

export const githubConfig = {
  enabled: true,
  clientId: env.GITHUB_CLIENT_ID,
  clientSecret: env.GITHUB_CLIENT_SECRET,
  redirectUri: `${baseURL}/api/auth/callback/github`,
};

export const providers: BetterAuthOptions = {
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    maxPasswordLength: 100,
    minPasswordLength: 8,
    async sendResetPassword({ user, url }: { user: User; url: string }) {
      await sendResetPasswordEmail({ email: user.email, url });
    },
  },
  emailVerification: {
    autoSignInAfterVerification: true,
    sendOnSignUp: true,
    sendVerificationEmail: async (data) => {
      await sendVerificationEmail({
        email: data.user.email,
        url: data.url,
      });
    },
  },
  socialProviders: {
    github: githubConfig,
  },
};
