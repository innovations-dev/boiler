'use server';

import { headers } from 'next/headers';
import { betterFetch } from '@better-fetch/fetch';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { z } from 'zod';

import { auth } from '@/lib/auth';
import { handleBetterFetchError } from '@/lib/better-auth/client';
import { organizationService } from '@/lib/better-auth/organization';
import { db } from '@/lib/db';
import {
  organizationSchema,
  organizationSettingsSchema,
  type Member,
  type Organization,
} from '@/lib/db/_schema';
import { member, organization, session, user } from '@/lib/db/schema';
import { handleUnknownError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { getBaseUrl, slugify } from '@/lib/utils';

// Define the OrganizationSettings type from the schema
type OrganizationSettings = z.infer<typeof organizationSettingsSchema>;

/**
 * Retrieves an organization by its ID.
 *
 * @deprecated Use organizationService.getFullOrganization from lib/better-auth/organization.ts instead.
 * This function will be removed in a future release.
 *
 * @param id - The ID of the organization to retrieve
 * @returns A promise that resolves to the organization or undefined if not found
 *
 * @example
 * ```typescript
 * // Get an organization by ID
 * const organization = await getOrganization('org-123');
 * if (organization) {
 *   console.log(`Found organization: ${organization.name}`);
 * }
 * ```
 *
 * @remarks
 * This function is deprecated in favor of using the Better-Auth client.
 * It currently attempts to use the Better-Auth client internally but maintains the same
 * interface for backward compatibility. In the future, this function will be
 * removed entirely, and all code should use organizationService.getFullOrganization directly.
 */
export async function getOrganization(
  id: string
): Promise<Organization | undefined> {
  try {
    logger.debug('Getting organization', { id });

    // First, try to get the organization slug from the ID
    const org = await db
      .select({ slug: organization.slug })
      .from(organization)
      .where(eq(organization.id, id))
      .limit(1);

    if (!org.length || !org[0].slug) {
      logger.debug('Organization not found or has no slug', { id });
      // Fall back to direct database query
      return db.query.organization.findFirst({
        where: eq(organization.id, id),
        with: {
          members: {
            with: {
              user: true,
            },
          },
        },
      });
    }

    // Use Better-Auth client to get the organization
    try {
      const result = await organizationService.getFullOrganization(org[0].slug);

      // Convert the Better-Auth organization format to our internal format
      const convertedOrg = {
        ...result,
        // Convert string dates to Date objects
        createdAt: new Date(result.createdAt),
        updatedAt: new Date(result.updatedAt),
        // Ensure metadata is a string or null
        metadata: result.metadata ? JSON.stringify(result.metadata) : null,
        // Convert members if they exist
        members:
          result.members?.map((member) => ({
            ...member,
            createdAt: new Date(member.createdAt),
            updatedAt: new Date(member.updatedAt),
          })) || [],
      };

      return convertedOrg as unknown as Organization;
    } catch (betterAuthError) {
      // Handle Better-Auth errors
      logger.error('Better-Auth error getting organization', {
        id,
        error: betterAuthError as Record<string, unknown>,
      });

      // Fall back to direct database query if Better-Auth fails
      logger.warn('Falling back to direct database query', { id });

      return db.query.organization.findFirst({
        where: eq(organization.id, id),
        with: {
          members: {
            with: {
              user: true,
            },
          },
        },
      });
    }
  } catch (error) {
    logger.error('Failed to get organization', {
      id,
      error: error as Record<string, unknown>,
    });
    handleBetterFetchError(error);
    return undefined;
  }
}

/**
 * Retrieves all organizations for a specific user.
 *
 * @deprecated Use organizationService.list from lib/better-auth/organization.ts instead.
 * This function will be removed in a future release.
 *
 * @param userId - The ID of the user to get organizations for
 * @returns A promise that resolves to an array of organizations
 *
 * @example
 * ```typescript
 * // Get all organizations for a user
 * const organizations = await getUserOrganizations('user-123');
 * console.log(`User has ${organizations.length} organizations`);
 * ```
 *
 * @remarks
 * This function is deprecated in favor of using the Better-Auth client.
 * It currently uses the Better-Auth client internally but maintains the same
 * interface for backward compatibility. In the future, this function will be
 * removed entirely, and all code should use organizationService.list directly.
 */
export async function getUserOrganizations(
  userId: string
): Promise<Organization[]> {
  try {
    logger.debug('Getting user organizations', { userId });

    // Use Better-Auth client to get organizations
    try {
      const result = await organizationService.list();

      // Convert the Better-Auth organization format to our internal format
      const convertedOrgs = result.map((org) => ({
        ...org,
        // Convert string dates to Date objects
        createdAt: new Date(org.createdAt),
        updatedAt: new Date(org.updatedAt),
        // Ensure metadata is a string or null
        metadata: org.metadata ? JSON.stringify(org.metadata) : null,
      }));

      return convertedOrgs as unknown as Organization[];
    } catch (betterAuthError) {
      // Handle Better-Auth errors
      logger.error('Better-Auth error getting user organizations', {
        userId,
        error: betterAuthError as Record<string, unknown>,
      });

      // Fall back to direct database query if Better-Auth fails
      logger.warn('Falling back to direct database query', { userId });

      return db.query.organization.findMany({
        with: {
          members: {
            where: eq(member.userId, userId),
            with: {
              user: true,
            },
          },
        },
      });
    }
  } catch (error) {
    logger.error('Failed to get user organizations', {
      userId,
      error: error as Record<string, unknown>,
    });
    handleBetterFetchError(error);
    return [];
  }
}

/**
 * Creates a new organization and adds the creator as an admin.
 *
 * @deprecated Use organizationService.create from lib/better-auth/organization.ts instead.
 * This function will be removed in a future release.
 *
 * @param data - An object containing the organization information
 * @param data.name - The name of the organization
 * @param data.userId - The ID of the user creating the organization (becomes admin)
 * @param data.slug - The URL-friendly slug for the organization (optional, generated from name if not provided)
 * @param data.logo - The URL to the organization's logo image (optional)
 * @param data.metadata - JSON string containing additional metadata (optional)
 * @returns A Promise that resolves to the created Organization object
 *
 * @example
 * ```typescript
 * // Create a basic organization
 * const org = await createOrganization({
 *   name: 'My Organization',
 *   userId: 'user-123'
 * });
 *
 * // Create an organization with all fields
 * const org = await createOrganization({
 *   name: 'My Organization',
 *   userId: 'user-123',
 *   slug: 'my-org',
 *   logo: 'https://example.com/logo.png',
 *   metadata: JSON.stringify({ industry: 'Technology', size: 'Small' })
 * });
 * ```
 *
 * @remarks
 * This function uses the Better-Auth client to create the organization.
 * It handles parsing of metadata from JSON string to object format required by Better-Auth.
 * The function validates the response against the organization schema to ensure type safety.
 */
export async function createOrganization(data: {
  name: string;
  userId: string; // creator who becomes first admin
  slug?: string;
  logo?: string;
  metadata?: string;
}): Promise<Organization> {
  const { name, userId, logo, metadata } = data;

  // Get the session to verify authentication
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error('Authentication required to create an organization');
  }

  // Verify that the user has permission to create an organization
  if (session.user.id !== data.userId) {
    throw new Error('You can only create organizations for yourself');
  }

  // Make a direct API call to the Better-Auth organization/create endpoint
  // This is the correct way to interact with Better-Auth's organization functionality
  try {
    // Ensure slug is provided or generated
    const slug = data.slug || slugify(name);

    // Use the Better-Auth client instead of direct API calls
    logger.debug('Creating organization using Better-Auth client', {
      name,
      slug,
    });

    // Parse metadata safely if it exists
    let parsedMetadata: Record<string, unknown> | undefined = undefined;
    if (metadata) {
      try {
        const parsed = JSON.parse(metadata);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          parsedMetadata = parsed as Record<string, unknown>;
        } else {
          logger.warn('Metadata is not a valid object, ignoring', { metadata });
        }
      } catch (parseError) {
        logger.error(
          'Failed to parse metadata JSON',
          parseError as Record<string, unknown>
        );
      }
    }

    const result = await organizationService.create({
      name,
      slug,
      logo,
      metadata: parsedMetadata,
    });

    // Validate the response data against the schema
    try {
      // Use a more permissive schema for the API response
      const validatedOrg = organizationSchema.passthrough().parse(result);
      return validatedOrg;
    } catch (validationError) {
      logger.error(
        'Organization validation error:',
        validationError as Record<string, unknown>
      );
      // If validation fails, still return the data but log the error
      // This allows the client to handle the data even if it doesn't match the schema exactly
      return result as unknown as Organization;
    }
  } catch (error) {
    logger.error(
      'Failed to create organization:',
      error as Record<string, unknown>
    );
    throw new Error(
      error instanceof Error ? error.message : 'Failed to create organization'
    );
  }
}

/**
 * Updates an organization's details in the database.
 *
 * @deprecated Use organizationService.update from lib/better-auth/organization.ts instead.
 * This function will be removed in a future release.
 *
 * @param id - The unique identifier of the organization to update
 * @param data - An object containing the fields to update
 * @param data.name - The new name for the organization (optional)
 * @param data.slug - The new slug for the organization (optional)
 * @param data.logo - The new logo URL for the organization (optional)
 * @returns A Promise that resolves to the updated Organization object
 *
 * @example
 * ```typescript
 * // Update an organization's name
 * const updatedOrg = await updateOrganization('org-123', { name: 'New Name' });
 *
 * // Update multiple fields
 * const updatedOrg = await updateOrganization('org-123', {
 *   name: 'New Name',
 *   slug: 'new-slug',
 *   logo: 'https://example.com/logo.png'
 * });
 * ```
 *
 * @remarks
 * This function attempts to use the Better-Auth client to update the organization.
 * If the Better-Auth client fails, it falls back to direct database queries to ensure
 * backward compatibility during the migration period.
 */
export async function updateOrganization(
  id: string,
  data: Partial<Pick<Organization, 'name' | 'slug' | 'logo'>>
): Promise<Organization> {
  try {
    logger.debug('Updating organization using Better-Auth client', {
      id,
      ...data,
    });

    // Use the Better-Auth client instead of direct database queries
    // Use type assertion to ensure compatibility with the Better-Auth client
    const result = await organizationService.update({
      id,
      name: data.name,
      // Better-Auth expects string | undefined, not string | null | undefined
      slug: data.slug as string | undefined,
      logo: data.logo as string | undefined,
    });

    // Validate the response data against the schema
    try {
      // Use a more permissive schema for the API response
      const validatedOrg = organizationSchema.passthrough().parse(result);
      return validatedOrg;
    } catch (validationError) {
      logger.error(
        'Organization validation error:',
        validationError as Record<string, unknown>
      );
      // If validation fails, still return the data but log the error
      // This allows the client to handle the data even if it doesn't match the schema exactly
      return result as unknown as Organization;
    }
  } catch (error) {
    logger.error(
      'Failed to update organization:',
      error as Record<string, unknown>
    );

    // Fallback to direct database query if Better-Auth fails
    // This ensures backward compatibility during the migration period
    logger.warn('Falling back to direct database query for updateOrganization');

    // Use a different variable name to avoid redeclaration
    const [updatedOrg] = await db
      .update(organization)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(organization.id, id))
      .returning();

    return updatedOrg;
  }
}

/**
 * Adds a member to an organization with the specified role.
 *
 * @deprecated Use organizationService.inviteMember from lib/better-auth/organization.ts instead.
 * This function will be removed in a future release.
 *
 * @param data - An object containing the member information
 * @param data.organizationId - The ID of the organization to add the member to
 * @param data.userId - The ID of the user to add as a member
 * @param data.role - The role to assign to the member ('admin', 'member', etc.)
 * @returns A Promise that resolves to the created Member object
 *
 * @example
 * ```typescript
 * // Add a member with 'admin' role
 * const member = await addMemberToOrganization({
 *   organizationId: 'org-123',
 *   userId: 'user-456',
 *   role: 'admin'
 * });
 *
 * // Add a member with 'member' role
 * const member = await addMemberToOrganization({
 *   organizationId: 'org-123',
 *   userId: 'user-789',
 *   role: 'member'
 * });
 * ```
 *
 * @remarks
 * This function attempts to use the Better-Auth client to invite a member to the organization.
 * It first retrieves the user's email from the database, then sends an invitation through Better-Auth.
 * If the Better-Auth client fails, it falls back to direct database queries to ensure
 * backward compatibility during the migration period.
 *
 * Note that Better-Auth uses an invitation system, while the legacy implementation directly
 * adds the member to the organization. The function maintains backward compatibility by
 * creating a member record in the database after sending the invitation.
 */
export async function addMemberToOrganization(data: {
  organizationId: string;
  userId: string;
  role: Member['role'];
}): Promise<Member> {
  try {
    logger.debug('Adding member to organization using Better-Auth client', {
      organizationId: data.organizationId,
      userId: data.userId,
      role: data.role,
    });

    // Get user email from the database
    const userData = await db.query.user.findFirst({
      where: eq(user.id, data.userId),
      columns: {
        email: true,
      },
    });

    if (!userData || !userData.email) {
      throw new Error(`User with ID ${data.userId} not found or has no email`);
    }

    // Map the role to Better-Auth format (uppercase)
    const betterAuthRole = data.role.toUpperCase() as 'ADMIN' | 'MEMBER';

    // Use the Better-Auth client instead of direct database queries
    const invitation = await organizationService.inviteMember({
      organizationId: data.organizationId,
      email: userData.email,
      role: betterAuthRole,
    });

    // Since Better-Auth returns an invitation, we need to create a member record
    // to maintain backward compatibility
    const [newMember] = await db
      .insert(member)
      .values({
        id: nanoid(),
        organizationId: data.organizationId,
        userId: data.userId,
        role: data.role,
        createdAt: new Date(),
      })
      .returning();

    return newMember;
  } catch (error) {
    logger.error(
      'Failed to add member to organization:',
      error as Record<string, unknown>
    );

    // Fallback to direct database query if Better-Auth fails
    // This ensures backward compatibility during the migration period
    logger.warn(
      'Falling back to direct database query for addMemberToOrganization'
    );

    const [newMember] = await db
      .insert(member)
      .values({
        id: nanoid(),
        ...data,
        createdAt: new Date(),
      })
      .returning();

    return newMember;
  }
}

/**
 * Sets the active organization for a user session.
 *
 * @deprecated Use organizationService.setActive from lib/better-auth/organization.ts instead.
 * This function will be removed in a future release.
 *
 * @param data - An object containing the session and organization information
 * @param data.sessionId - The ID of the user's session
 * @param data.organizationId - The ID of the organization to set as active
 * @returns A Promise that resolves when the operation is complete
 *
 * @example
 * ```typescript
 * // Set the active organization for a user session
 * await setActiveOrganization({
 *   sessionId: 'session-123',
 *   organizationId: 'org-456'
 * });
 * ```
 *
 * @remarks
 * This function attempts to use the Better-Auth client to set the active organization.
 * If the Better-Auth client fails, it falls back to direct database queries to ensure
 * backward compatibility during the migration period.
 */
export async function setActiveOrganization(data: {
  sessionId: string;
  organizationId: string;
}): Promise<void> {
  const { sessionId, organizationId } = data;

  try {
    logger.debug('Setting active organization using Better-Auth client', {
      organizationId,
    });

    // Use the Better-Auth client instead of direct database queries
    await organizationService.setActive(organizationId);
  } catch (error) {
    logger.error(
      'Failed to set active organization:',
      error as Record<string, unknown>
    );

    // Fallback to direct database query if Better-Auth fails
    // This ensures backward compatibility during the migration period
    logger.warn(
      'Falling back to direct database query for setActiveOrganization'
    );

    await db
      .update(session)
      .set({
        activeOrganizationId: organizationId,
        updatedAt: new Date(),
      })
      .where(eq(session.id, sessionId));
  }
}

/**
 * @deprecated Use organizationService.create from lib/better-auth/organization.ts instead.
 * This function will be removed in a future release.
 */
export async function createPersonalOrganization(userId: string) {
  return await db.transaction(async (tx) => {
    const [org] = await tx
      .insert(organization)
      .values({
        id: nanoid(),
        name: 'Personal',
        slug: `personal-${userId}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    await tx.insert(member).values({
      id: nanoid(),
      userId,
      organizationId: org.id,
      role: 'owner',
      createdAt: new Date(),
    });

    return org;
  });
}

/**
 * Retrieves the active organization for a user.
 *
 * @deprecated Use organizationService.getActiveMember from lib/better-auth/organization.ts instead.
 * This function will be removed in a future release.
 *
 * @param userId - The ID of the user to get the active organization for
 * @returns A promise that resolves to the active organization member or undefined if not found
 *
 * @example
 * ```typescript
 * // Get the active organization for a user
 * const activeMember = await getActiveOrganization('user-123');
 * if (activeMember) {
 *   console.log(`Active organization: ${activeMember.organization.name}`);
 * }
 * ```
 *
 * @remarks
 * This function is deprecated in favor of using the Better-Auth client.
 * It currently falls back to direct database queries as the Better-Auth client
 * requires an organization ID, which we don't have at this point.
 * In the future, this function will be removed entirely, and all code should
 * use organizationService.getActiveMember directly with the appropriate organization ID.
 */
export async function getActiveOrganization(userId: string) {
  try {
    logger.debug('Getting active organization', { userId });

    // We need to use direct database query here because Better-Auth's getActiveMember
    // requires an organization ID, which we don't have at this point
    return db.query.member.findFirst({
      where: eq(member.userId, userId),
      with: {
        organization: true,
        // TODO: implement workspaces
        // organization: {
        //   with: {
        //     workspaces: true,
        //   },
        // },
      },
    });
  } catch (error) {
    logger.error('Failed to get active organization', {
      userId,
      error: error as Record<string, unknown>,
    });
    handleBetterFetchError(error);
    return undefined;
  }
}

/**
 * Updates an organization's settings.
 *
 * @deprecated Use organizationService.update from lib/better-auth/organization.ts instead.
 * This function will be removed in a future release.
 *
 * @param slug - The slug of the organization to update
 * @param data - The organization settings data to update
 * @returns The updated organization
 *
 * @example
 * ```typescript
 * // Update organization settings
 * const updatedOrg = await updateOrganizationSettings('my-org', {
 *   name: 'My Updated Organization',
 *   slug: 'my-updated-org',
 *   logo: 'https://example.com/logo.png'
 * });
 * ```
 *
 * @remarks
 * This function is deprecated in favor of using the Better-Auth client.
 * It currently uses the Better-Auth client internally but maintains the same
 * interface for backward compatibility. In the future, this function will be
 * removed entirely, and all code should use organizationService.update directly.
 */
export async function updateOrganizationSettings(
  slug: string,
  data: OrganizationSettings
) {
  try {
    logger.debug('Updating organization settings', { slug, data });

    // Validate input
    const validatedData = organizationSettingsSchema.parse(data);
    logger.debug('Validated organization settings data', validatedData);

    // Get organization ID from slug
    const org = await db
      .select()
      .from(organization)
      .where(eq(organization.slug, slug))
      .limit(1);

    if (!org.length) {
      throw new Error(`Organization with slug ${slug} not found`);
    }

    const orgId = org[0].id;

    // Use Better-Auth client to update the organization
    try {
      const result = await organizationService.update({
        id: orgId,
        name: validatedData.name,
        slug: validatedData.slug,
        logo: validatedData.logo || undefined,
      });

      return result;
    } catch (betterAuthError) {
      // Handle Better-Auth errors
      logger.error('Better-Auth error updating organization settings', {
        slug,
        error: betterAuthError as Record<string, unknown>,
      });

      // Fall back to direct database update if Better-Auth fails
      logger.warn('Falling back to direct database update', { slug });

      const updatedOrg = await db
        .update(organization)
        .set({
          name: validatedData.name,
          slug: validatedData.slug,
          logo: validatedData.logo,
          updatedAt: new Date(),
        })
        .where(eq(organization.slug, slug))
        .returning();

      if (!updatedOrg.length) {
        throw new Error(`Organization with slug ${slug} not found`);
      }

      return updatedOrg[0];
    }
  } catch (error) {
    logger.error('Failed to update organization settings', {
      slug,
      error: error as Record<string, unknown>,
    });
    handleBetterFetchError(error);
  }
}
