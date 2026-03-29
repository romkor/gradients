import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { tanstackStartCookies } from 'better-auth/tanstack-start';
import { v7 } from 'uuid';
import { db } from '#/db/index';
import * as schema from '#/db/schema';
import * as authSchema from '#/db/auth';

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'sqlite', schema: { ...schema, ...authSchema }, usePlural: true }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [tanstackStartCookies()],
  advanced: {
    database: {
      generateId: () => v7(),
    },
  },
});
