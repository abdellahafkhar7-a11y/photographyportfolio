-- ============================================
-- Migration: 001_create_views.sql
-- Creates the `views` table for tracking video views
-- ============================================

CREATE TABLE IF NOT EXISTS views (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  video_slug  TEXT    NOT NULL,
  visitor_id  TEXT    NOT NULL,
  viewed_at   TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_views_video_slug  ON views (video_slug);
CREATE INDEX IF NOT EXISTS idx_views_visitor_id  ON views (visitor_id);
