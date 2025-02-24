/**
 * @fileoverview API route error handlers and utilities for consistent error handling across the application.
 * This module provides standardized error handling for API routes, including method-specific handlers
 * and a generic error handler that integrates with the application's centralized error handling system.
 *
 * @module api/error-handlers
 * @see {@link lib/api/error-handler} for the core error handling implementation
 */

import { NextResponse } from 'next/server';

import { handleAPIError } from '@/lib/api/error-handler';

/**
 * Handles errors in API routes with consistent error reporting and response formatting.
 * Extracts route information from the request and delegates to the central error handler.
 *
 * @param {unknown} error - The error that occurred during request processing
 * @param {Request} request - The incoming request object
 * @returns {NextResponse} A formatted error response with appropriate status code and details
 *
 * @example
 * ```typescript
 * export async function GET(request: Request) {
 *   try {
 *     // API logic here
 *   } catch (error) {
 *     return handleRouteError(error, request);
 *   }
 * }
 * ```
 */
export function handleRouteError(error: unknown, request: Request) {
  const path = new URL(request.url).pathname;
  return handleAPIError(error, path, request.method);
}

/**
 * Generates a standard 405 Method Not Allowed response.
 * Used for handling requests to endpoints that don't support specific HTTP methods.
 *
 * @returns {NextResponse} A 405 Method Not Allowed response
 *
 * @example
 * ```typescript
 * // In an API route that only supports GET
 * export const POST = handleMethodNotAllowed;
 * ```
 */
export function handleMethodNotAllowed() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

/**
 * Collection of common API error handlers for different HTTP methods.
 * Provides a consistent way to handle unsupported methods across routes.
 *
 * @property {Function} methodNotAllowed - Generic method not allowed handler
 * @property {Function} GET - Handler for unsupported GET requests
 * @property {Function} POST - Handler for unsupported POST requests
 * @property {Function} PUT - Handler for unsupported PUT requests
 * @property {Function} DELETE - Handler for unsupported DELETE requests
 * @property {Function} PATCH - Handler for unsupported PATCH requests
 *
 * @example
 * ```typescript
 * // In a route that only supports GET
 * export { apiErrors as POST, apiErrors as PUT, apiErrors as DELETE };
 * ```
 */
export const apiErrors = {
  methodNotAllowed: handleMethodNotAllowed,
  GET: handleMethodNotAllowed,
  POST: handleMethodNotAllowed,
  PUT: handleMethodNotAllowed,
  DELETE: handleMethodNotAllowed,
  PATCH: handleMethodNotAllowed,
} as const;
