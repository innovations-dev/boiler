import { sendEmail } from '@/lib/email/service';
import { logger } from '@/lib/logger';

/**
 * Send a verification email to the user
 * @param email - The email address of the user
 * @param url - The URL to verify the email
 */
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
