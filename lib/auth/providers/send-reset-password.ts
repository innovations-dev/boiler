import { sendEmail } from '@/lib/email/service';
import { logger } from '@/lib/logger';

export const sendResetPasswordEmail = async ({
  email,
  url,
}: {
  email: string;
  url: string;
}) => {
  try {
    logger.info('Sending reset password email', {
      component: 'AuthProviders',
      path: 'auth/providers',
      email,
    });
    await sendEmail({
      to: email,
      subject: 'Reset your password',
      template: 'RESET_PASSWORD',
      data: { url },
    });
  } catch (error) {
    logger.error(
      'Failed to send reset password email',
      {
        component: 'AuthProviders',
        path: 'auth/providers',
        email,
      },
      error
    );
  }
};
