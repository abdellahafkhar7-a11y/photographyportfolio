import { success, error } from '../../lib/response.js';
import { getVideoBySlug } from '../../lib/videoCatalog.js';
import { getCountBySlug } from '../../lib/query.js';

// ============================================
// Video Detail API — GET /api/video/:slug
// Returns information for a single video by slug
// ============================================

export async function onRequest(context) {
  const { request, params, env } = context;

  const slug = params.slug;
  if (!slug) {
    return error('Video slug is required', 400);
  }

  try {
    const video = await getVideoBySlug(request, slug);

    if (!video) {
      return error('Video not found', 404);
    }

    // Fetch engagement stats if D1 is available
    let stats = { views: 0, likes: 0, shares: 0 };
    const db = env.db;
    if (db) {
      const [views, likes, shares] = await Promise.all([
        getCountBySlug(db, 'views', video.slug),
        getCountBySlug(db, 'likes', video.slug),
        getCountBySlug(db, 'shares', video.slug)
      ]);
      stats = { views: views, likes: likes, shares: shares };
    }

    return success({
      video: video,
      stats: stats
    });
  } catch {
    return error('Failed to load video', 500);
  }
}
