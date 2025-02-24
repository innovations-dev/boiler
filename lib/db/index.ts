/**
 * Database configuration and client setup for Turso with Drizzle ORM
 * @module lib/db
 */

// use @libsql/client/web if you want to run a local db server in dev
// must also add script: "db:dev": "turso dev --db-file <file_path>.db",
// import { createClient } from '@libsql/client/web';

// use if you want to read from local file in dev - no script required
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';

import { env } from '@/env';

import * as schema from './schema';

/**
 * Turso database client instance
 * @private
 * @const {import("@libsql/client").Client}
 */
const turso = createClient({
  url: env.TURSO_DATABASE_URL!,
  authToken: env.TURSO_AUTH_TOKEN, // only required for production db
});

/**
 * Configured Drizzle ORM instance with Turso client
 * @const {import("drizzle-orm/libsql").LibSQLDatabase}
 *
 * Can be used as a singleton instance on the server.
 * - Use in Server Components
 * - Use in API Routes
 * - Use in Middleware
 *
 * @example
 * // Query all users
 * const users = await db.query.users.findMany();
 *
 * @example
 * // Insert a new record
 * const newUser = await db.insert(schema.users).values({
 *   name: "John Doe",
 *   email: "john@example.com"
 * });
 *
 */
export const db = drizzle(turso, { schema });
