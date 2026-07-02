import { success, error } from '../lib/response.js';
import { getTotalCount, getTopSlugs } from '../lib/query.js';

// ============================================
// Stats API — GET /api/stats
// Returns global statistics across all tables
// ============================================

export async function onRequest(context) {
  const { request, env } = context;

  // Check D1 binding
  const db = env.db;
  if (!db) {
    return error('Database not configured', 500);
  }

  try {
    // Run count queries in parallel for performance
    const [totalViews, totalLikes, totalShares, topViewed, topLiked] = await Promise.all([
      getTotalCount(db, 'views'),
      getTotalCount(db, 'likes'),
      getTotalCount(db, 'shares'),
      getTopSlugs(db, 'views', 1),
      getTopSlugs(db, 'likes', 1)
    ]);

    return success({
      totals: {
        videos: null,
        views: totalViews,
        likes: totalLikes,
        shares: totalShares
      },
      most_viewed: topViewed[0] || null,
      most_liked: topLiked[0] || null,
      latest_upload: null
    });
  } catch {
    return error('Database error', 500);
  }
}
