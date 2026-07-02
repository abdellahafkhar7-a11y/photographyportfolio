import { success, error } from '../lib/response.js';
import { validateVideoSlug } from '../lib/validator.js';
import { getVisitorId } from '../lib/visitor.js';
import { checkOrigin } from '../lib/security.js';
import { rateLimit } from '../lib/rateLimit.js';
import { getCountBySlug } from '../lib/query.js';

// ============================================
// Views API — POST /api/view
// Tracks video views with 60-minute deduplication per visitor
// ============================================

const DEDUP_MINUTES = 60;

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
    // Check if this visitor already viewed this video within the dedup window
    const recent = await db
      .prepare("SELECT id FROM views WHERE video_slug = ? AND visitor_id = ? AND viewed_at > datetime('now', '-" + DEDUP_MINUTES + " minutes') LIMIT 1")
      .bind(videoSlug, visitorId)
      .first();

    if (!recent) {
      await db
        .prepare('INSERT INTO views (video_slug, visitor_id) VALUES (?, ?)')
        .bind(videoSlug, visitorId)
        .run();
    }

    const totalViews = await getCountBySlug(db, 'views', videoSlug);

    return success({ views: totalViews });
  } catch {
    return error('Database error', 500);
  }
}

// Reject non-POST methods
export async function onRequest() {
  return error('Method not allowed', 405);
}
