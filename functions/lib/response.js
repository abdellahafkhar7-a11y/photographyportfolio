// ============================================
// Response Utility — Shared JSON response helpers
// ============================================

const HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-cache'
};

/**
 * Returns a JSON success response.
 * @param {*} data - Data to include in the response body
 * @param {number} [status=200] - HTTP status code
 * @returns {Response}
 */
export function success(data, status) {
  return new Response(
    JSON.stringify({ success: true, ...data }),
    { status: status || 200, headers: HEADERS }
  );
}

/**
 * Returns a JSON error response.
 * @param {string} message - Error message
 * @param {number} [status=400] - HTTP status code
 * @returns {Response}
 */
export function error(message, status) {
  return new Response(
    JSON.stringify({ success: false, error: message }),
    { status: status || 400, headers: HEADERS }
  );
}
