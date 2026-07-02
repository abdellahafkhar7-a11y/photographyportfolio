import { success, error } from '../lib/response.js';
import { validateVideoSlug } from '../lib/validator.js';
import { getVisitorId } from '../lib/visitor.js';
import { checkOrigin } from '../lib/security.js';
import { rateLimit } from '../lib/rateLimit.js';
import { getCountBySlug } from '../lib/query.js';

// ============================================
// Likes API — POST /api/like
// Toggles like/unlike for a video per visitor
// ============================================

export async function onRequestPost(context) {
  const { request, env } = context;

  // Security: check origin
  if (!checkOrigin(request)) {
    return error('Forbidden', 403);
  }

  // Rate limiting
  const rl = await rateLimit(context, 30, 60000);
  if (!rl.allowed) {
    return error('Rate limit exceeded', 429);
  }

  // Check D1 binding
  const db = env.db;
  if (!db) {
    return error('Database not configured', 500);
  }

  // Parse JSON body
  let body;
  try {
    body = await request.json();
  } catch {
    return error('Invalid JSON body', 400);
  }

  // Validate inputs
  const videoSlug = validateVideoSlug(body.video_slug);
  const visitorId = getVisitorId(request);

  if (!videoSlug || !visitorId) {
    return error('Invalid video_slug or visitor_id', 400);
  }

  try {
    // Check if visitor already liked this video
    const existing = await db
      .prepare('SELECT id FROM likes WHERE video_slug = ? AND visitor_id = ? LIMIT 1')
      .bind(videoSlug, visitorId)
      .first();

    if (existing) {
      // Unlike — remove the like
      await db
        .prepare('DELETE FROM likes WHERE id = ?')
        .bind(existing.id)
        .run();
    } else {
      // Like — insert new like
      await db
        .prepare('INSERT INTO likes (video_slug, visitor_id) VALUES (?, ?)')
        .bind(videoSlug, visitorId)
        .run();
    }

    const totalLikes = await getCountBySlug(db, 'likes', videoSlug);

    return success({
      liked: !existing,
      likes: totalLikes
    });
  } catch {
    return error('Database error', 500);
  }
}

// Reject non-POST methods
export async function onRequest() {
  return error('Method not allowed', 405);
}
