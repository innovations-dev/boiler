import { useState } from 'react';

/**
 * Configuration options for the useSelectionTable hook
 * @template T - The type of items in the table
 */
interface UseSelectionTableOptions<T> {
  /** Function to get a unique identifier from an item */
  getItemId: (item: T) => string;
  /** Optional callback when selection changes */
  onSelectionChange?: (selectedIds: string[]) => void;
}

/**
 * Return type for the useSelectionTable hook
 * @template T - The type of items in the table
 */
interface UseSelectionTableReturn<T> {
  /** Array of currently selected item IDs */
  selectedIds: string[];
  /** Function to check if an item is selected */
  isSelected: (item: T) => boolean;
  /** Function to toggle selection state of an item */
  toggleSelection: (item: T) => void;
  /** Function to toggle selection of all items */
  toggleAll: (items: T[]) => void;
  /** Function to clear all selections */
  clearSelection: () => void;
  /** Function to get array of selected items */
  selectedItems: (items: T[]) => T[];
  /** Boolean indicating if any items are selected */
  hasSelection: boolean;
}

/**
 * Hook for managing selection state in tables and lists
 *
 * Features:
 * - Type-safe selection management
 * - Individual and bulk selection operations
 * - Selection state persistence
 * - Optional selection change callback
 *
 * Common use cases:
 * - Data tables with checkboxes
 * - Multi-select lists
 * - Batch operation UIs
 *
 * @template T - The type of items in the table
 * @param {UseSelectionTableOptions<T>} options - Configuration options
 * @returns {UseSelectionTableReturn<T>} Selection state and handlers
 *
 * @example
 * ```tsx
 * interface User {
 *   id: string;
 *   name: string;
 * }
 *
 * function UserTable({ users }: { users: User[] }) {
 *   const {
 *     selectedIds,
 *     isSelected,
 *     toggleSelection,
 *     toggleAll,
 *     clearSelection,
 *     hasSelection
 *   } = useSelectionTable<User>({
 *     getItemId: (user) => user.id,
 *     onSelectionChange: (ids) => console.log('Selection changed:', ids)
 *   });
 *
 *   return (
 *     <div>
 *       {hasSelection && (
 *         <div>
 *           {selectedIds.length} users selected
 *           <button onClick={clearSelection}>Clear</button>
 *         </div>
 *       )}
 *       <table>
 *         <thead>
 *           <tr>
 *             <th>
 *               <input
 *                 type="checkbox"
 *                 checked={users.length > 0 && selectedIds.length === users.length}
 *                 onChange={() => toggleAll(users)}
 *               />
 *             </th>
 *             <th>Name</th>
 *           </tr>
 *         </thead>
 *         <tbody>
 *           {users.map(user => (
 *             <tr key={user.id}>
 *               <td>
 *                 <input
 *                   type="checkbox"
 *                   checked={isSelected(user)}
 *                   onChange={() => toggleSelection(user)}
 *                 />
 *               </td>
 *               <td>{user.name}</td>
 *             </tr>
 *           ))}
 *         </tbody>
 *       </table>
 *     </div>
 *   );
 * }
 * ```
 *
 * @see Related components:
 * - Table - shadcn/ui table component
 * - Checkbox - shadcn/ui checkbox component
 */
export function useSelectionTable<T>({
  getItemId,
  onSelectionChange,
}: UseSelectionTableOptions<T>): UseSelectionTableReturn<T> {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const isSelected = (item: T) => selectedIds.includes(getItemId(item));

  const toggleSelection = (item: T) => {
    const id = getItemId(item);
    const newSelection = selectedIds.includes(id)
      ? selectedIds.filter((selectedId) => selectedId !== id)
      : [...selectedIds, id];

    setSelectedIds(newSelection);
    onSelectionChange?.(newSelection);
  };

  const toggleAll = (items: T[]) => {
    const allIds = items.map(getItemId);
    const newSelection = selectedIds.length === allIds.length ? [] : allIds;

    setSelectedIds(newSelection);
    onSelectionChange?.(newSelection);
  };

  const clearSelection = () => {
    setSelectedIds([]);
    onSelectionChange?.([]);
  };

  const selectedItems = (items: T[]) =>
    items.filter((item) => selectedIds.includes(getItemId(item)));

  return {
    selectedIds,
    isSelected,
    toggleSelection,
    toggleAll,
    clearSelection,
    selectedItems,
    hasSelection: selectedIds.length > 0,
  };
}
