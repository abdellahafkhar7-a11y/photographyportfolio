import { success, error } from '../lib/response.js';
import { getAllVideos, getVideosByCategory } from '../lib/videoCatalog.js';

// ============================================
// Videos API — GET /api/videos
// Returns all videos compatible with the TXT system
// Supports ?category=ugc for filtering
// ============================================

export async function onRequest(context) {
  const { request } = context;

  try {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');

    let videos;

    if (category) {
      videos = await getVideosByCategory(request, category);
    } else {
      videos = await getAllVideos(request);
    }

    return success({
      total: videos.length,
      videos: videos
    });
  } catch {
    return error('Failed to load videos', 500);
  }
}
