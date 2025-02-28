// import { APIError as BetterAuthAPIError } from 'better-auth/api';

import { env } from '@/env';

export const settings = {
  user: {
    deleteUser: {
      enabled: true,
      // beforeDelete: async (user: User) => {
      //   if (user.email.includes("admin")) {
      //     throw new BetterAuthAPIError("BAD_REQUEST", {
      //       cause: "Admin accounts can't be deleted",
      //     });
      //   }
      //   // TODO: Delete user from all organizations
      //   // await db.delete(schema.member).where(eq(schema.member.userId, user.id));
      //   // TODO: Delete user from all member
      //   // await db.delete(schema.member).where(eq(schema.member.userId, user.id));
      //   // TODO: Delete user from all invitations
      //   // await db.delete(schema.invitation).where(eq(schema.invitation.userId, user.id));
      //   // TODO: Delete user from all sessions
      //   // await db.delete(schema.session).where(eq(schema.session.userId, user.id));
      //   // TODO: Delete user from all accounts
      //   // await db.delete(schema.account).where(eq(schema.account.userId, user.id));
      // },
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ['github'],
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days instead of 5 minutes
      secure: process.env.NODE_ENV === 'production', // Only use HTTPS in production
      httpOnly: true, // Prevent JavaScript access
      sameSite: 'lax', // Protect against CSRF
    },
  },
};
