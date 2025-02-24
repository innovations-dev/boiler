import { APIError as BetterAuthAPIError } from 'better-auth/api';
import { OrganizationOptions } from 'better-auth/plugins';

import { sendEmail } from '@/lib/email/service';
import { EmailRateLimitError } from '@/lib/types/email/error';
import { getBaseUrl } from '@/lib/utils';

import { logger } from '../../logger';

const baseURL = getBaseUrl().toString();

export const adminConfig = {
  defaultBanReason: 'Violated terms of service',
  defaultBanExpiresIn: 60 * 60 * 24 * 30, // 30 days
  impersonationSessionDuration: 60 * 60, // 1 hour
};

export const organizationConfig: OrganizationOptions = {
  async sendInvitationEmail(data) {
    if (!data?.id || !data?.organization?.name || !data?.inviter?.userId) {
      throw new BetterAuthAPIError('BAD_REQUEST', {
        cause: 'Invalid invitation data',
      });
    }
    // TODO: Implement email sending
    try {
      const result = await sendEmail({
        to: data.email,
        template: 'INVITATION',
        subject: `Invitation to join organization ${data.organization.name}`,
        data: {
          url: `${baseURL.toString()}/accept-invite/${data.id}`,
          organizationName: data.organization.name,
          invitedByUsername: data.inviter.userId,
        },
      });

      if (!result.success) {
        throw result.error;
      }

      logger.info('Organization invitation email sent', {
        component: 'OrganizationPlugin',
        action: 'sendInvitationEmail',
        organizationId: data.organization.id,
        inviterId: data.inviter.userId,
        to: data.email.split('@')[0] + '@***',
      });
      return;
    } catch (error) {
      // Handle rate limiting specifically
      if (error instanceof EmailRateLimitError) {
        throw new BetterAuthAPIError('TOO_MANY_REQUESTS', {
          cause: 'Too many invitation attempts. Please try again later.',
        });
      }

      logger.error(
        'Failed to send organization invitation email',
        {
          component: 'OrganizationPlugin',
          action: 'sendInvitationEmail',
          organizationId: data.organization.id,
          inviterId: data.inviter.userId,
        },
        error
      );

      // Throw appropriate auth error
      throw new BetterAuthAPIError('INTERNAL_SERVER_ERROR', {
        cause: 'Failed to send invitation email. Please try again later.',
      });
    }
  },
};

export const magicLinkConfig = {
  sendMagicLink: async ({ email, url }: { email: string; url: string }) => {
    logger.info('Sending magic link', {
      component: 'MagicLinkPlugin',
      to: email.split('@')[0] + '@***',
    });
    try {
      const result = await sendEmail({
        to: email,
        subject: 'Login to your account',
        template: 'MAGIC_LINK',
        data: { url },
      });

      if (!result.success) {
        throw result.error;
      }
    } catch (error) {
      if (error instanceof EmailRateLimitError) {
        throw new BetterAuthAPIError('TOO_MANY_REQUESTS', {
          cause: 'Too many login attempts. Please try again later.',
        });
      }
      logger.error(
        'Failed to send login email',
        {
          component: 'MagicLinkPlugin',
          to: email.split('@')[0] + '@***',
        },
        error
      );
      throw new BetterAuthAPIError('INTERNAL_SERVER_ERROR', {
        cause: 'Failed to send login email. Please try again later.',
      });
    }
  },
};
