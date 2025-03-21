/**
 * @fileoverview Email service configuration using Resend
 * @module lib/email
 */

/**
 * Resend email service client instance
 * @see {@link https://resend.com/docs/introduction}
 *
 * @example
 * // Send a simple email
 * await resend.emails.send({
 *   from: 'you@example.com',
 *   to: 'user@example.com',
 *   subject: 'Welcome!',
 *   html: '<p>Welcome to our platform!</p>'
 * });
 *
 * @example
 * // Send an email using a React component template
 * await resend.emails.send({
 *   from: 'you@example.com',
 *   to: 'user@example.com',
 *   subject: 'Welcome!',
 *   react: EmailTemplate({ name: 'John' })
 * });
 *
 * @requires RESEND_API_KEY - Environment variable for Resend API authentication
 */
import { Resend } from 'resend';
import { z } from 'zod';

import { env } from '@/env';

export const resend = new Resend(env.RESEND_API_KEY);

export const VERIFY_API_PATH = '/api/auth/verify-email';

export const from = env.EMAIL_FROM;

// Zod schema for email data validation
export const emailDataSchema = z.object({
  to: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required'),
  html: z.string().min(1, 'HTML content is required'),
});

export type EmailData = z.infer<typeof emailDataSchema>;
