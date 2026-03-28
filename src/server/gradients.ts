import { createServerFn } from '@tanstack/react-start';
import { eq } from 'drizzle-orm';
import { Schema } from 'effect';
import { db } from '../db';
import { gradients } from '../db/schema';
import type { Gradient, ColorStop } from '../utils/gradient';

// ---------- Effect v4 Schemas ----------

const ColorStopSchema = Schema.Struct({
  id: Schema.String,
  color: Schema.String,
  position: Schema.Number,
});

const GradientTypeSchema = Schema.Union([Schema.Literal('linear'), Schema.Literal('radial'), Schema.Literal('conic')]);

const GradientSchema = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  type: GradientTypeSchema,
  angle: Schema.Number,
  stops: Schema.Array(ColorStopSchema),
  createdAt: Schema.Number,
  updatedAt: Schema.Number,
});

const decodeId = Schema.decodeUnknownSync(Schema.String);
const decodeGradient = Schema.decodeUnknownSync(GradientSchema);

// ---------- Helpers ----------

function rowToGradient(row: typeof gradients.$inferSelect): Gradient {
  return {
    id: row.id,
    name: row.name,
    type: row.type as Gradient['type'],
    angle: row.angle,
    stops: JSON.parse(row.stops) as ColorStop[],
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

// ---------- Server Functions ----------

export const loadGradientsFn = createServerFn({ method: 'GET' }).handler(
  async (): Promise<Gradient[]> => {
    const rows = await db.select().from(gradients).orderBy(gradients.createdAt);
    return rows.map(rowToGradient);
  },
);

export const getGradientFn = createServerFn({ method: 'GET' })
  .inputValidator(decodeId)
  .handler(async ({ data: id }): Promise<Gradient | undefined> => {
    const rows = await db.select().from(gradients).where(eq(gradients.id, id));
    return rows[0] ? rowToGradient(rows[0]) : undefined;
  });

export const saveGradientFn = createServerFn({ method: 'POST' })
  .inputValidator(decodeGradient)
  .handler(async ({ data: gradient }): Promise<void> => {
    await db
      .insert(gradients)
      .values({
        id: gradient.id,
        name: gradient.name,
        type: gradient.type,
        angle: gradient.angle,
        stops: JSON.stringify(gradient.stops),
        createdAt: gradient.createdAt,
        updatedAt: gradient.updatedAt,
      })
      .onConflictDoUpdate({
        target: gradients.id,
        set: {
          name: gradient.name,
          type: gradient.type,
          angle: gradient.angle,
          stops: JSON.stringify(gradient.stops),
          updatedAt: gradient.updatedAt,
        },
      });
  });

export const deleteGradientFn = createServerFn({ method: 'POST' })
  .inputValidator(decodeId)
  .handler(async ({ data: id }): Promise<void> => {
    await db.delete(gradients).where(eq(gradients.id, id));
  });
