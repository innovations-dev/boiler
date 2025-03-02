import { APIError as BetterAuthAPIError } from 'better-auth/api';

import { sendEmail } from '@/lib/email/service';
import { logger } from '@/lib/logger';
import { EmailRateLimitError } from '@/lib/types/email/error';

export const sendMagicLink = async ({
  email,
  url,
}: {
  email: string;
  url: string;
}) => {
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
};
