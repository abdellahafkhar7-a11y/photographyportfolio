-- ============================================
-- Migration: 002_create_likes.sql
-- Creates the `likes` table for tracking video likes
-- ============================================

CREATE TABLE IF NOT EXISTS likes (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  video_slug  TEXT    NOT NULL,
  visitor_id  TEXT    NOT NULL,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_likes_video_slug  ON likes (video_slug);
CREATE INDEX IF NOT EXISTS idx_likes_visitor_id  ON likes (visitor_id);
