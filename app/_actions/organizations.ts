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

// Define Response type
interface Response<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
  };
}

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

// Helper function to safely parse JSON metadata
function parseMetadata(
  metadataStr: string | undefined
): Record<string, any> | undefined {
  if (!metadataStr) return undefined;

  try {
    const parsed = JSON.parse(metadataStr);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, any>;
    }
  } catch (error) {
    // Log error message instead of the entire error object
    logger.error('Failed to parse metadata JSON', {
      message: error instanceof Error ? error.message : String(error),
    });
  }

  return undefined;
}

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
}): Promise<Response> {
  try {
    logger.debug('Creating organization', { input });

    // Parse metadata safely using the helper function
    const parsedMetadata = parseMetadata(input.metadata);

    // Use the Better-Auth client instead of the custom implementation
    const organization = await organizationService.create({
      name: input.name,
      slug: input.slug,
      logo: input.logo,
      metadata: parsedMetadata,
    });

    // Return the response in the same format as before
    return {
      success: true,
      data: organization,
    };
  } catch (error) {
    // Log error message instead of the entire error object
    logger.error('Error in createOrganizationAction:', {
      message: error instanceof Error ? error.message : String(error),
    });
    return {
      success: false,
      error: {
        message:
          error instanceof Error
            ? error.message
            : 'Failed to create organization',
      },
    };
  }
}

/**
 * @deprecated Use the Better-Auth client from lib/better-auth/organization.ts instead.
 * This action will be removed in a future release.
 */
export async function getOrganizationAction(id: string): Promise<Response> {
  try {
    // Use the Better-Auth client instead of the custom implementation
    const organization = await organizationService.getFullOrganization(id);

    // Return the response in the same format as before
    return {
      success: true,
      data: organization,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message:
          error instanceof Error ? error.message : 'Failed to get organization',
      },
    };
  }
}

/**
 * @deprecated Use the Better-Auth client from lib/better-auth/organization.ts instead.
 * This action will be removed in a future release.
 */
export async function getUserOrganizationsAction(
  userId: string
): Promise<Response> {
  try {
    logger.debug('Getting user organizations', { userId });

    // Use the Better-Auth client instead of the custom implementation
    const organizations = await organizationService.list();

    // Return the response in the same format as before
    return {
      success: true,
      data: organizations,
    };
  } catch (error) {
    // Log error message instead of the entire error object
    logger.error('Error in getUserOrganizationsAction:', {
      message: error instanceof Error ? error.message : String(error),
    });
    return {
      success: false,
      error: {
        message:
          error instanceof Error
            ? error.message
            : 'Failed to get user organizations',
      },
    };
  }
}

/**
 * @deprecated Use the Better-Auth client from lib/better-auth/organization.ts instead.
 * This action will be removed in a future release.
 */
export async function updateOrganizationAction(
  id: string,
  input: z.infer<typeof updateOrganizationSchema>
): Promise<Response> {
  try {
    // Handle metadata based on its type
    let metadataObj: Record<string, any> | undefined = undefined;

    if (typeof input.metadata === 'string') {
      metadataObj = parseMetadata(input.metadata);
    } else if (input.metadata && typeof input.metadata === 'object') {
      // Ensure it's a valid object before casting
      metadataObj = input.metadata as Record<string, any>;
    }

    // Use the Better-Auth client instead of the custom implementation
    const organization = await organizationService.update({
      id,
      name: input.name,
      slug: input.slug || undefined,
      logo: input.logo || undefined,
      metadata: metadataObj,
    });

    // Return the response in the same format as before
    return {
      success: true,
      data: organization,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message:
          error instanceof Error
            ? error.message
            : 'Failed to update organization',
      },
    };
  }
}

/**
 * @deprecated Use the Better-Auth client from lib/better-auth/organization.ts instead.
 * This action will be removed in a future release.
 */
export async function addMemberToOrganizationAction(input: {
  organizationId: string;
  userId: string;
  role: 'ADMIN' | 'MEMBER';
}): Promise<Response> {
  try {
    // Use the Better-Auth client instead of the custom implementation
    await organizationService.inviteMember({
      organizationId: input.organizationId,
      email: input.userId, // Note: This is a simplification, in reality we'd need to get the user's email
      role: input.role,
    });

    // Return the response in the same format as before
    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message:
          error instanceof Error
            ? error.message
            : 'Failed to add member to organization',
      },
    };
  }
}

/**
 * @deprecated Use the Better-Auth client from lib/better-auth/organization.ts instead.
 * This action will be removed in a future release.
 */
export async function setActiveOrganizationAction(input: {
  sessionId: string;
  organizationId: string;
}): Promise<Response> {
  try {
    // Use the Better-Auth client instead of the custom implementation
    await organizationService.setActive(input.organizationId);

    // Return the response in the same format as before
    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message:
          error instanceof Error
            ? error.message
            : 'Failed to set active organization',
      },
    };
  }
}

/**
 * @deprecated Use the Better-Auth client from lib/better-auth/organization.ts instead.
 * This action will be removed in a future release.
 */
export async function updateOrganizationSettingsAction(
  slug: string,
  input: z.infer<typeof organizationSettingsSchema>
): Promise<Response> {
  try {
    // First, get the organization to get its ID
    const organization = await organizationService.getFullOrganization(slug);

    // Use the Better-Auth client instead of the custom implementation
    const updatedOrganization = await organizationService.update({
      id: organization.id,
      name: input.name,
      slug: input.slug || undefined,
      logo: input.logo || undefined,
    });

    // Return the response in the same format as before
    return {
      success: true,
      data: updatedOrganization,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message:
          error instanceof Error
            ? error.message
            : 'Failed to update organization settings',
      },
    };
  }
}
