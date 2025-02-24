import { BetterAuthOptions, User } from 'better-auth';

import { env } from '@/env';
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
      console.log('Sending reset password email to', user.email, url);
      // TODO: Implement email sending
      // try {
      //   await sendEmail({
      //     to: user.email,
      //     template: "RESET_PASSWORD",
      //     data: { url },
      //     subject: "Reset your password",
      //   });
      //   return;
      // } catch (error) {
      //   console.error("Failed to send reset password email", error);
      //   return;
      // }
      return;
    },
  },
  emailVerification: {
    autoSignInAfterVerification: true,
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      console.log('Sending verification email to', user.email, url);
      // TODO: Implement email sending
      // await sendEmail({
      //   to: user.email,
      //   template: 'VERIFICATION',
      //   data: { url },
      //   subject: 'Verify your email',
      // });
    },
  },
  socialProviders: {
    github: githubConfig,
  },
};
