import "server-only";
import pg from "pg";
import { env } from "./env";

// Return timestamps as ISO strings and bigint counts as numbers.
pg.types.setTypeParser(1184, (v) => new Date(v.replace(" ", "T").replace(/([+-]\d\d)$/, "$1:00")).toISOString());
pg.types.setTypeParser(20, (v) => Number(v));
pg.types.setTypeParser(1700, (v) => Number(v));

const g = globalThis as unknown as { __djcPool?: pg.Pool };

export function pool(): pg.Pool {
  if (!env.databaseUrl) throw new DbNotConfigured();
  if (!g.__djcPool) {
    g.__djcPool = new pg.Pool({
      connectionString: env.databaseUrl,
      max: 10,
      ssl: /localhost|127\.0\.0\.1/.test(env.databaseUrl) ? undefined : { rejectUnauthorized: false },
    });
  }
  return g.__djcPool;
}

export class DbNotConfigured extends Error {
  constructor() {
    super("DATABASE_URL is not configured");
  }
}

export async function q<T = Record<string, unknown>>(text: string, params: unknown[] = []): Promise<T[]> {
  const r = await pool().query(text, params);
  return r.rows as T[];
}

export async function q1<T = Record<string, unknown>>(text: string, params: unknown[] = []): Promise<T | null> {
  const rows = await q<T>(text, params);
  return rows[0] ?? null;
}

export type Tx = pg.PoolClient;

export async function tx<T>(fn: (c: Tx) => Promise<T>): Promise<T> {
  const c = await pool().connect();
  try {
    await c.query("begin");
    const out = await fn(c);
    await c.query("commit");
    return out;
  } catch (e) {
    await c.query("rollback").catch(() => {});
    throw e;
  } finally {
    c.release();
  }
}

export function isPgError(e: unknown, code: string): boolean {
  return typeof e === "object" && e !== null && (e as { code?: string }).code === code;
}
