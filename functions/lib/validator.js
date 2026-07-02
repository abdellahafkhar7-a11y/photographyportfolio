// ============================================
// Validator Utility — Input validation helpers
// ============================================

const MAX_SLUG_LENGTH = 255;
const MAX_VISITOR_LENGTH = 128;

/**
 * Validates a video slug.
 * @param {*} slug - The video slug to validate
 * @returns {string|null} Trimmed slug if valid, null otherwise
 */
export function validateVideoSlug(slug) {
  if (!slug || typeof slug !== 'string' || slug.length === 0 || slug.length > MAX_SLUG_LENGTH) {
    return null;
  }
  return slug.trim();
}

/**
 * Validates a visitor ID.
 * @param {*} id - The visitor ID to validate
 * @returns {string|null} Trimmed ID if valid, null otherwise
 */
export function validateVisitorId(id) {
  if (!id || typeof id !== 'string' || id.length === 0 || id.length > MAX_VISITOR_LENGTH) {
    return null;
  }
  return id.trim();
}
