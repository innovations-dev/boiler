import { BetterAuthOptions } from 'better-auth';
import {
  admin,
  magicLink,
  multiSession,
  openAPI,
  organization,
} from 'better-auth/plugins';

import { orgPlugin } from '@/lib/better-auth/plugins/org';

import { sendInvitationEmail } from './send-invitation-email';
import { sendMagicLink } from './send-magic-link';

export const betterAuthPlugins: BetterAuthOptions['plugins'] = [
  admin({
    defaultBanReason: 'Violated terms of service',
    defaultBanExpiresIn: 60 * 60 * 24 * 30, // 30 days
    impersonationSessionDuration: 60 * 60, // 1 hour
  }),
  organization({ sendInvitationEmail }),
  magicLink({ sendMagicLink }),
  multiSession(),
  openAPI(),
  orgPlugin(),
];
