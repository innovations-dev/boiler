import { useCallback, useEffect, useState } from 'react';
import { parseAsString, useQueryState } from 'nuqs';

import { useDebounce } from './use-debounce';

/**
 * Configuration options for the useSearchAndFilter hook
 *
 * @template TStatus - The type of status values (e.g., "active" | "archived")
 * @template TSort - The type of sort fields (e.g., "name" | "createdAt")
 * @template TOrder - The type of sort order ("asc" | "desc")
 *
 * @example
 * ```typescript
 * // Basic configuration
 * const options: UseSearchAndFilterOptions = {
 *   defaultSort: "createdAt",
 *   defaultOrder: "desc",
 *   searchParam: "search",
 *   debounce: { enabled: true, delay: 300 }
 * };
 *
 * // Type-safe configuration
 * type Status = "active" | "archived" | "draft";
 * type SortField = "name" | "createdAt" | "updatedAt";
 *
 * const typedOptions: UseSearchAndFilterOptions<Status, SortField> = {
 *   defaultSort: "createdAt",
 *   defaultStatus: "active",
 *   debounce: { enabled: true, delay: 500 }
 * };
 *
 * // Custom URL parameters
 * const customParams: UseSearchAndFilterOptions = {
 *   searchParam: "q",
 *   statusParam: "filter",
 *   sortParam: "orderBy",
 *   orderParam: "direction"
 * };
 *
 * // Disable debouncing (use nuqs default)
 * const noDebounce: UseSearchAndFilterOptions = {
 *   debounce: { enabled: false }
 * };
 * ```
 */
interface UseSearchAndFilterOptions<
  TStatus extends string = string,
  TSort extends string = string,
  TOrder extends 'asc' | 'desc' = 'asc' | 'desc',
> {
  /**
   * Default sort field to use when no sort is specified in URL
   * @example "createdAt" | "name" | "updatedAt"
   */
  defaultSort?: TSort;

  /**
   * Default sort order to use when no order is specified in URL
   * @default "desc"
   * @example "asc" | "desc"
   */
  defaultOrder?: TOrder;

  /**
   * Default status filter to use when no status is specified in URL
   * @example "active" | "archived" | "draft"
   */
  defaultStatus?: TStatus;

  /**
   * URL parameter key for search query
   * @default "q"
   * @example
   * ```typescript
   * // Results in URL like: ?q=searchterm
   * searchParam: "q"
   *
   * // Results in URL like: ?search=searchterm
   * searchParam: "search"
   * ```
   */
  searchParam?: string;

  /**
   * URL parameter key for status filter
   * @default "status"
   * @example
   * ```typescript
   * // Results in URL like: ?status=active
   * statusParam: "status"
   *
   * // Results in URL like: ?filter=active
   * statusParam: "filter"
   * ```
   */
  statusParam?: string;

  /**
   * URL parameter key for sort field
   * @default "sort"
   * @example
   * ```typescript
   * // Results in URL like: ?sort=createdAt
   * sortParam: "sort"
   *
   * // Results in URL like: ?orderBy=createdAt
   * sortParam: "orderBy"
   * ```
   */
  sortParam?: string;

  /**
   * URL parameter key for sort order
   * @default "order"
   * @example
   * ```typescript
   * // Results in URL like: ?order=desc
   * orderParam: "order"
   *
   * // Results in URL like: ?direction=desc
   * orderParam: "direction"
   * ```
   */
  orderParam?: string;

  /**
   * Debounce configuration for search input
   * @default { enabled: true, delay: 300 }
   *
   * @example
   * ```typescript
   * // Default debouncing
   * debounce: { enabled: true, delay: 300 }
   *
   * // Custom delay
   * debounce: { enabled: true, delay: 500 }
   *
   * // Disable debouncing (use nuqs default)
   * debounce: { enabled: false }
   * ```
   */
  debounce?: {
    /** Whether to enable debouncing */
    enabled: boolean;
    /** Delay in milliseconds before updating URL */
    delay?: number;
  };
}

/**
 * Return type for the useSearchAndFilter hook
 * @template TStatus - The type of status values
 * @template TSort - The type of sort fields
 * @template TOrder - The type of sort order
 */
interface UseSearchAndFilterReturn<
  TStatus extends string = string,
  TSort extends string = string,
  TOrder extends 'asc' | 'desc' = 'asc' | 'desc',
> {
  /** Current search query in URL */
  query: string | null;
  /** Current status filter in URL */
  status: TStatus | null;
  /** Current sort field */
  sort: TSort;
  /** Current sort order */
  order: TOrder;
  /** Current search input value (pre-debounce) */
  searchInput: string;
  /** Function to update search input */
  setSearchInput: (value: string) => void;
  /** Function to handle status filter changes */
  handleStatusChange: (value: string) => void;
  /** Function to handle sort changes (format: "field-order") */
  handleSortChange: (value: string) => void;
  /** Function to reset all filters to defaults */
  resetFilters: () => void;
}

/**
 * Hook for managing search, filter, and sort state with URL parameters
 *
 * Features:
 * - Type-safe URL state management using nuqs
 * - Debounced search input to prevent excessive URL updates
 * - Maintains sort order and status filters in URL
 * - Provides reset functionality
 *
 * URL Parameters:
 * - Search query: Controlled by searchParam (default: "q")
 * - Status filter: Controlled by statusParam (default: "status")
 * - Sort field: Controlled by sortParam (default: "sort")
 * - Sort order: Controlled by orderParam (default: "order")
 *
 * @template TStatus - The type of status values (e.g., "active" | "archived")
 * @template TSort - The type of sort fields (e.g., "name" | "createdAt")
 * @template TOrder - The type of sort order ("asc" | "desc")
 *
 * @param {UseSearchAndFilterOptions} options - Configuration options
 * @returns {UseSearchAndFilterReturn} Search and filter state and handlers
 *
 * @example
 * ```tsx
 * // Basic usage with type safety
 * const {
 *   query,
 *   status,
 *   sort,
 *   order,
 *   searchInput,
 *   setSearchInput,
 *   handleStatusChange,
 *   handleSortChange,
 *   resetFilters
 * } = useSearchAndFilter<"active" | "archived", "name" | "createdAt">({
 *   defaultSort: "createdAt",
 *   defaultOrder: "desc",
 *   debounce: { enabled: true, delay: 300 }
 * });
 *
 * // Usage in a component
 * return (
 *   <div>
 *     <input
 *       value={searchInput}
 *       onChange={(e) => setSearchInput(e.target.value)}
 *       placeholder="Search..."
 *     />
 *     <select value={status || "all"} onChange={(e) => handleStatusChange(e.target.value)}>
 *       <option value="all">All</option>
 *       <option value="active">Active</option>
 *       <option value="archived">Archived</option>
 *     </select>
 *     <select
 *       value={`${sort}-${order}`}
 *       onChange={(e) => handleSortChange(e.target.value)}
 *     >
 *       <option value="createdAt-desc">Newest</option>
 *       <option value="createdAt-asc">Oldest</option>
 *       <option value="name-asc">Name A-Z</option>
 *     </select>
 *     <button onClick={resetFilters}>Reset</button>
 *   </div>
 * );
 * ```
 *
 * @see Related hooks:
 * - useDebounce - For search input debouncing
 * - useQueryState - From nuqs, for URL state management
 */
export function useSearchAndFilter<
  TStatus extends string = string,
  TSort extends string = string,
  TOrder extends 'asc' | 'desc' = 'asc' | 'desc',
>({
  defaultSort,
  defaultOrder = 'desc' as TOrder,
  defaultStatus,
  searchParam = 'q',
  statusParam = 'status',
  sortParam = 'sort',
  orderParam = 'order',
  debounce = { enabled: true, delay: 300 },
}: UseSearchAndFilterOptions<
  TStatus,
  TSort,
  TOrder
> = {}): UseSearchAndFilterReturn<TStatus, TSort, TOrder> {
  // URL state
  const [query, setQuery] = useQueryState(searchParam);
  const [status, setStatus] = useQueryState(statusParam);
  const [sort, setSort] = useQueryState(
    sortParam,
    parseAsString.withDefault(defaultSort as string)
  );
  const [order, setOrder] = useQueryState(
    orderParam,
    parseAsString.withDefault(defaultOrder as string)
  );

  // Local state for input
  const [searchInput, setSearchInput] = useState(query || '');

  // Conditionally apply debounce
  const debouncedSearch = debounce.enabled
    ? useDebounce(searchInput, debounce.delay)
    : searchInput;

  // Update URL when search changes
  useEffect(() => {
    setQuery(debouncedSearch || null);
  }, [debouncedSearch, setQuery]);

  const handleStatusChange = useCallback(
    (value: string) => {
      setStatus(value === 'all' ? null : value);
    },
    [setStatus]
  );

  const handleSortChange = useCallback(
    (value: string) => {
      const [newSort, newOrder] = value.split('-') as [TSort, TOrder];
      setSort(newSort);
      setOrder(newOrder);
    },
    [setSort, setOrder]
  );

  const resetFilters = useCallback(() => {
    setQuery(null);
    setStatus(defaultStatus || null);
    setSort(defaultSort || null);
    setOrder(defaultOrder);
    setSearchInput('');
  }, [
    setQuery,
    setStatus,
    setSort,
    setOrder,
    defaultStatus,
    defaultSort,
    defaultOrder,
  ]);

  return {
    query,
    status: status as TStatus | null,
    sort: sort as TSort,
    order: order as TOrder,
    searchInput,
    setSearchInput,
    handleStatusChange,
    handleSortChange,
    resetFilters,
  };
}
