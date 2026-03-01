const store = new Map<string, { count: number; resetAt: number }>();

const DEFAULT_LIMIT = 100;
const DEFAULT_WINDOW_MS = 60_000;

export function rateLimit(
  key: string,
  { limit = DEFAULT_LIMIT, windowMs = DEFAULT_WINDOW_MS } = {}
): { success: boolean; remaining: number; reset: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return { success: true, remaining: limit - 1, reset: resetAt };
  }

  entry.count++;

  if (entry.count > limit) {
    return { success: false, remaining: 0, reset: entry.resetAt };
  }

  return {
    success: true,
    remaining: limit - entry.count,
    reset: entry.resetAt,
  };
}
