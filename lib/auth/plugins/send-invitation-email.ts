import { APIError as BetterAuthAPIError } from 'better-auth/api';

import { sendEmail } from '@/lib/email/service';
import { logger } from '@/lib/logger';
import { EmailRateLimitError } from '@/lib/types/email/error';
import { getBaseUrl } from '@/lib/utils';

const baseURL = getBaseUrl().toString();

export async function sendInvitationEmail(data: {
  id: string;
  email: string;
  inviter: {
    userId: string;
  };
  organization: {
    id: string;
    name: string;
  };
}) {
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
}
