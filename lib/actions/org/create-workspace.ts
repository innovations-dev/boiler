/**
 * @fileoverview Server action for creating a workspace
 * @module lib/actions/org/create-workspace
 */

'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { createOrgAdapter } from '@/lib/adapters/factory';
import { createWorkspaceInputSchema } from '@/lib/schemas/org-schemas';

/**
 * Server action to create a workspace
 * @param {object} input - Workspace creation input
 * @returns Created workspace or error
 */
export async function createWorkspace(
  input: z.infer<typeof createWorkspaceInputSchema>
) {
  try {
    // Validate the input
    const validatedInput = createWorkspaceInputSchema.parse(input);

    // Create the workspace
    const orgAdapter = createOrgAdapter();
    const workspace = await orgAdapter.createWorkspace(validatedInput);

    // Revalidate the organization page to reflect the new workspace
    revalidatePath(`/organizations/${input.orgId}`);

    return { success: true, data: workspace };
  } catch (error) {
    console.error('Failed to create workspace:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}
