// ============================================
// Query Utility — Shared D1 query helpers
// Reduces duplicate COUNT queries across endpoints
// ============================================

/**
 * Returns total row count for a table.
 * @param {D1Database} db
 * @param {string} table - 'views' | 'likes' | 'shares'
 * @returns {Promise<number>}
 */
export async function getTotalCount(db, table) {
  const result = await db.prepare('SELECT COUNT(*) as total FROM ' + table).first();
  return result ? result.total : 0;
}

/**
 * Returns row count for a specific video_slug in a table.
 * @param {D1Database} db
 * @param {string} table - 'views' | 'likes' | 'shares'
 * @param {string} slug
 * @returns {Promise<number>}
 */
export async function getCountBySlug(db, table, slug) {
  const result = await db
    .prepare('SELECT COUNT(*) as total FROM ' + table + ' WHERE video_slug = ?')
    .bind(slug)
    .first();
  return result ? result.total : 0;
}

/**
 * Returns row count for today in a table.
 * @param {D1Database} db
 * @param {string} table - 'views' | 'likes' | 'shares'
 * @param {string} dateColumn - 'viewed_at' | 'created_at' | 'shared_at'
 * @returns {Promise<number>}
 */
export async function getTodayCount(db, table, dateColumn) {
  const result = await db
    .prepare("SELECT COUNT(*) as total FROM " + table + " WHERE date(" + dateColumn + ") = date('now')")
    .first();
  return result ? result.total : 0;
}

/**
 * Returns top N video slugs by count from a table.
 * @param {D1Database} db
 * @param {string} table - 'views' | 'likes' | 'shares'
 * @param {number} [limit=10]
 * @returns {Promise<Array<{video_slug: string, count: number}>>}
 */
export async function getTopSlugs(db, table, limit) {
  const results = await db
    .prepare("SELECT video_slug, COUNT(*) as count FROM " + table + " GROUP BY video_slug ORDER BY count DESC LIMIT ?")
    .bind(limit || 10)
    .all();
  return results.results || [];
}
