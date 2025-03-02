import { sendVerificationEmailFn } from 'better-auth/api';

import { sendEmail } from '@/lib/email/service';
import { logger } from '@/lib/logger';

type Params = Parameters<typeof sendVerificationEmailFn>;

export async function sendVerificationEmail({
  email,
  url,
}: {
  email: string;
  url: string;
}) {
  try {
    logger.info('Sending verification email', {
      component: 'AuthProviders',
      path: 'auth/providers',
      email,
    });
    await sendEmail({
      to: email,
      template: 'VERIFICATION',
      data: { url },
      subject: 'Verify your email',
    });
  } catch (error) {
    logger.error(
      'Failed to send verification email',
      {
        component: 'AuthProviders',
        path: 'auth/providers',
        email,
      },
      error
    );
  }
}
