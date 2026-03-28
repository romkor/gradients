import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const gradients = sqliteTable('gradients', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(),
  angle: integer('angle').notNull(),
  stops: text('stops').notNull(), // JSON-serialized ColorStop[]
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});
