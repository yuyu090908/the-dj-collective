import "server-only";

// Fixed-window limiter. In-memory = per server instance. For multi-instance
// production, replace with a shared store (e.g. Upstash Redis). See README.
const g = globalThis as unknown as { __rl?: Map<string, { n: number; reset: number }> };
const buckets = (g.__rl ??= new Map());

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.reset < now) {
    buckets.set(key, { n: 1, reset: now + windowMs });
    return true;
  }
  b.n += 1;
  return b.n <= limit;
}
