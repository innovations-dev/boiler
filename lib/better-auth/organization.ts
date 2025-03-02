/**
 * Better-Auth Organization Service
 *
 * This service provides typed methods for interacting with Better-Auth organization endpoints.
 * It handles authentication, error handling, and response parsing.
 */

import { betterAuthClient, handleBetterFetchError } from './client';

// Organization types
export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationMember {
  id: string;
  userId: string;
  organizationId: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name?: string;
    email?: string;
    image?: string;
  };
}

export interface OrganizationWithMembers extends Organization {
  members: OrganizationMember[];
}

export interface OrganizationInvitation {
  id: string;
  email: string;
  organizationId: string;
  role: 'ADMIN' | 'MEMBER';
  token: string;
  expires: string;
  createdAt: string;
  updatedAt: string;
  organization?: Organization;
}

// Organization service
export const organizationService = {
  /**
   * Create a new organization
   */
  async create(data: {
    name: string;
    slug?: string;
    logo?: string;
    metadata?: Record<string, any>;
  }): Promise<Organization> {
    const response = await betterAuthClient.post<Organization>(
      '/organization/create',
      data
    );

    if (!response.success) {
      handleBetterFetchError(response);
    }

    return response.data!;
  },

  /**
   * Update an organization
   */
  async update(data: {
    id: string;
    name?: string;
    slug?: string;
    logo?: string;
    metadata?: Record<string, any>;
  }): Promise<Organization> {
    const response = await betterAuthClient.post<Organization>(
      '/organization/update',
      data
    );

    if (!response.success) {
      handleBetterFetchError(response);
    }

    return response.data!;
  },

  /**
   * Delete an organization
   */
  async delete(id: string): Promise<void> {
    const response = await betterAuthClient.post<void>('/organization/delete', {
      id,
    });

    if (!response.success) {
      handleBetterFetchError(response);
    }
  },

  /**
   * Set active organization
   */
  async setActive(id: string): Promise<void> {
    const response = await betterAuthClient.post<void>(
      '/organization/set-active',
      { id }
    );

    if (!response.success) {
      handleBetterFetchError(response);
    }
  },

  /**
   * Get full organization details
   */
  async getFullOrganization(slug: string): Promise<OrganizationWithMembers> {
    const response = await betterAuthClient.get<OrganizationWithMembers>(
      `/organization/get-full-organization?slug=${encodeURIComponent(slug)}`
    );

    if (!response.success) {
      handleBetterFetchError(response);
    }

    return response.data!;
  },

  /**
   * List all organizations for the current user
   */
  async list(): Promise<Organization[]> {
    const response =
      await betterAuthClient.get<Organization[]>('/organization/list');

    if (!response.success) {
      handleBetterFetchError(response);
    }

    return response.data || [];
  },

  /**
   * Invite a member to an organization
   */
  async inviteMember(data: {
    organizationId: string;
    email: string;
    role: 'ADMIN' | 'MEMBER';
  }): Promise<OrganizationInvitation> {
    const response = await betterAuthClient.post<OrganizationInvitation>(
      '/organization/invite-member',
      data
    );

    if (!response.success) {
      handleBetterFetchError(response);
    }

    return response.data!;
  },

  /**
   * Cancel an invitation
   */
  async cancelInvitation(id: string): Promise<void> {
    const response = await betterAuthClient.post<void>(
      '/organization/cancel-invitation',
      { id }
    );

    if (!response.success) {
      handleBetterFetchError(response);
    }
  },

  /**
   * Accept an invitation
   */
  async acceptInvitation(token: string): Promise<void> {
    const response = await betterAuthClient.post<void>(
      '/organization/accept-invitation',
      { token }
    );

    if (!response.success) {
      handleBetterFetchError(response);
    }
  },

  /**
   * Get invitation details
   */
  async getInvitation(token: string): Promise<OrganizationInvitation> {
    const response = await betterAuthClient.get<OrganizationInvitation>(
      `/organization/get-invitation?token=${encodeURIComponent(token)}`
    );

    if (!response.success) {
      handleBetterFetchError(response);
    }

    return response.data!;
  },

  /**
   * Reject an invitation
   */
  async rejectInvitation(token: string): Promise<void> {
    const response = await betterAuthClient.post<void>(
      '/organization/reject-invitation',
      { token }
    );

    if (!response.success) {
      handleBetterFetchError(response);
    }
  },

  /**
   * Check if a slug is available
   */
  async checkSlug(slug: string): Promise<boolean> {
    const response = await betterAuthClient.post<{ available: boolean }>(
      '/organization/check-slug',
      { slug }
    );

    if (!response.success) {
      handleBetterFetchError(response);
    }

    return response.data!.available;
  },

  /**
   * Remove a member from an organization
   */
  async removeMember(data: {
    organizationId: string;
    userId: string;
  }): Promise<void> {
    const response = await betterAuthClient.post<void>(
      '/organization/remove-member',
      data
    );

    if (!response.success) {
      handleBetterFetchError(response);
    }
  },

  /**
   * Update a member's role
   */
  async updateMemberRole(data: {
    organizationId: string;
    userId: string;
    role: 'ADMIN' | 'MEMBER';
  }): Promise<void> {
    const response = await betterAuthClient.post<void>(
      '/organization/update-member-role',
      data
    );

    if (!response.success) {
      handleBetterFetchError(response);
    }
  },

  /**
   * Get active member details
   */
  async getActiveMember(organizationId: string): Promise<OrganizationMember> {
    const response = await betterAuthClient.get<OrganizationMember>(
      `/organization/get-active-member?organizationId=${encodeURIComponent(
        organizationId
      )}`
    );

    if (!response.success) {
      handleBetterFetchError(response);
    }

    return response.data!;
  },

  /**
   * Leave an organization
   */
  async leave(organizationId: string): Promise<void> {
    const response = await betterAuthClient.post<void>('/organization/leave', {
      organizationId,
    });

    if (!response.success) {
      handleBetterFetchError(response);
    }
  },

  /**
   * Check if a user has a specific permission
   */
  async hasPermission(data: {
    organizationId: string;
    permission: string;
  }): Promise<boolean> {
    const response = await betterAuthClient.post<{ hasPermission: boolean }>(
      '/organization/has-permission',
      data
    );

    if (!response.success) {
      handleBetterFetchError(response);
    }

    return response.data!.hasPermission;
  },
};
