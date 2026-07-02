-- ============================================
-- Migration: 003_create_shares.sql
-- Creates the `shares` table for tracking video shares
-- ============================================

CREATE TABLE IF NOT EXISTS shares (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  video_slug  TEXT    NOT NULL,
  visitor_id  TEXT    NOT NULL,
  shared_at   TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_shares_video_slug   ON shares (video_slug);
CREATE INDEX IF NOT EXISTS idx_shares_visitor_id   ON shares (visitor_id);
CREATE INDEX IF NOT EXISTS idx_shares_dedup        ON shares (video_slug, visitor_id, shared_at);
