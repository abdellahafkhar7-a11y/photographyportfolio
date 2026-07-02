# Photography Pixel — Backend Architecture

## Overview

Production-grade backend built on **Cloudflare Pages Functions** + **Cloudflare D1**.
The frontend remains a pure static SPA — the backend is additive and does not modify any frontend behavior.

## Architecture

```
photographyportfolio/
├── functions/
│   ├── api/                    # API endpoints (Cloudflare Pages Functions)
│   │   ├── health.js           # GET  /api/health
│   │   ├── test-db.js          # GET  /api/test-db
│   │   ├── view.js             # POST /api/view
│   │   ├── like.js             # POST /api/like
│   │   ├── share.js            # POST /api/share
│   │   ├── stats.js            # GET  /api/stats
│   │   ├── analytics.js        # GET  /api/analytics
│   │   ├── videos.js           # GET  /api/videos
│   │   └── video/
│   │       └── [slug].js       # GET  /api/video/:slug
│   └── lib/                    # Shared backend libraries
│       ├── response.js         # success() / error() JSON helpers
│       ├── validator.js        # validateVideoSlug() / validateVisitorId()
│       ├── visitor.js          # getVisitorId(request) — server-side
│       ├── security.js         # checkOrigin() / getClientIP() / basicRateLimitKey()
│       ├── rateLimit.js        # rateLimit(context, limit, windowMs)
│       ├── query.js            # D1 query helpers (getTotalCount, getCountBySlug, etc.)
│       └── videoCatalog.js     # Reads TXT files + config for structured video data
├── database/                    # SQL migrations (run in D1 console)
│   ├── 001_create_views.sql
│   ├── 002_create_likes.sql
│   ├── 003_create_shares.sql
│   └── 004_add_unique_constraints.sql
├── data/                        # Static data (TXT files, JSON configs)
├── _headers                     # Cloudflare Pages security headers + cache rules
└── _redirects                   # SPA fallback
```

## API Endpoints

| Method | Path               | Description                              | Auth               |
|--------|---------------------|------------------------------------------|--------------------|
| GET    | `/api/health`      | Health check                             | None               |
| GET    | `/api/test-db`     | D1 connection test                       | None               |
| POST   | `/api/view`        | Track video view (60-min dedup)          | `X-Visitor-Id` + Origin |
| POST   | `/api/like`        | Toggle like/unlike                       | `X-Visitor-Id` + Origin |
| POST   | `/api/share`       | Track video share (60-min dedup)         | `X-Visitor-Id` + Origin |
| GET    | `/api/stats`       | Global statistics (views, likes, shares) | None               |
| GET    | `/api/analytics`   | Today's metrics + top content             | None               |
| GET    | `/api/videos`      | All videos (supports `?category=`)       | None               |
| GET    | `/api/video/:slug` | Single video info + engagement stats      | None               |

### POST Endpoints

All POST endpoints expect:
- **Header:** `X-Visitor-Id: <16-char hex string>`
- **Body:** `{ "video_slug": "ugc-1" }`
- **Origin check:** Request must come from allowed domains or localhost
- **Rate limit:** 30 requests per minute per visitor

### Response Format

All endpoints return consistent JSON:

```json
// Success
{ "success": true, ...data }

// Error
{ "success": false, "error": "Error message" }
```

## Database Schema

### `views` table
| Column      | Type    | Description                     |
|-------------|---------|---------------------------------|
| id          | INTEGER | Primary key (autoincrement)     |
| video_slug  | TEXT    | Video identifier                |
| visitor_id  | TEXT    | Visitor identifier              |
| viewed_at   | TEXT    | ISO timestamp (auto)            |

Indexes: `video_slug`, `visitor_id`

### `likes` table
| Column      | Type    | Description                     |
|-------------|---------|---------------------------------|
| id          | INTEGER | Primary key (autoincrement)     |
| video_slug  | TEXT    | Video identifier                |
| visitor_id  | TEXT    | Visitor identifier              |
| created_at  | TEXT    | ISO timestamp (auto)            |

Indexes: `video_slug`, `visitor_id`
Constraint: `UNIQUE(video_slug, visitor_id)`

### `shares` table
| Column      | Type    | Description                     |
|-------------|---------|---------------------------------|
| id          | INTEGER | Primary key (autoincrement)     |
| video_slug  | TEXT    | Video identifier                |
| visitor_id  | TEXT    | Visitor identifier              |
| shared_at   | TEXT    | ISO timestamp (auto)            |

Indexes: `video_slug`, `visitor_id`, `(video_slug, visitor_id, shared_at)`

### `rate_limit` table
| Column       | Type    | Description                     |
|--------------|---------|---------------------------------|
| key          | TEXT    | Rate limit key (visitor+IP)     |
| count        | INTEGER | Request count in window          |
| window_start | TEXT    | Window start timestamp           |

Primary key: `key`

## Security Model

1. **Origin Validation** — POST endpoints reject requests from unauthorized domains
2. **Rate Limiting** — 30 requests/minute per visitor on POST endpoints
3. **Input Validation** — All inputs validated (slug ≤255 chars, visitor_id ≤128 chars)
4. **SQL Injection Prevention** — All queries use prepared statements with bound parameters
5. **No Internal Error Exposure** — Catch blocks return generic "Database error"
6. **Security Headers** — Set via `_headers`: HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy

## Cloudflare D1 Binding

The D1 database is bound to the Pages project with the binding name:
```
db
```

Accessed in functions as: `context.env.db`

## Deployment

1. **Deploy the codebase** to Cloudflare Pages (git integration or direct upload)
2. **Run migrations** in the D1 console (Cloudflare Dashboard → D1 → your database → Console):
   ```sql
   -- Run each migration file in order
   ```
3. **Verify endpoints**:
   - `GET /api/health` → should return success
   - `GET /api/test-db` → should confirm D1 connection

## Shared Libraries

### `response.js`
- `success(data, status)` — Returns JSON success response
- `error(message, status)` — Returns JSON error response

### `validator.js`
- `validateVideoSlug(slug)` — Returns trimmed slug or null
- `validateVisitorId(id)` — Returns trimmed ID or null

### `visitor.js`
- `getVisitorId(request)` — Extracts visitor_id from `X-Visitor-Id` header

### `security.js`
- `checkOrigin(request)` — Validates request origin
- `getClientIP(request)` — Extracts client IP from Cloudflare headers
- `basicRateLimitKey(request, visitorId)` — Generates rate limit key

### `rateLimit.js`
- `rateLimit(context, limit, windowMs)` — D1-based rate limiting

### `query.js`
- `getTotalCount(db, table)` — Total rows in table
- `getCountBySlug(db, table, slug)` — Count for specific video
- `getTodayCount(db, table, dateColumn)` — Count for today
- `getTopSlugs(db, table, limit)` — Top N slugs by count

### `videoCatalog.js`
- `getAllVideos(request)` — All videos from TXT files
- `getVideosByCategory(request, categorySlug)` — Filtered by category
- `getVideoBySlug(request, slug)` — Single video lookup

## Future Expansion

The architecture supports easy addition of:
- **Comments** — New `comments` table + `functions/api/comment.js`
- **Ratings** — New `ratings` table + `functions/api/rate.js`
- **User accounts** — Auth layer + `users` table
- **Admin dashboard** — Protected endpoints for content management
- **Video upload** — R2 direct upload via API
- **Webhooks** — Event-driven notifications on view/like/share
