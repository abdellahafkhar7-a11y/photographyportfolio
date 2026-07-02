-- ============================================
-- Migration: 004_add_unique_constraints.sql
-- Adds UNIQUE constraint on likes to prevent race-condition duplicates
-- Views table stays without UNIQUE (time-based dedup is intentional)
-- ============================================

-- Create a new likes table with UNIQUE constraint, then migrate data
CREATE TABLE IF NOT EXISTS likes_new (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  video_slug  TEXT    NOT NULL,
  visitor_id  TEXT    NOT NULL,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  UNIQUE (video_slug, visitor_id)
);

-- Copy existing data, keeping only the earliest like per (slug, visitor)
INSERT OR IGNORE INTO likes_new (id, video_slug, visitor_id, created_at)
  SELECT MIN(id), video_slug, visitor_id, MIN(created_at)
  FROM likes
  GROUP BY video_slug, visitor_id;

-- Replace old table
DROP TABLE IF EXISTS likes;
ALTER TABLE likes_new RENAME TO likes;

-- Recreate indexes
CREATE INDEX IF NOT EXISTS idx_likes_video_slug  ON likes (video_slug);
CREATE INDEX IF NOT EXISTS idx_likes_visitor_id  ON likes (visitor_id);
