import { createServerFn } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { eq, desc, or, isNotNull } from 'drizzle-orm';
import { Schema } from 'effect';
import { queryOptions } from '@tanstack/react-query';
import { auth } from '../lib/auth';
import { db } from '../db';
import { gradients, publishedGradients } from '../db/schema';
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

// ---------- Server Functions ----------

export const loadGradientsFn = createServerFn({ method: 'GET' }).handler(
  async (): Promise<(Gradient & { isPublished: boolean })[]> => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });
    const userId = session?.user?.id ?? null;

    const rows = await db
      .select({
        id: gradients.id,
        name: gradients.name,
        type: gradients.type,
        angle: gradients.angle,
        stops: gradients.stops,
        ownerId: gradients.ownerId,
        createdAt: gradients.createdAt,
        updatedAt: gradients.updatedAt,
        publishedAt: publishedGradients.createdAt,
      })
      .from(gradients)
      .leftJoin(publishedGradients, eq(gradients.id, publishedGradients.gradientId))
      .where(
        userId
          ? or(isNotNull(publishedGradients.gradientId), eq(gradients.ownerId, userId))
          : isNotNull(publishedGradients.gradientId),
      )
      .orderBy(desc(gradients.createdAt));

    return rows.map(row => ({
      id: row.id,
      name: row.name,
      type: row.type as Gradient['type'],
      angle: row.angle,
      stops: JSON.parse(row.stops) as ColorStop[],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      isPublished: row.publishedAt !== null,
    }));
  },
);

export const getGradientFn = createServerFn({ method: 'GET' })
  .inputValidator(decodeId)
  .handler(async ({ data: id }): Promise<(Gradient & { isPublished: boolean }) | undefined> => {
    const rows = await db
      .select({
        id: gradients.id,
        name: gradients.name,
        type: gradients.type,
        angle: gradients.angle,
        stops: gradients.stops,
        ownerId: gradients.ownerId,
        createdAt: gradients.createdAt,
        updatedAt: gradients.updatedAt,
        publishedAt: publishedGradients.createdAt,
      })
      .from(gradients)
      .leftJoin(publishedGradients, eq(gradients.id, publishedGradients.gradientId))
      .where(eq(gradients.id, id));

    const row = rows[0];
    if (!row) return undefined;

    const isPublished = row.publishedAt !== null;

    if (!isPublished) {
      const headers = getRequestHeaders();
      const session = await auth.api.getSession({ headers });
      const userId = session?.user?.id ?? null;
      if (userId !== row.ownerId) {
        throw new Error('Not found');
      }
    }

    return {
      id: row.id,
      name: row.name,
      type: row.type as Gradient['type'],
      angle: row.angle,
      stops: JSON.parse(row.stops) as ColorStop[],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      isPublished,
    };
  });

export const publishGradientFn = createServerFn({ method: 'POST' })
  .inputValidator(decodeId)
  .handler(async ({ data: gradientId }): Promise<void> => {
    await db
      .insert(publishedGradients)
      .values({ gradientId, createdAt: Date.now() })
      .onConflictDoNothing();
  });

export const unpublishGradientFn = createServerFn({ method: 'POST' })
  .inputValidator(decodeId)
  .handler(async ({ data: gradientId }): Promise<void> => {
    await db.delete(publishedGradients).where(eq(publishedGradients.gradientId, gradientId));
  });

export const saveGradientFn = createServerFn({ method: 'POST' })
  .inputValidator(decodeGradient)
  .handler(async ({ data: gradient }): Promise<void> => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });
    const ownerId = session?.user?.id ?? null;

    await db
      .insert(gradients)
      .values({
        id: gradient.id,
        name: gradient.name,
        type: gradient.type,
        angle: gradient.angle,
        stops: JSON.stringify(gradient.stops),
        ownerId,
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

// ---------- Query Options ----------

export const gradientsQueryOptions = () =>
  queryOptions({
    queryKey: ['gradients'],
    queryFn: () => loadGradientsFn(),
  });

export const gradientQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ['gradient', id],
    queryFn: () => getGradientFn({ data: id }),
  });
