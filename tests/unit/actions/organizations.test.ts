import { nanoid } from 'nanoid';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createOrganizationAction,
  getUserOrganizationsAction,
} from '@/app/_actions/organizations';
import { createAction } from '@/lib/actions/create-action';
import type { ApiErrorCode, ApiResponse } from '@/lib/types/auth/requests';

// Mock createAction utility
vi.mock('@/lib/actions/create-action', () => ({
  createAction: vi.fn(),
}));

describe('Organization Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createOrganizationAction', () => {
    it('should create an organization with valid input', async () => {
      // Arrange
      const input = {
        name: 'Test Organization',
        userId: nanoid(),
      };
      const mockOrg = {
        id: nanoid(),
        ...input,
        createdAt: new Date(),
        updatedAt: new Date(),
        slug: null,
        logo: null,
        metadata: null,
      };
      vi.mocked(createAction).mockResolvedValueOnce({
        success: true,
        data: mockOrg,
      });

      // Act
      const result = await createOrganizationAction(input);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockOrg);
      expect(createAction).toHaveBeenCalledWith(
        expect.objectContaining({
          input,
          context: 'createOrganization',
        })
      );
    });

    it('should fail with invalid input', async () => {
      // Arrange
      const input = {
        name: '', // Invalid: empty name
        userId: nanoid(),
      };
      const errorResponse: ApiResponse<unknown> = {
        success: false,
        data: null,
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR' as ApiErrorCode,
          status: 400,
        },
      };
      vi.mocked(createAction).mockResolvedValueOnce(errorResponse);

      // Act
      const result = await createOrganizationAction(input);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      if (result.error) {
        expect(result.error.code).toBe('VALIDATION_ERROR');
      }
    });
  });

  describe('getUserOrganizationsAction', () => {
    it('should return user organizations', async () => {
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
      vi.mocked(createAction).mockResolvedValueOnce({
        success: true,
        data: mockOrgs,
      });

      // Act
      const result = await getUserOrganizationsAction(userId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockOrgs);
      expect(createAction).toHaveBeenCalledWith(
        expect.objectContaining({
          input: userId,
          context: 'getUserOrganizations',
        })
      );
    });

    it('should handle no organizations found', async () => {
      // Arrange
      const userId = nanoid();
      vi.mocked(createAction).mockResolvedValueOnce({
        success: true,
        data: [],
      });

      // Act
      const result = await getUserOrganizationsAction(userId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });
  });
});
