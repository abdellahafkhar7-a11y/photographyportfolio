

## Codely Structured Memories

### User

### Feedback
- [2026-08-11 17:00:38] Google Drive video embeds (drive.google.com/file/d/ID/preview) are NOT suitable for the portfolio card system. Tested 2026-08-11: Google Drive preview iframe includes unremovable UI (title bar, top-right ↗ open button) that cannot be hidden via CSS crop without cutting video content. Cross-origin prevents JS manipulation. **Why:** Google Drive player chrome is always present in preview embeds. **How to apply:** if a non-Bamboo video provider is needed, use self-hosted MP4 or a provider with clean embed API; do not revisit Google Drive for portfolio cards.

### Project
- [2026-08-10 20:45:59] R2 custom domain (video.photographypixell.com) was used for video hosting until 2026-08-10 when all videos migrated to Bamboo Cloud (cdn.bamboo-cloud.com). R2 infrastructure remains but is no longer referenced in code. **Why:** full migration to Bamboo Cloud video platform. **How to apply:** do not add video.photographypixell.com back to CSP or code; use cdn.bamboo-cloud.com for video frame-src.


- [2026-08-11 19:27:34] Video architecture: Bamboo Cloud iframe embeds (base: https://cdn.bamboo-cloud.com/api/embed) stored in data/*.txt files. createBambooCard(url) renders all video cards as iframes in 9:16 .reel-card containers with .reel-card-fullscreen-guard overlay (hides Bamboo player fullscreen button). allowfullscreen removed from iframes. R2 video system fully removed 2026-08-10. CSP frame-src allows cdn.bamboo-cloud.com. **Why:** migrated from R2 MP4 to Bamboo Cloud for all video hosting. **How to apply:** all category TXT files now contain real Bamboo URLs (ugc:25, shooting:13, stores:14, events:11, services:12, drone:6). UGC has deterministic hourly shuffle (hourlyShuffle, mulberry32 PRNG, seed YYYY-MM-DD-HH).
- [2026-08-11 19:27:34] Video availability filtering: data/video-status.json ({"unavailable": []}) lists Bamboo video IDs that should be filtered out (broken/processing). loadVideoStatus() fetches it once, getBambooVideoId(url) extracts ID from URL, fetchCategoryUrls() filters them before rendering. **Why:** Bamboo is cross-origin so runtime detection of "Media is being processed" is impossible — manual data-driven approach needed. **How to apply:** add unavailable Bamboo IDs to the array in data/video-status.json to hide broken cards.
- [2026-08-11 19:27:34] Dead code removed 2026-08-11: pauseAllVideos() (empty no-op for cross-origin Bamboo iframes), cinematic viewer IIFE (~130 lines, openViewer was never called), categoryLabels (only used by removed viewer), .reel-card video CSS rules (Bamboo uses iframes not video elements), .reel-card.loading skeleton/spinner CSS, :fullscreen CSS rules. **Why:** cleanup of code left from R2 MP4 era that no longer applies to Bamboo iframe architecture. **How to apply:** do not re-add cinematic viewer or pauseAllVideos — Bamboo iframes are cross-origin and cannot be controlled from parent.

### Reference

