export {};

declare module 'better-auth' {
  import type {
    SessionWithImpersonatedBy,
    UserWithRole,
  } from 'better-auth/plugins';

  interface Session extends SessionWithImpersonatedBy {
    id: string;
    expiresAt: Date;
    token: string;
    ipAddress?: string | null | undefined;
    userAgent?: string | null | undefined;
    userId: string;
    impersonatedBy?: string | null | undefined;
    activeOrganizationId?: string | null | undefined;
    createdAt: Date;
    updatedAt: Date;
  }
}
