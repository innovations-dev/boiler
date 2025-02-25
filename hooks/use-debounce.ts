/**
 * Custom hook for debouncing values with TypeScript support
 *
 * Features:
 * - Type-safe debouncing for any value type
 * - Configurable delay
 * - Proper cleanup on unmount
 * - Maintains value type through debouncing
 *
 * Common use cases:
 * - Search input debouncing
 * - Form input optimization
 * - API call rate limiting
 * - URL state management
 *
 * @template T - The type of value to debounce
 * @param {T} value - The value to debounce
 * @param {number} delay - The delay in milliseconds (default: 300)
 * @returns {T} The debounced value
 *
 * @example
 * ```tsx
 * function SearchInput() {
 *   const [input, setInput] = useState("");
 *   const debouncedValue = useDebounce(input, 500);
 *
 *   // Effect only runs when debouncedValue changes
 *   useEffect(() => {
 *     // Perform search or API call
 *     searchApi(debouncedValue);
 *   }, [debouncedValue]);
 *
 *   return (
 *     <input
 *       type="text"
 *       value={input}
 *       onChange={(e) => setInput(e.target.value)}
 *       placeholder="Search..."
 *     />
 *   );
 * }
 * ```
 *
 * @see Related hooks:
 * - useSearchAndFilter - Uses this hook for search input debouncing
 */
import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up the timeout
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timeout
    return () => {
      clearTimeout(timeoutId);
    };
  }, [value, delay]);

  return debouncedValue;
}
