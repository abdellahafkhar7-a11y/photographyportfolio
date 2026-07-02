// ============================================
// Visitor Utility (server-side) — Extracts visitor_id from requests
// ============================================

import { validateVisitorId } from './validator.js';

const VISITOR_HEADER = 'X-Visitor-Id';

/**
 * Extracts and validates the visitor_id from the request header.
 * @param {Request} request
 * @returns {string|null} Valid visitor ID, or null if missing/invalid
 */
export function getVisitorId(request) {
  const raw = request.headers.get(VISITOR_HEADER);
  return validateVisitorId(raw);
}
