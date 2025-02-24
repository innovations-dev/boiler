import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const user = sqliteTable(
  'user',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
  },
  (table) => ({
    emailIdx: index('user_email_idx').on(table.email),
    nameIdx: index('user_name_idx').on(table.name),
  })
);
