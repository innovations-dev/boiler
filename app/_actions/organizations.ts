'use server';

import { z } from 'zod';

import { createAction } from '@/lib/actions/create-action';
import {
  createOrganizationSchema,
  organizationSettingsSchema,
  updateOrganizationSchema,
} from '@/lib/db/_schema';
import {
  addMemberToOrganization,
  createOrganization,
  getOrganization,
  getUserOrganizations,
  setActiveOrganization,
  updateOrganization,
  updateOrganizationSettings,
} from '@/lib/db/queries/organizations';

// Simple input schemas
const getOrganizationInputSchema = z.string();
const getUserOrganizationsInputSchema = z.string();

// Member schema
const actionMemberSchema = z.object({
  organizationId: z.string(),
  userId: z.string(),
  role: z.enum(['ADMIN', 'MEMBER']),
});

// Session schema
const actionSessionSchema = z.object({
  sessionId: z.string(),
  organizationId: z.string(),
});

export async function createOrganizationAction(input: {
  name: string;
  slug?: string;
  userId: string;
  logo?: string;
  metadata?: string;
}) {
  return createAction({
    // Use the createOrganizationSchema extended with userId for input validation
    schema: createOrganizationSchema.extend({
      userId: z.string(),
    }),
    handler: async () => {
      try {
        const result = await createOrganization(input);

        // Ensure the result is valid before returning
        if (!result) {
          throw new Error('No organization data returned from API');
        }

        // The result will be validated by the organizationSchema in the hook
        return result;
      } catch (error) {
        console.error('Error in createOrganizationAction:', error);
        // Re-throw the error to be handled by the createAction wrapper
        throw error;
      }
    },
    input,
    context: 'createOrganization',
  });
}

export async function getOrganizationAction(id: string) {
  return createAction({
    schema: getOrganizationInputSchema,
    handler: () => getOrganization(id),
    input: id,
    context: 'getOrganization',
  });
}

export async function getUserOrganizationsAction(userId: string) {
  return createAction({
    schema: getUserOrganizationsInputSchema,
    handler: () => getUserOrganizations(userId),
    input: userId,
    context: 'getUserOrganizations',
  });
}

export async function updateOrganizationAction(
  id: string,
  input: z.infer<typeof updateOrganizationSchema>
) {
  return createAction({
    schema: updateOrganizationSchema,
    handler: () => updateOrganization(id, input),
    input,
    context: 'updateOrganization',
  });
}

export async function addMemberToOrganizationAction(input: {
  organizationId: string;
  userId: string;
  role: 'ADMIN' | 'MEMBER';
}) {
  return createAction({
    schema: actionMemberSchema,
    handler: () => addMemberToOrganization(input),
    input,
    context: 'addMemberToOrganization',
  });
}

export async function setActiveOrganizationAction(input: {
  sessionId: string;
  organizationId: string;
}) {
  return createAction({
    schema: actionSessionSchema,
    handler: () => setActiveOrganization(input),
    input,
    context: 'setActiveOrganization',
  });
}

export async function updateOrganizationSettingsAction(
  slug: string,
  input: z.infer<typeof organizationSettingsSchema>
) {
  return createAction({
    schema: organizationSettingsSchema,
    handler: () => updateOrganizationSettings(slug, input),
    input,
    context: 'updateOrganizationSettings',
  });
}
