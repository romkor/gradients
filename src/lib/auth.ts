import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { tanstackStartCookies } from 'better-auth/tanstack-start';
import { v7 } from 'uuid';
import { db } from '#/db/index';
import * as schema from '#/db/schema';

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'sqlite', schema }),
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
