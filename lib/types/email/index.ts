import { EmailError } from './error';

export type EmailTemplate =
  | 'MAGIC_LINK'
  | 'VERIFICATION'
  | 'INVITATION'
  | 'RESET_PASSWORD'
  | 'EMAIL_CHANGE';

export interface EmailOptions {
  to: string;
  subject: string;
  template: EmailTemplate;
  data: Record<string, unknown>;
  expiryTime?: string;
}

export interface EmailResult {
  success: boolean;
  data?: unknown;
  error?: EmailError;
}
