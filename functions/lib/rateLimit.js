// ============================================
// Rate Limit Utility — D1-based basic rate limiting
// Prevents spam on POST endpoints
// ============================================

import { basicRateLimitKey } from './security.js';

/**
 * Checks rate limit for a request.
 * Uses D1 to track request counts per key within a time window.
 *
 * @param {object} context - Cloudflare Pages context
 * @param {number} [limit=30] - Max requests per window
 * @param {number} [windowMs=60000] - Window in milliseconds
 * @returns {Promise<{allowed: boolean, remaining: number}>}
 */
export async function rateLimit(context, limit, windowMs) {
  const max = limit || 30;
  const window = windowMs || 60000;
  const windowSec = Math.floor(window / 1000);

  const db = context.env.db;
  if (!db) return { allowed: true, remaining: max };

  const visitorId = context.request.headers.get('X-Visitor-Id');
  const key = basicRateLimitKey(context.request, visitorId || undefined);

  try {
    // Ensure rate_limit table exists
    await db
      .prepare('CREATE TABLE IF NOT EXISTS rate_limit (key TEXT NOT NULL, count INTEGER NOT NULL DEFAULT 1, window_start TEXT NOT NULL DEFAULT (datetime(\'now\')), PRIMARY KEY (key))')
      .run();

    // Try to get existing record
    const existing = await db
      .prepare("SELECT count, window_start FROM rate_limit WHERE key = ?")
      .bind(key)
      .first();

    if (existing) {
      // Check if window has expired
      const expired = await db
        .prepare("SELECT 1 FROM rate_limit WHERE key = ? AND window_start < datetime('now', '-" + windowSec + " seconds')")
        .bind(key)
        .first();

      if (expired) {
        // Reset window
        await db
          .prepare("UPDATE rate_limit SET count = 1, window_start = datetime('now') WHERE key = ?")
          .bind(key)
          .run();
        return { allowed: true, remaining: max - 1 };
      }

      // Within window — check count
      if (existing.count >= max) {
        return { allowed: false, remaining: 0 };
      }

      // Increment count
      await db
        .prepare('UPDATE rate_limit SET count = count + 1 WHERE key = ?')
        .bind(key)
        .run();
      return { allowed: true, remaining: max - existing.count - 1 };
    }

    // No existing record — create one
    await db
      .prepare('INSERT INTO rate_limit (key, count) VALUES (?, 1)')
      .bind(key)
      .run();
    return { allowed: true, remaining: max - 1 };
  } catch {
    // If rate limiting fails, allow the request (fail-open for availability)
    return { allowed: true, remaining: max };
  }
}
