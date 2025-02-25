// lib/db/queries/users/index.ts
import { eq } from 'drizzle-orm';

import { db } from '@/lib/db';
import { User } from '@/lib/db/_schema';
import { user } from '@/lib/db/schema';

export async function getCurrentUser(
  userId: string
): Promise<User | undefined> {
  return db.query.user.findFirst({
    where: eq(user.id, userId),
    with: {
      organizations: {
        with: {
          organization: true,
        },
      },
    },
  });
}
