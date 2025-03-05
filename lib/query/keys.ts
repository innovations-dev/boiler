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
    /** @deprecated Use new better-auth plugin implementation instead  */
    invitations: {
      // all: (slug: string) => ['organizations', slug, 'invitations'] as const,
      // Currentled used by app/(auth)/accept-invitation/[id]/page.tsx
      detail: (id: string) => ['organizations', 'invitations', id] as const,
    },
  },
  /** Session-related query keys */
  session: {
    /** Get current session */
    current: () => ['session'] as const,
  },
  /** Organization plugin query keys */
  org: {
    /** Get metrics for an organization
     * @param {string} orgId - Organization ID
     */
    metrics: (orgId: string) => ['org', 'metrics', orgId] as const,
    /** Get activity for an organization
     * @param {string} orgId - Organization ID
     */
    activity: (orgId: string) => ['org', 'activity', orgId] as const,
    /** Get workspaces for an organization
     * @param {string} orgId - Organization ID
     */
    workspaces: {
      /** Get all workspaces for an organization
       * @param {string} orgId - Organization ID
       */
      all: (orgId: string) => ['org', 'workspaces', orgId] as const,
      /** Get a specific workspace
       * @param {string} workspaceId - Workspace ID
       */
      detail: (workspaceId: string) =>
        ['org', 'workspaces', 'detail', workspaceId] as const,
    },
  },
} as const;
