import { render, screen, waitFor } from '@testing-library/react';
import { nanoid } from 'nanoid';
import { describe, expect, it, vi } from 'vitest';

import { organizationService } from '@/lib/better-auth/organization';
import {
  useOrganization,
  useOrganizations,
} from '@/lib/hooks/organizations/use-better-auth-organization';
import type { Response } from '@/lib/types/responses/base';
import type { ErrorCode } from '@/lib/types/responses/error';

import { renderWithProviders } from '../../utils/test-utils';

// Mock organization service
vi.mock('@/lib/better-auth/organization', () => ({
  organizationService: {
    getFullOrganization: vi.fn(),
    list: vi.fn(),
  },
}));

describe('Organization Hooks', () => {
  describe('useOrganization', () => {
    it('should fetch and return organization data', async () => {
      // Arrange
      const slug = 'test-org';
      const mockOrg = {
        id: nanoid(),
        name: 'Test Organization',
        slug,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        logo: undefined,
        metadata: {},
        members: [],
      };

      vi.mocked(organizationService.getFullOrganization).mockResolvedValueOnce(
        mockOrg
      );

      // Act
      function TestComponent() {
        const { data, isLoading } = useOrganization(slug);
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
      const slug = 'test-org';

      vi.mocked(organizationService.getFullOrganization).mockRejectedValueOnce(
        new Error('Organization not found')
      );

      // Act
      function TestComponent() {
        const { error, isError } = useOrganization(slug);
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

  describe('useOrganizations', () => {
    it('should fetch and return user organizations', async () => {
      // Arrange
      const mockOrgs = [
        {
          id: nanoid(),
          name: 'Org 1',
          slug: 'org-1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          logo: undefined,
          metadata: {},
        },
        {
          id: nanoid(),
          name: 'Org 2',
          slug: 'org-2',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          logo: undefined,
          metadata: {},
        },
      ];

      vi.mocked(organizationService.list).mockResolvedValueOnce(mockOrgs);

      // Act
      function TestComponent() {
        const { data, isLoading } = useOrganizations();
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
      vi.mocked(organizationService.list).mockResolvedValueOnce([]);

      // Act
      function TestComponent() {
        const { data, isLoading } = useOrganizations();
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
