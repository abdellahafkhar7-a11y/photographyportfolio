

## Codely Structured Memories

### User

### Feedback

### Project
- [2026-08-10 17:56:44] R2 video storage (pub-534c13f1f66d439aa28b4a49e34c796f.r2.dev) returns NO CORS headers (Access-Control-Allow-Origin is empty). Verified 2026-08-10 via live Range request. **Why:** adding crossorigin="anonymous" to <video> elements would trigger a CORS preflight that R2 fails, breaking all video playback. **How to apply:** never add crossorigin attribute to video elements in this project.
- [2026-08-10 17:56:44] Video architecture: plain R2 MP4 URLs stored in data/*.txt files, lazy-loaded via IntersectionObserver (rootMargin 300px). preload="none" on creation, upgraded to preload="auto" + video.load() on viewport enter, pause-only on exit. No URL encoding/PP_Protection/loadSourceForVideo layer exists in the codebase despite user sometimes describing one. **Why:** user may describe protection systems from memory or a different version — verify against actual code before acting. **How to apply:** when user describes protection/encoding lifecycle, grep the repo first before assuming it exists.

### Reference

