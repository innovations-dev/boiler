import { render, screen, waitFor } from '@testing-library/react';
import { nanoid } from 'nanoid';
import { describe, expect, it, vi } from 'vitest';

import {
  getOrganizationAction,
  getUserOrganizationsAction,
} from '@/app/_actions/organizations';
import {
  useOrganization,
  useUserOrganizations,
} from '@/hooks/organizations/use-organization';
import type { ApiErrorCode, ApiResponse } from '@/lib/types/auth/requests';

import { renderWithProviders } from '../../utils/test-utils';

// Mock server actions
vi.mock('@/app/_actions/organizations', () => ({
  getOrganizationAction: vi.fn(),
  getUserOrganizationsAction: vi.fn(),
}));

describe('Organization Hooks', () => {
  describe('useOrganization', () => {
    it('should fetch and return organization data', async () => {
      // Arrange
      const orgId = nanoid();
      const mockOrg = {
        id: orgId,
        name: 'Test Organization',
        userId: nanoid(),
        createdAt: new Date(),
        updatedAt: new Date(),
        slug: null,
        logo: null,
        metadata: null,
      };

      vi.mocked(getOrganizationAction).mockResolvedValueOnce({
        success: true,
        data: mockOrg,
      });

      // Act
      function TestComponent() {
        const { data, isLoading } = useOrganization(orgId);
        if (isLoading) return <div>Loading...</div>;
        return <div>{data?.name}</div>;
      }

      renderWithProviders(<TestComponent />);

      // Assert
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      await waitFor(() => {
        expect(screen.getByText('Test Organization')).toBeInTheDocument();
      });
    });

    it('should handle error state', async () => {
      // Arrange
      const orgId = nanoid();
      const mockOrg = {
        id: orgId,
        name: 'Test Organization',
        userId: nanoid(),
        createdAt: new Date(),
        updatedAt: new Date(),
        slug: null,
        logo: null,
        metadata: null,
      };
      const errorResponse: ApiResponse<
        | {
            id: string;
            name: string;
            slug: string | null;
            logo: string | null;
            createdAt: Date;
            updatedAt: Date;
            metadata: string | null;
          }
        | undefined
      > = {
        success: false,
        data: undefined,
        error: {
          message: 'Organization not found',
          code: 'NOT_FOUND' as ApiErrorCode,
          status: 404,
        },
      };
      vi.mocked(getOrganizationAction).mockResolvedValueOnce(errorResponse);

      // Act
      function TestComponent() {
        const { error, isError } = useOrganization(orgId);
        if (isError) return <div>Error: {error.message}</div>;
        return null;
      }

      renderWithProviders(<TestComponent />);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText('Error: Organization not found')
        ).toBeInTheDocument();
      });
    });
  });

  describe('useUserOrganizations', () => {
    it('should fetch and return user organizations', async () => {
      // Arrange
      const userId = nanoid();
      const mockOrgs = [
        {
          id: nanoid(),
          name: 'Org 1',
          userId,
          createdAt: new Date(),
          updatedAt: new Date(),
          slug: null,
          logo: null,
          metadata: null,
        },
        {
          id: nanoid(),
          name: 'Org 2',
          userId,
          createdAt: new Date(),
          updatedAt: new Date(),
          slug: null,
          logo: null,
          metadata: null,
        },
      ];

      vi.mocked(getUserOrganizationsAction).mockResolvedValueOnce({
        success: true,
        data: mockOrgs,
      });

      // Act
      function TestComponent() {
        const { data, isLoading } = useUserOrganizations(userId);
        if (isLoading) return <div>Loading...</div>;
        return (
          <div>{data?.map((org) => <div key={org.id}>{org.name}</div>)}</div>
        );
      }

      renderWithProviders(<TestComponent />);

      // Assert
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      await waitFor(() => {
        expect(screen.getByText('Org 1')).toBeInTheDocument();
        expect(screen.getByText('Org 2')).toBeInTheDocument();
      });
    });

    it('should handle empty organizations list', async () => {
      // Arrange
      const userId = nanoid();
      vi.mocked(getUserOrganizationsAction).mockResolvedValueOnce({
        success: true,
        data: [],
      });

      // Act
      function TestComponent() {
        const { data, isLoading } = useUserOrganizations(userId);
        if (isLoading) return <div>Loading...</div>;
        if (!data?.length) return <div>No organizations found</div>;
        return null;
      }

      renderWithProviders(<TestComponent />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('No organizations found')).toBeInTheDocument();
      });
    });
  });
});
