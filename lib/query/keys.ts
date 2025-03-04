/**
 * @fileoverview Centralized query key factory for React Query.
 * Provides type-safe query key management and consistent key structure across the application.
 *
 * @module lib/query/keys
 * @see {@link https://tanstack.com/query/latest/docs/react/guides/query-keys} React Query Keys Documentation
 * @see {@link lib/query/cache-config} for related cache time configurations
 */

/**
 * Query key factory for consistent key management across the application.
 * Each key is a function that returns a readonly tuple to ensure type safety and immutability.
 *
 * Key Structure:
 * - Single resource (e.g., users.detail): ['resource', 'id']
 * - Nested resource (e.g., users.preferences): ['resource', 'id', 'nested']
 * - Collection (e.g., users.all): ['resource']
 *
 * Invalidation Patterns:
 * - Invalidate all user data: queryKeys.users.all()
 * - Invalidate specific user: queryKeys.users.detail(id)
 * - Invalidate nested data: queryKeys.users.preferences(id)
 *
 * @example
 * ```typescript
 * // In a custom hook
 * function useUser(userId: string) {
 *   return useValidatedQuery(
 *     queryKeys.users.detail(userId),
 *     () => fetchUser(userId),
 *     userSchema
 *   );
 * }
 *
 * // With filters or pagination
 * interface UserFilters {
 *   status?: 'active' | 'inactive';
 *   role?: string;
 * }
 *
 * function useUsers(filters: UserFilters) {
 *   return useValidatedQuery(
 *     [...queryKeys.users.all(), { filters }],
 *     () => fetchUsers(filters),
 *     userListSchema
 *   );
 * }
 *
 * // Invalidation examples
 * // Invalidate all user data
 * queryClient.invalidateQueries({
 *   queryKey: queryKeys.users.all()
 * });
 *
 * // Invalidate specific user and related data
 * queryClient.invalidateQueries({
 *   queryKey: ['users', userId]
 * });
 * ```
 */
export const queryKeys = {
  /** User-related query keys */
  users: {
    /** Get all users */
    all: () => ['users'] as const,
    /** Get user by ID
     * @param {string} id - User ID
     */
    detail: (id: string) => ['users', id] as const,
    /** Get user preferences
     * @param {string} id - User ID
     */
    preferences: (id: string) => ['users', id, 'preferences'] as const,
  },
  /** Organization-related query keys */
  organizations: {
    /** Get all organizations */
    all: () => ['organizations'] as const,
    /** Get organization by ID
     * @param {string} id - Organization ID
     */
    create: (userId: string, slug?: string | null) =>
      ['organizations', 'create', userId, slug] as const,
    detail: (slug: string) => ['organizations', slug] as const,
    metrics: {
      all: (slug: string) => ['organizations', slug, 'metrics'] as const,
      activeSessions: (slug: string) =>
        ['organizations', slug, 'metrics', 'active-sessions'] as const,
    },
    members: {
      all: (slug: string) => ['organizations', slug, 'members'] as const,
      detail: (slug: string, memberId: string) =>
        ['organizations', slug, 'members', memberId] as const,
    },
    invitations: {
      all: (slug: string) => ['organizations', slug, 'invitations'] as const,
      detail: (id: string) => ['organizations', 'invitations', id] as const,
    },
    /** Permission-related query keys
     * @param {string} organizationId - Organization ID
     * @param {string} permission - Permission to check
     */
    permissions: (organizationId: string, permission: string) =>
      ['organizations', organizationId, 'permissions', permission] as const,
    settings: (slug: string) => ['organizations', slug, 'settings'] as const,
    /** Extensions for organization functionality */
    extensions: {
      /** All extension-related queries */
      all: () => ['organization-extensions'] as const,
      /** Get organization metrics by ID
       * @param {string} organizationId - Organization ID
       */
      metrics: (organizationId: string) =>
        ['organization-extensions', 'metrics', organizationId] as const,
      /** Get organization activity by ID
       * @param {string} organizationId - Organization ID
       */
      activity: (organizationId: string) =>
        ['organization-extensions', 'activity', organizationId] as const,
      /** Get active sessions for an organization
       * @param {string} organizationId - Organization ID
       */
      activeSessions: (organizationId: string) =>
        ['organization-extensions', 'active-sessions', organizationId] as const,
      /** Workspace-related queries */
      workspaces: {
        /** Get all workspaces for an organization
         * @param {string} organizationId - Organization ID
         */
        all: (organizationId: string) =>
          ['organization-extensions', 'workspaces', organizationId] as const,
        /** Get workspace by ID
         * @param {string} workspaceId - Workspace ID
         */
        detail: (workspaceId: string) =>
          [
            'organization-extensions',
            'workspaces',
            'detail',
            workspaceId,
          ] as const,
      },
      /** Get enhanced organization data by slug
       * @param {string} slug - Organization slug
       */
      enhanced: (slug: string) =>
        ['organization-extensions', 'enhanced', slug] as const,
    },
  },
  /** Workspace-related query keys */
  workspaces: {
    /** Get all workspaces */
    all: () => ['workspaces'] as const,
    /** Get workspace by ID
     * @param {string} id - Workspace ID
     */
    detail: (id: string) => ['workspaces', id] as const,
  },
  /** Session-related query keys */
  session: {
    /** Get current session */
    current: () => ['session'] as const,
  },
} as const;
