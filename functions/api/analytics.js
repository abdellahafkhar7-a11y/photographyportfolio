import { success, error } from '../lib/response.js';
import { getTodayCount, getTopSlugs } from '../lib/query.js';

// ============================================
// Analytics API — GET /api/analytics
// Returns today's metrics and top content
// ============================================

export async function onRequest(context) {
  const { request, env } = context;

  // Check D1 binding
  const db = env.db;
  if (!db) {
    return error('Database not configured', 500);
  }

  try {
    // Parallel queries for today's counts
    const [todayViews, todayLikes, todayShares, topVideos, topLiked] = await Promise.all([
      getTodayCount(db, 'views', 'viewed_at'),
      getTodayCount(db, 'likes', 'created_at'),
      getTodayCount(db, 'shares', 'shared_at'),
      getTopSlugs(db, 'views', 10),
      getTopSlugs(db, 'likes', 10)
    ]);

    // Derive top categories from video slug prefixes (e.g. "ugc-1" → "ugc")
    var categoryMap = {};
    topVideos.forEach(function (item) {
      var prefix = item.video_slug.split('-')[0];
      if (prefix) {
        categoryMap[prefix] = (categoryMap[prefix] || 0) + item.count;
      }
    });
    var topCategories = Object.keys(categoryMap)
      .map(function (key) { return { category: key, count: categoryMap[key] }; })
      .sort(function (a, b) { return b.count - a.count; })
      .slice(0, 5);

    // Extract country/device from Cloudflare request metadata if available
    var cf = request.cf || {};
    var country = cf.countries && cf.countries[0] ? cf.countries[0] : null;
    var device = null;
    var ua = request.headers.get('User-Agent') || '';
    if (/mobile/i.test(ua)) device = 'mobile';
    else if (/tablet/i.test(ua)) device = 'tablet';
    else if (ua) device = 'desktop';

    return success({
      today: {
        views: todayViews,
        likes: todayLikes,
        shares: todayShares
      },
      top_videos: topVideos,
      top_liked: topLiked,
      top_categories: topCategories,
      visitor: {
        country: country,
        device: device
      }
    });
  } catch {
    return error('Database error', 500);
  }
}
