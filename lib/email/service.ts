/**
 * @fileoverview Email service for sending templated emails using Resend and React Email
 * @module lib/email/services/email-service
 */

import { render } from '@react-email/render';

import InvitationEmail from '@/emails/invitation';
import MagicLinkEmail from '@/emails/magic-link';
import ResetPasswordEmail from '@/emails/reset-password';
import VerificationEmail from '@/emails/verification-email';
import { EmailError } from '@/lib/errors';
import { ERROR_CODES } from '@/lib/types/responses/error';

import { logger } from '../logger';
import type { EmailOptions, EmailResult } from '../types/email';
import { EmailDeliveryError, EmailRateLimitError } from '../types/email/error';
import { resend } from './';
import { emailConfig } from './config';

/**
 * Type definitions for email template props
 */
type TemplateProps = {
  MAGIC_LINK: { url: string };
  VERIFICATION: { url: string };
  INVITATION: {
    url: string;
    organizationName: string;
    invitedByUsername: string;
  };
  RESET_PASSWORD: {
    url: string;
    expiryTime: string;
  };
};

/**
 * Email template components
 */
// const templateComponents = {
//   MAGIC_LINK: MagicLinkEmail,
//   VERIFICATION: VerificationEmail,
//   INVITATION: InvitationEmail,
//   RESET_PASSWORD: ResetPasswordEmail,
// };

/**
 * Sends a templated email using Resend
 *
 * @async
 * @param {EmailOptions} options -  
 * to: string;
  subject: string;
  template: EmailTemplate;
  data: Record<string, unknown>;
 * @returns {Promise<EmailResult>} The result of sending the email
 * @throws {EmailRateLimitError} When rate limit is exceeded
 * @throws {EmailDeliveryError} When email delivery fails
 *
 * @example
 * // Send a magic link email
 * await sendEmail({
 *   to: "user@example.com",
 *   template: "MAGIC_LINK",
 *   data: {
 *     url: "https://example.com/magic-link?token=xyz"
 *   }
 * });
 *
 * @example
 * // Send an organization invitation
 * await sendEmail({
 *   to: "invitee@example.com",
 *   template: "INVITATION",
 *   data: {
 *     url: "https://example.com/invite/xyz",
 *     organizationName: "Acme Inc",
 *     invitedByUsername: "john.doe"
 *   }
 * });
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  logger.info('Sending email', {
    component: 'EmailService',
    template: options.template,
    to: options.to.split('@')[0] + '@***', // Mask email in logs
  });

  try {
    const templateConfig = emailConfig.templates[options.template];
    let html: string;

    // Use the direct render approach based on the template type
    switch (options.template) {
      case 'MAGIC_LINK': {
        const props = options.data as TemplateProps['MAGIC_LINK'];
        const magicLinkEmail = MagicLinkEmail(props);
        html = await render(magicLinkEmail, { pretty: true });
        break;
      }
      case 'VERIFICATION': {
        const props = options.data as TemplateProps['VERIFICATION'];
        const verificationEmail = VerificationEmail(props);
        html = await render(verificationEmail, { pretty: true });
        break;
      }
      case 'INVITATION': {
        const props = options.data as TemplateProps['INVITATION'];
        const invitationEmail = InvitationEmail(props);
        html = await render(invitationEmail, { pretty: true });
        break;
      }
      case 'RESET_PASSWORD': {
        const props = options.data as TemplateProps['RESET_PASSWORD'];
        const resetPasswordEmail = ResetPasswordEmail(props);
        html = await render(resetPasswordEmail, { pretty: true });
        break;
      }
      default:
        throw new EmailError(
          `Invalid email template: ${options.template}`,
          ERROR_CODES.TEMPLATE_ERROR
        );
    }

    const result = await resend.emails.send({
      from: emailConfig.from,
      to: options.to,
      subject: templateConfig.subject.replace(
        /{(\w+)}/g,
        (_, key) => options.data[key] as string
      ),
      html,
    });

    logger.info('Email sent successfully', {
      component: 'EmailService',
      template: options.template,
      to: options.to.split('@')[0] + '@***',
    });

    return { success: true, data: result };
  } catch (error) {
    if (error instanceof Error && error.message.includes('rate limit')) {
      throw new EmailRateLimitError('Email rate limit exceeded');
    }

    logger.error(
      'Failed to send email',
      {
        component: 'EmailService',
        template: options.template,
        to: options.to.split('@')[0] + '@***',
      },
      error
    );

    throw new EmailDeliveryError(
      'Failed to send email',
      error instanceof Error ? error : undefined
    );
  }
}

/*
/ In your auth handlers:
await sendEmail({
  to: user.email,
  template: "MAGIC_LINK",
  data: {
    url: magicLinkUrl,
  },
});

// For organization invites:
await sendEmail({
  to: inviteeEmail,
  template: "INVITATION",
  data: {
    url: inviteUrl,
    organizationName: org.name,
    invitedByUsername: inviter.name,
  },
});
*/
