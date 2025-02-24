import { BetterAuthOptions, User } from 'better-auth';

import { env } from '@/env';
import { sendEmail } from '@/lib/email/service';
import { logger } from '@/lib/logger';
import { getBaseUrl } from '@/lib/utils';

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
      try {
        logger.info('Sending reset password email', {
          component: 'AuthProviders',
          path: 'auth/providers',
          email: user.email,
        });

        await sendEmail({
          to: user.email,
          template: 'RESET_PASSWORD',
          data: { url },
          subject: 'Reset your password',
        });
        return;
      } catch (error) {
        logger.error(
          'Failed to send reset password email',
          {
            component: 'AuthProviders',
            path: 'auth/providers',
            email: user.email,
          },
          error
        );
        return;
      }
    },
  },
  emailVerification: {
    autoSignInAfterVerification: true,
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      logger.info('Sending verification email', {
        component: 'AuthProviders',
        path: 'auth/providers',
        email: user.email,
      });

      await sendEmail({
        to: user.email,
        template: 'VERIFICATION',
        data: { url },
        subject: 'Verify your email',
      });
    },
  },
  socialProviders: {
    github: githubConfig,
  },
};
