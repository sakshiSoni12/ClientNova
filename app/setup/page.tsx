"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Check, Copy, Database, ExternalLink, Terminal } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export default function SetupPage() {
    const [copied, setCopied] = useState(false)

    const sqlScript = `
-- ==========================================
-- Story Experience Module - Setup Script
-- Run this in your Supabase SQL Editor
-- ==========================================

-- 1. Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Stories Table
CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  genre TEXT NOT NULL,
  synopsis TEXT NOT NULL,
  emotional_tone TEXT NOT NULL,
  reading_time TEXT NOT NULL,
  listening_time TEXT NOT NULL,
  language_available TEXT[] DEFAULT '{EN}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Story Pages Table
CREATE TABLE IF NOT EXISTS story_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL,
  content_text TEXT NOT NULL,
  chapter_title TEXT,
  UNIQUE(story_id, page_number)
);

-- 4. Create Story Audio Table
CREATE TABLE IF NOT EXISTS story_audio (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  language TEXT NOT NULL, 
  audio_url TEXT NOT NULL,
  duration INTEGER NOT NULL,
  UNIQUE(story_id, language)
);

-- 5. Create User Progress Table
CREATE TABLE IF NOT EXISTS user_story_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  last_page INTEGER DEFAULT 1,
  preferred_mode TEXT DEFAULT 'read',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, story_id)
);

-- 6. Enable RLS
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_audio ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_story_progress ENABLE ROW LEVEL SECURITY;

-- 7. Policies
DROP POLICY IF EXISTS "Public stories are viewable by everyone" ON stories;
CREATE POLICY "Public stories are viewable by everyone" ON stories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public story pages are viewable by everyone" ON story_pages;
CREATE POLICY "Public story pages are viewable by everyone" ON story_pages FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public story audio are viewable by everyone" ON story_audio;
CREATE POLICY "Public story audio are viewable by everyone" ON story_audio FOR SELECT USING (true);

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

-- 10. Storage Setup (Run this if you haven't already)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('story-audio', 'story-audio', true)
ON CONFLICT (id) DO NOTHING;

-- Public access to storage
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'story-audio');

-- Auth users can upload
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'story-audio' AND auth.role() = 'authenticated'
);


-- 8. Seed Data (Placeholder Stories)
-- Default stories have been removed.
-- You can add your own stories using the Supabase Dashboard or API.

     `;

    const handleCopy = () => {
        navigator.clipboard.writeText(sqlScript)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="min-h-screen bg-background text-foreground p-6 md:p-12 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="fixed inset-0 pointer-events-none noise-overlay opacity-[0.03]" />
            <div className="fixed inset-0 pointer-events-none living-gradient opacity-20" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-4xl relative z-10"
            >
                <div className="text-center mb-10 space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                        <Database size={32} />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif font-medium">Initialize Database</h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Your Supabase project needs to be set up to store stories, progress, and audio.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Instructions Column */}
                    <div className="md:col-span-1 space-y-6">
                        <Card className="bg-card/50 backdrop-blur border-border">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Terminal size={18} className="text-primary" />
                                    Steps
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-foreground font-medium">
                                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs">1</span>
                                        Copy Script
                                    </div>
                                    <p className="text-sm text-muted-foreground pl-8">
                                        Click the button to copy the SQL setup script.
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-foreground font-medium">
                                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs">2</span>
                                        Open Dashboard
                                    </div>
                                    <p className="text-sm text-muted-foreground pl-8">
                                        Go to your Supabase project's SQL Editor.
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-foreground font-medium">
                                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs">3</span>
                                        Run Query
                                    </div>
                                    <p className="text-sm text-muted-foreground pl-8">
                                        Paste the script and click "Run".
                                    </p>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Link
                                    href="https://supabase.com/dashboard/project/_/sql/new"
                                    target="_blank"
                                    className="w-full"
                                >
                                    <Button className="w-full gap-2">
                                        <ExternalLink size={16} />
                                        Open Supabase SQL Editor
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>

                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 flex items-start gap-3">
                            <AlertCircle className="text-yellow-500 shrink-0 mt-0.5" size={18} />
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-yellow-500">Note</p>
                                <p className="text-xs text-muted-foreground">
                                    You can (and should) run this script again to add the missing audio data. It will insert new stories with audio.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Code Column */}
                    <div className="md:col-span-2">
                        <Card className="h-[600px] bg-zinc-950 border-zinc-800 flex flex-col overflow-hidden">
                            <CardHeader className="bg-zinc-900/50 border-b border-zinc-800 py-3 px-4 flex flex-row items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                                        <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                                    </div>
                                    <span className="text-xs font-mono text-zinc-400 ml-2">setup_stories.sql</span>
                                </div>
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    className="h-7 text-xs gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700"
                                    onClick={handleCopy}
                                >
                                    {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                    {copied ? "Copied!" : "Copy SQL"}
                                </Button>
                            </CardHeader>
                            <CardContent className="flex-1 p-0 overflow-hidden relative group">
                                <div className="absolute inset-0 overflow-auto p-4 custom-scrollbar">
                                    <pre className="text-xs font-mono text-zinc-300 leading-relaxed">
                                        <code>{sqlScript}</code>
                                    </pre>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="mt-12 text-center">
                    <Link href="/stories">
                        <Button variant="ghost" size="lg" className="text-muted-foreground hover:text-foreground">
                            I've updated the database, take me back to Library &rarr;
                        </Button>
                    </Link>
                </div>

            </motion.div>
        </div>
    )
}
