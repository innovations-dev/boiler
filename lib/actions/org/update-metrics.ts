/**
 * @fileoverview Server action for updating organization metrics
 * @module lib/actions/org/update-metrics
 */

'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { createOrgAdapter } from '@/lib/adapters/factory';
import { updateMetricsInputSchema } from '@/lib/schemas/org-schemas';

/**
 * Extended schema for the server action that includes the organization ID
 */
const updateMetricsActionSchema = updateMetricsInputSchema.extend({
  orgId: z.string(),
});

/**
 * Server action to update organization metrics
 * @param {object} input - Metrics update input
 * @returns Updated metrics or error
 */
export async function updateMetrics(
  input: z.infer<typeof updateMetricsActionSchema>
) {
  try {
    // Validate the input
    const validatedInput = updateMetricsActionSchema.parse(input);
    const { orgId } = validatedInput;

    // Update the metrics
    const orgAdapter = createOrgAdapter();
    const metrics = await orgAdapter.updateOrgMetrics(orgId, validatedInput);

    // Revalidate the organization dashboard page
    revalidatePath(`/organizations/${orgId}/dashboard`);

    return { success: true, data: metrics };
  } catch (error) {
    console.error('Failed to update metrics:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}
