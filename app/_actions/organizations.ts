'use server';

import { z } from 'zod';

import { createAction } from '@/lib/actions/create-action';
import { organizationService } from '@/lib/better-auth/organization';
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
import { logger } from '@/lib/logger';

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

/**
 * @deprecated Use the Better-Auth client from lib/better-auth/organization.ts instead.
 * This action will be removed in a future release.
 */
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
        // Use the Better-Auth client instead of the custom implementation
        logger.debug('Creating organization using Better-Auth client', {
          name: input.name,
          slug: input.slug,
        });

        // Parse metadata safely if it exists
        let parsedMetadata: Record<string, unknown> | undefined = undefined;
        if (input.metadata) {
          try {
            const parsed = JSON.parse(input.metadata);
            if (
              parsed &&
              typeof parsed === 'object' &&
              !Array.isArray(parsed)
            ) {
              parsedMetadata = parsed as Record<string, unknown>;
            } else {
              logger.warn('Metadata is not a valid object, ignoring', {
                metadata: input.metadata,
              });
            }
          } catch (parseError) {
            logger.error(
              'Failed to parse metadata JSON',
              parseError as Record<string, unknown>
            );
          }
        }

        const result = await organizationService.create({
          name: input.name,
          slug: input.slug,
          logo: input.logo,
          metadata: parsedMetadata,
        });

        // Ensure the result is valid before returning
        if (!result) {
          throw new Error('No organization data returned from API');
        }

        // The result will be validated by the organizationSchema in the hook
        return { data: result };
      } catch (error) {
        logger.error(
          'Error in createOrganizationAction:',
          error as Record<string, unknown>
        );
        // Re-throw the error to be handled by the createAction wrapper
        throw error;
      }
    },
    input,
    context: 'createOrganization',
  });
}

/**
 * @deprecated Use the Better-Auth client from lib/better-auth/organization.ts instead.
 * This action will be removed in a future release.
 */
export async function getOrganizationAction(id: string) {
  return createAction({
    schema: getOrganizationInputSchema,
    handler: () => getOrganization(id),
    input: id,
    context: 'getOrganization',
  });
}

/**
 * @deprecated Use the Better-Auth client from lib/better-auth/organization.ts instead.
 * This action will be removed in a future release.
 */
export async function getUserOrganizationsAction(userId: string) {
  return createAction({
    schema: getUserOrganizationsInputSchema,
    handler: async () => {
      try {
        // Use the Better-Auth client instead of the custom implementation
        logger.debug('Getting user organizations using Better-Auth client');

        const result = await organizationService.list();

        return { data: result };
      } catch (error) {
        logger.error(
          'Error in getUserOrganizationsAction:',
          error as Record<string, unknown>
        );
        throw error;
      }
    },
    input: userId,
    context: 'getUserOrganizations',
  });
}

/**
 * @deprecated Use the Better-Auth client from lib/better-auth/organization.ts instead.
 * This action will be removed in a future release.
 */
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

/**
 * @deprecated Use the Better-Auth client from lib/better-auth/organization.ts instead.
 * This action will be removed in a future release.
 */
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

/**
 * @deprecated Use the Better-Auth client from lib/better-auth/organization.ts instead.
 * This action will be removed in a future release.
 */
export async function setActiveOrganizationAction(input: {
  sessionId: string;
  organizationId: string;
}) {
  return createAction({
    schema: actionSessionSchema,
    handler: async () => {
      try {
        // Use the Better-Auth client instead of the custom implementation
        logger.debug('Setting active organization using Better-Auth client', {
          organizationId: input.organizationId,
        });

        await organizationService.setActive(input.organizationId);

        return { success: true };
      } catch (error) {
        logger.error(
          'Error in setActiveOrganizationAction:',
          error as Record<string, unknown>
        );
        throw error;
      }
    },
    input,
    context: 'setActiveOrganization',
  });
}

/**
 * @deprecated Use the Better-Auth client from lib/better-auth/organization.ts instead.
 * This action will be removed in a future release.
 */
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
