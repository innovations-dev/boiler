/**
 * Organization Extensions Context Type
 *
 * This file defines the context type used by the organization extensions handlers.
 * It provides a type-safe interface for the Better Auth context object.
 *
 * @fileoverview
 * The BetterAuthContext type represents the context object passed to Better Auth handlers.
 * It includes methods for authentication, response handling, logging, and database access.
 * This type is used throughout the organization extensions plugin to ensure type safety.
 */

/**
 * Better Auth Context
 *
 * This type represents the context object passed to Better Auth handlers.
 * It includes all the properties and methods needed for handling requests.
 *
 * @example
 * ```typescript
 * async function myHandler(ctx: BetterAuthContext) {
 *   // Access request parameters
 *   const { id } = ctx.params;
 *
 *   // Check authentication
 *   if (!ctx.auth.userId) {
 *     return ctx.unauthorized();
 *   }
 *
 *   // Access database
 *   const result = await ctx.db.query(...);
 *
 *   // Return response
 *   return ctx.json({ success: true, data: result });
 * }
 * ```
 */
export interface BetterAuthContext {
  /** Request parameters from the URL path */
  params: Record<string, string>;

  /** Authentication information */
  auth: {
    /** The ID of the authenticated user */
    userId: string;
    /** The ID of the organization the user is accessing */
    organizationId?: string;
  };

  /** Request body data */
  body: any;

  /** Query parameters from the URL */
  query: Record<string, string>;

  /** The original request object */
  req: Request;

  /** Method to fetch data from other endpoints */
  fetch: (url: string, options?: RequestInit) => Promise<Response>;

  /** Return an unauthorized response */
  unauthorized: () => Response;

  /** Return a bad request response */
  badRequest: (message?: string) => Response;

  /** Return an internal server error response */
  internalServerError: (message?: string) => Response;

  /** Return a not found response */
  notFound: (message?: string) => Response;

  /** Logging utilities */
  logger: {
    /** Log an error message */
    error: (message: string, error?: any) => void;
    /** Log an informational message */
    info: (message: string, data?: any) => void;
    /** Log a warning message */
    warn: (message: string, data?: any) => void;
  };

  /** Session information */
  session: {
    /** The ID of the authenticated user */
    userId: string;
    /** User information */
    user: {
      /** The ID of the user */
      id: string;
    };
  };

  /** Database access */
  db: any;

  /** Return a JSON response */
  json: <T>(data: T, init?: ResponseInit) => Response;
}
