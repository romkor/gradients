import Database from 'better-sqlite3';
import { betterAuth } from 'better-auth';
import { tanstackStartCookies } from 'better-auth/tanstack-start';

export const auth = betterAuth({
  database: new Database('./gradients.db'),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [tanstackStartCookies()],
});
