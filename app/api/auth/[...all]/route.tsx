/**
 * Better-Auth route handler
 * Handles all authentication-related requests
 * @module app/api/auth/[...all]
 */

import { auth } from '@/lib/auth';

/**
 * Dynamic route handler for all Better-Auth requests
 * This includes login, logout, session management, etc.
 */
export const GET = auth.handler;
export const POST = auth.handler;
export const PUT = auth.handler;
export const PATCH = auth.handler;
export const DELETE = auth.handler;
