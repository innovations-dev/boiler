import { BetterAuthOptions, User } from 'better-auth';
import {
  admin,
  customSession,
  magicLink,
  multiSession,
  openAPI,
  organization,
} from 'better-auth/plugins';

import { env } from '@/env';
import { getActiveOrganization } from '@/lib/db/queries/organizations';
import { sendEmail } from '@/lib/email/service';
import { logger } from '@/lib/logger';
import { getBaseUrl } from '@/lib/utils';

import { adminConfig, magicLinkConfig, organizationConfig } from '../plugins';

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

export const betterAuthPlugins: BetterAuthOptions['plugins'] = [
  admin(adminConfig),
  organization(organizationConfig),
  magicLink(magicLinkConfig),
  openAPI(),
  multiSession(),
  customSession(
    async ({ user, session }) => {
      logger.debug('customSession processing', {
        component: 'CustomSession',
        userId: user?.id,
        // Don't log the entire session object as it may contain sensitive data
      });
      try {
        const memberWithOrg = await getActiveOrganization(user.id);
        const activeOrganization = memberWithOrg?.organization;

        // TODO: implement workspaces
        // const activeWorkspace = await getActiveWorkspace();
        logger.debug('updating session', {
          context: 'auth config',
          component: 'customSession',
          userId: user?.id,
          activeOrganizationId: activeOrganization?.id,
        });

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
    // Create a separate options object instead of reusing betterAuthOptions
    {
      baseURL,
      secret: env.BETTER_AUTH_SECRET,
      trustedOrigins: [baseURL],
    }
  ),
];
