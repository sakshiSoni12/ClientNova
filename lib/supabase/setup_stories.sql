-- ==========================================
-- Story Experience Module - Setup Script
-- Run this in your Supabase SQL Editor
-- ==========================================

-- 1. Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Drop existing tables if re-running (Optional - BE CAREFUL)
-- DROP TABLE IF EXISTS user_story_progress;
-- DROP TABLE IF EXISTS story_audio;
-- DROP TABLE IF EXISTS story_pages;
-- DROP TABLE IF EXISTS stories;

-- 3. Create Stories Table
CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL UNIQUE,
  genre TEXT NOT NULL, -- 'Horror', 'Mystery', 'Sci-Fi', 'AI/Tech', 'Romance'
  synopsis TEXT NOT NULL,
  emotional_tone TEXT NOT NULL,
  reading_time TEXT NOT NULL, -- e.g., '5 min'
  listening_time TEXT NOT NULL, -- e.g., '12 min'
  language_available TEXT[] DEFAULT '{EN}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Story Pages Table
CREATE TABLE IF NOT EXISTS story_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL,
  content_text TEXT NOT NULL,
  chapter_title TEXT,
  UNIQUE(story_id, page_number)
);

-- 5. Create Story Audio Table
CREATE TABLE IF NOT EXISTS story_audio (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  language TEXT NOT NULL, -- 'EN', 'HI'
  audio_url TEXT NOT NULL,
  duration INTEGER NOT NULL, -- seconds
  UNIQUE(story_id, language)
);

-- 6. Create User Progress Table
CREATE TABLE IF NOT EXISTS user_story_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  last_page INTEGER DEFAULT 1,
  preferred_mode TEXT DEFAULT 'read', -- 'read', 'listen', 'hybrid'
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, story_id)
);

-- 7. Enable RLS
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_audio ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_story_progress ENABLE ROW LEVEL SECURITY;

-- 8. Policies
-- Public read for stories, pages, audio
DROP POLICY IF EXISTS "Public stories are viewable by everyone" ON stories;
CREATE POLICY "Public stories are viewable by everyone" ON stories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public story pages are viewable by everyone" ON story_pages;
CREATE POLICY "Public story pages are viewable by everyone" ON story_pages FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public story audio are viewable by everyone" ON story_audio;
CREATE POLICY "Public story audio are viewable by everyone" ON story_audio FOR SELECT USING (true);

-- Authenticated user access for progress
DROP POLICY IF EXISTS "Users can view own progress" ON user_story_progress;
CREATE POLICY "Users can view own progress" ON user_story_progress FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own progress" ON user_story_progress;
CREATE POLICY "Users can insert own progress" ON user_story_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own progress" ON user_story_progress;
CREATE POLICY "Users can update own progress" ON user_story_progress FOR UPDATE USING (auth.uid() = user_id);

-- 9. Admin/Creator Policies (Allow authenticated users to create content)
-- STORIES
DROP POLICY IF EXISTS "Auth users can insert stories" ON stories;
CREATE POLICY "Auth users can insert stories" ON stories FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Auth users can update stories" ON stories;
CREATE POLICY "Auth users can update stories" ON stories FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Auth users can delete stories" ON stories;
CREATE POLICY "Auth users can delete stories" ON stories FOR DELETE USING (auth.role() = 'authenticated');

-- PAGES
DROP POLICY IF EXISTS "Auth users can insert pages" ON story_pages;
CREATE POLICY "Auth users can insert pages" ON story_pages FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Auth users can update pages" ON story_pages;
CREATE POLICY "Auth users can update pages" ON story_pages FOR UPDATE USING (auth.role() = 'authenticated');

-- AUDIO
DROP POLICY IF EXISTS "Auth users can insert audio" ON story_audio;
CREATE POLICY "Auth users can insert audio" ON story_audio FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Auth users can update audio" ON story_audio;
CREATE POLICY "Auth users can update audio" ON story_audio FOR UPDATE USING (auth.role() = 'authenticated');


-- ==========================================
-- SEED DATA (Placeholder Stories)
-- ==========================================

-- Default stories have been removed.
-- You can add your own stories using the Supabase Dashboard or API.

END $$;
