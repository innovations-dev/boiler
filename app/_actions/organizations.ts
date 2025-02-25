'use server';

import { z } from 'zod';

import { createAction } from '@/lib/actions/create-action';
import { createMemberSchema, createOrganizationSchema } from '@/lib/db/_schema';
import {
  addMemberToOrganization,
  createOrganization,
  getOrganization,
  getUserOrganizations,
  updateOrganization,
} from '@/lib/db/queries/organizations';

const getOrganizationInputSchema = z.string();
const getUserOrganizationsInputSchema = z.string();

const updateOrganizationInputSchema = z.object({
  name: z.string().optional(),
  slug: z.string().optional(),
  logo: z.string().optional(),
});

export async function createOrganizationAction(input: {
  name: string;
  slug?: string;
  userId: string;
}) {
  return createAction({
    schema: createOrganizationSchema,
    handler: () => createOrganization(input),
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
  input: z.infer<typeof updateOrganizationInputSchema>
) {
  return createAction({
    schema: updateOrganizationInputSchema,
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
    schema: createMemberSchema,
    handler: () => addMemberToOrganization(input),
    input,
    context: 'addMemberToOrganization',
  });
}
