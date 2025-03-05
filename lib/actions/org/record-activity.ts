/**
 * @fileoverview Server action for recording organization activity
 * @module lib/actions/org/record-activity
 */

'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { createOrgAdapter } from '@/lib/adapters/factory';
import { recordActivityInputSchema } from '@/lib/schemas/org-schemas';

/**
 * Server action to record organization activity
 * @param {object} input - Activity recording input
 * @returns Recorded activity or error
 */
export async function recordActivity(
  input: z.infer<typeof recordActivityInputSchema>
) {
  try {
    // Validate the input
    const validatedInput = recordActivityInputSchema.parse(input);

    // Record the activity
    const orgAdapter = createOrgAdapter();
    const activity = await orgAdapter.recordOrgActivity(validatedInput);

    // Revalidate the organization activity page
    revalidatePath(`/organizations/${input.orgId}/activity`);

    return { success: true, data: activity };
  } catch (error) {
    console.error('Failed to record activity:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}
