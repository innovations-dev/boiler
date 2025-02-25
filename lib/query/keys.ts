/**
 * @fileoverview Centralized query key factory for React Query.
 * Provides type-safe query key management and consistent key structure across the application.
 *
 * @module lib/query/keys
 * @see {@link https://tanstack.com/query/latest/docs/react/guides/query-keys} React Query Keys Documentation
 * @see {@link lib/query/cache-config} for related cache time configurations
 */

/**
 * Type representing a query key tuple
 * @template T - The type of additional parameters
 */
type QueryKey<T = void> = T extends void
  ? readonly string[]
  : readonly [...string[], T];

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
    /** Get all users
     * @returns {QueryKey} ['users']
     */
    all: () => ['users'] as const,
    /** Get user by ID
     * @param {string} id - User ID
     * @returns {QueryKey} ['users', id]
     */
    detail: (id: string) => ['users', id] as const,
    /** Get user preferences
     * @param {string} id - User ID
     * @returns {QueryKey} ['users', id, 'preferences']
     */
    preferences: (id: string) => ['users', id, 'preferences'] as const,
  },
  /** Organization-related query keys */
  organizations: {
    /** Get all organizations
     * @returns {QueryKey} ['organizations']
     */
    all: () => ['organizations'] as const,
    /** Get organization by ID
     * @param {string} id - Organization ID
     * @returns {QueryKey} ['organizations', id]
     */
    detail: (id: string) => ['organizations', id] as const,
    /** Get organization members
     * @param {string} id - Organization ID
     * @returns {QueryKey} ['organizations', id, 'members']
     */
    members: (id: string) => ['organizations', id, 'members'] as const,
  },
  /** Workspace-related query keys */
  workspaces: {
    /** Get all workspaces
     * @returns {QueryKey} ['workspaces']
     */
    all: () => ['workspaces'] as const,
    /** Get workspace by ID
     * @param {string} id - Workspace ID
     * @returns {QueryKey} ['workspaces', id]
     */
    detail: (id: string) => ['workspaces', id] as const,
  },
  /** Session-related query keys */
  session: {
    /** Get current session
     * @returns {QueryKey} ['session']
     */
    current: () => ['session'] as const,
  },
} as const;
