export {};

declare module 'better-auth' {
  import type { UserWithRole } from 'better-auth/plugins';

  interface Session {
    id: string;
    expiresAt: Date;
    token: string;
    userId: string;
    ipAddress?: string | null;
    userAgent?: string | null;
    impersonatedBy?: string | null;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    activeOrganizationId?: string | null;
    user: UserWithRole;
  }
}
