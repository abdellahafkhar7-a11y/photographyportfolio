// ============================================
// Video Catalog Utility — Reads TXT files and config
// Provides structured video data for APIs without modifying the TXT system
// ============================================

import { validateVideoSlug } from './validator.js';

/**
 * Fetches and parses data/config.json
 * @param {Request} request - For building fetch URL
 * @returns {Promise<object|null>}
 */
async function fetchConfig(request) {
  try {
    const url = new URL('/data/config.json', request.url);
    const response = await fetch(url.toString());
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Fetches and parses a TXT file into an array of URLs.
 * @param {Request} request
 * @param {string} txtFile
 * @returns {Promise<string[]>}
 */
async function fetchTxtUrls(request, txtFile) {
  try {
    const url = new URL('/data/' + txtFile, request.url);
    const response = await fetch(url.toString());
    if (!response.ok) return [];
    const text = await response.text();
    return text
      .replace(/^\uFEFF/, '')
      .split(/\r?\n/)
      .map(function (line) { return line.trim(); })
      .filter(function (url) { return /^https?:\/\//.test(url); });
  } catch {
    return [];
  }
}

/**
 * Derives a slug from a video URL filename.
 * e.g. "https://.../ugc 1.mp4" → "ugc-1"
 * @param {string} url
 * @returns {string}
 */
function slugFromUrl(url) {
  try {
    const pathname = new URL(url).pathname;
    const filename = decodeURIComponent(pathname.split('/').pop() || '');
    return filename
      .replace(/\.\w+$/, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9-]/g, '')
      .toLowerCase();
  } catch {
    return '';
  }
}

/**
 * Returns all videos across all categories with TXT files.
 * @param {Request} request
 * @returns {Promise<Array<{slug: string, url: string, category: string, label: string}>>}
 */
export async function getAllVideos(request) {
  const config = await fetchConfig(request);
  if (!config || !config.categories) return [];

  const categories = config.categories;
  const videos = [];

  for (const [slug, cat] of Object.entries(categories)) {
    if (!cat.txtFile) continue;
    const urls = await fetchTxtUrls(request, cat.txtFile);
    for (const url of urls) {
      const videoSlug = slugFromUrl(url);
      if (videoSlug) {
        videos.push({
          slug: videoSlug,
          url: url,
          category: slug,
          label: cat.label || slug
        });
      }
    }
  }

  return videos;
}

/**
 * Returns all videos for a specific category.
 * @param {Request} request
 * @param {string} categorySlug
 * @returns {Promise<Array<{slug: string, url: string, category: string, label: string}>>}
 */
export async function getVideosByCategory(request, categorySlug) {
  const all = await getAllVideos(request);
  return all.filter(function (v) { return v.category === categorySlug; });
}

/**
 * Returns a single video by its slug.
 * @param {Request} request
 * @param {string} slug
 * @returns {Promise<{slug: string, url: string, category: string, label: string}|null>}
 */
export async function getVideoBySlug(request, slug) {
  const validSlug = validateVideoSlug(slug);
  if (!validSlug) return null;

  const all = await getAllVideos(request);
  return all.find(function (v) { return v.slug === validSlug; }) || null;
}
