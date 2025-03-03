/**
 * Better-Auth API Client
 *
 * This client provides a typed interface for interacting with the Better-Auth API.
 * It handles authentication, error handling, and response parsing.
 */

import { betterFetch } from '@better-fetch/fetch';

import { AppError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { ERROR_CODES } from '@/lib/types/responses/error';
import { getBaseUrl } from '@/lib/utils';

// Error codes
export enum BetterAuthErrorCode {
  UNAUTHORIZED = 'unauthorized',
  FORBIDDEN = 'forbidden',
  NOT_FOUND = 'not_found',
  CONFLICT = 'conflict',
  INTERNAL_SERVER_ERROR = 'internal_server_error',
  BAD_REQUEST = 'bad_request',
}

// Better-Auth error response type
export interface BetterAuthErrorResponse {
  code?: string;
  message?: string;
  status?: number;
  statusText?: string;
}

// Base response type
export interface BetterAuthResponse<T> {
  success: boolean;
  data?: T;
  error?: BetterAuthErrorResponse;
}

/**
 * Better-Auth API client
 */
export class BetterAuthClient {
  private baseUrl: string;

  constructor(baseUrl = getBaseUrl()) {
    this.baseUrl = baseUrl.toString();
  }

  /**
   * Make a request to the Better-Auth API
   */
  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<BetterAuthResponse<T>> {
    try {
      const url = `${this.baseUrl}/api/auth${endpoint}`;

      // Set default headers
      const requestOptions = {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      };

      const response = await betterFetch<T>(url, requestOptions);

      if (response.error) {
        logger.error('Better-Auth API error', {
          endpoint,
          error: response.error,
        });

        // Map HTTP status codes to our error codes
        let errorCode = BetterAuthErrorCode.INTERNAL_SERVER_ERROR;

        if (response.error.status) {
          switch (response.error.status) {
            case 400:
              errorCode = BetterAuthErrorCode.BAD_REQUEST;
              break;
            case 401:
              errorCode = BetterAuthErrorCode.UNAUTHORIZED;
              break;
            case 403:
              errorCode = BetterAuthErrorCode.FORBIDDEN;
              break;
            case 404:
              errorCode = BetterAuthErrorCode.NOT_FOUND;
              break;
            case 409:
              errorCode = BetterAuthErrorCode.CONFLICT;
              break;
            default:
              if (response.error.status >= 500) {
                errorCode = BetterAuthErrorCode.INTERNAL_SERVER_ERROR;
              }
          }
        }

        return {
          success: false,
          error: {
            code: errorCode,
            message: response.error.message || 'An unknown error occurred',
            status: response.error.status,
            statusText: response.error.statusText,
          },
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      logger.error('Better-Auth API request failed', {
        endpoint,
        error,
      });

      return {
        success: false,
        error: {
          code: BetterAuthErrorCode.INTERNAL_SERVER_ERROR,
          message:
            error instanceof Error
              ? error.message
              : 'An unknown error occurred',
        },
      };
    }
  }

  /**
   * Make a GET request to the Better-Auth API
   */
  async get<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<BetterAuthResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'GET',
    });
  }

  /**
   * Make a POST request to the Better-Auth API
   */
  async post<T>(
    endpoint: string,
    data: Record<string, any>,
    options: RequestInit = {}
  ): Promise<BetterAuthResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Make a PUT request to the Better-Auth API
   */
  async put<T>(
    endpoint: string,
    data: Record<string, any>,
    options: RequestInit = {}
  ): Promise<BetterAuthResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Make a DELETE request to the Better-Auth API
   */
  async delete<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<BetterAuthResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'DELETE',
    });
  }
}

// Export a singleton instance
export const betterAuthClient = new BetterAuthClient();

// Helper function to handle errors
export function handleBetterFetchError(error: any): never {
  if (error?.error?.code === BetterAuthErrorCode.UNAUTHORIZED) {
    throw new AppError('You are not authorized to perform this action', {
      code: ERROR_CODES.UNAUTHORIZED,
      status: 401,
    });
  }

  if (error?.error?.code === BetterAuthErrorCode.FORBIDDEN) {
    throw new AppError('You do not have permission to perform this action', {
      code: ERROR_CODES.FORBIDDEN,
      status: 403,
    });
  }

  if (error?.error?.code === BetterAuthErrorCode.NOT_FOUND) {
    throw new AppError('The requested resource was not found', {
      code: ERROR_CODES.NOT_FOUND,
      status: 404,
    });
  }

  // Handle HTTP status codes for more specific error messages
  if (error?.error?.status) {
    switch (error.error.status) {
      case 400:
        throw new AppError('Invalid request data', {
          code: ERROR_CODES.BAD_REQUEST,
          status: 400,
          context: error.error.context,
        });
      case 401:
        throw new AppError('Authentication required', {
          code: ERROR_CODES.UNAUTHORIZED,
          status: 401,
        });
      case 403:
        throw new AppError('Permission denied', {
          code: ERROR_CODES.FORBIDDEN,
          status: 403,
        });
      case 404:
        throw new AppError('Resource not found', {
          code: ERROR_CODES.NOT_FOUND,
          status: 404,
        });
      case 409:
        throw new AppError('Resource conflict', {
          code: ERROR_CODES.CONFLICT,
          status: 409,
        });
      case 429:
        throw new AppError('Too many requests', {
          code: ERROR_CODES.TOO_MANY_REQUESTS,
          status: 429,
        });
    }
  }

  // Default error
  throw new AppError('An unexpected error occurred', {
    code: ERROR_CODES.INTERNAL_SERVER_ERROR,
    status: 500,
  });
}
