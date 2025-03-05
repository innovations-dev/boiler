/**
 * @fileoverview Server action for updating a workspace
 * @module lib/actions/org/update-workspace
 */

'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { createOrgAdapter } from '@/lib/adapters/factory';
import { updateWorkspaceInputSchema } from '@/lib/schemas/org-schemas';

/**
 * Extended schema for the server action that includes the workspace ID and organization ID
 */
const updateWorkspaceActionSchema = updateWorkspaceInputSchema.extend({
  workspaceId: z.string(),
  orgId: z.string(),
});

/**
 * Server action to update a workspace
 * @param {object} input - Workspace update input with workspace ID
 * @returns Updated workspace or error
 */
export async function updateWorkspace(
  input: z.infer<typeof updateWorkspaceActionSchema>
) {
  try {
    // Validate the input
    const { workspaceId, orgId, ...updateData } =
      updateWorkspaceActionSchema.parse(input);

    // Update the workspace
    const orgAdapter = createOrgAdapter();
    const workspace = await orgAdapter.updateWorkspace(workspaceId, updateData);

    // Revalidate the organization and workspace pages
    revalidatePath(`/organizations/${orgId}`);
    revalidatePath(`/organizations/${orgId}/workspaces/${workspaceId}`);

    return { success: true, data: workspace };
  } catch (error) {
    console.error('Failed to update workspace:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}
