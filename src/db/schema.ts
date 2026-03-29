import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const gradients = sqliteTable('gradients', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(),
  angle: integer('angle').notNull(),
  stops: text('stops').notNull(), // JSON-serialized ColorStop[]
  ownerId: text('owner_id'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const publishedGradients = sqliteTable('published_gradients', {
  gradientId: text('gradient_id')
    .primaryKey()
    .references(() => gradients.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at').notNull(),
});
