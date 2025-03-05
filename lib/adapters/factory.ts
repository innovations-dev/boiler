/**
 * Adapter Factory
 *
 * This file provides factory functions for creating adapters.
 * These factory functions abstract the implementation details of the adapters,
 * allowing the application to create adapters without being tightly coupled
 * to specific implementations.
 *
 * @fileoverview
 * The adapter factory provides a clean way to create adapters without
 * directly instantiating the adapter classes. This allows the application
 * to use the adapters without being tightly coupled to specific implementations.
 */

import { BetterAuthOrgAdapter } from './better-auth-org-adapter';
import type { OrgAdapter } from './org-adapter';

/**
 * Creates an organization adapter
 *
 * This factory function creates an instance of the organization adapter.
 * It abstracts the implementation details of the adapter, allowing the
 * application to create an adapter without being tightly coupled to a
 * specific implementation.
 *
 * @returns An instance of the organization adapter
 *
 * @example
 * const orgAdapter = createOrgAdapter();
 * const metrics = await orgAdapter.getOrgMetrics('org-123');
 */
export function createOrgAdapter(): OrgAdapter {
  // Currently using the Better Auth implementation
  return new BetterAuthOrgAdapter();
}
