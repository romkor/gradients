import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import * as auth from './auth';

const sqlite = new Database('./gradients.db');

export const db = drizzle(sqlite, { schema: { ...schema, ...auth } });
