// ============================================
// Security Utility — Origin validation, IP extraction, rate limiting
// ============================================

/**
 * Checks if the request origin is allowed.
 * In production, this validates against the deployed domain.
 * @param {Request} request
 * @returns {boolean}
 */
export function checkOrigin(request) {
  const origin = request.headers.get('Origin');
  const referer = request.headers.get('Referer');

  // Allow requests with no origin (same-origin, curl, etc.)
  if (!origin && !referer) return true;

  // Allow localhost for development
  if (origin && (origin === 'http://localhost:8788' || origin.startsWith('http://localhost:'))) {
    return true;
  }

  // Allow the production domain
  const allowed = ['https://abdellahafkhar7-a11y.github.io', 'https://photographypixel.pages.dev'];
  if (origin && allowed.some(function (domain) { return origin.startsWith(domain); })) {
    return true;
  }

  // Check referer as fallback
  if (referer && allowed.some(function (domain) { return referer.startsWith(domain); })) {
    return true;
  }

  return false;
}

/**
 * Extracts the client IP from the request headers.
 * Cloudflare provides this via CF-Connecting-IP.
 * @param {Request} request
 * @returns {string}
 */
export function getClientIP(request) {
  return (
    request.headers.get('CF-Connecting-IP') ||
    request.headers.get('X-Real-IP') ||
    request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ||
    'unknown'
  );
}

/**
 * Generates a rate-limit key from visitor ID + IP.
 * Used for grouping requests by visitor for rate limiting.
 * @param {Request} request
 * @param {string} [visitorId] - Optional visitor ID from header
 * @returns {string}
 */
export function basicRateLimitKey(request, visitorId) {
  const ip = getClientIP(request);
  if (visitorId) return visitorId + ':' + ip;
  return ip;
}
