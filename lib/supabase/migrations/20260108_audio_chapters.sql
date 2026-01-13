-- Migration: Add chapter support to story_audio
-- Description: Allows multiple audio files (chapters) per story/language.

-- 1. Drop the old unique constraint (one audio per story+language)
ALTER TABLE story_audio 
DROP CONSTRAINT IF EXISTS story_audio_story_id_language_key;

-- 2. Add chapter_number column (default to 1 for existing records)
ALTER TABLE story_audio 
ADD COLUMN IF NOT EXISTS chapter_number INTEGER DEFAULT 1;

-- 3. Add new unique constraint (one audio per story+language+chapter)
ALTER TABLE story_audio 
ADD CONSTRAINT story_audio_story_id_language_chapter_key 
UNIQUE (story_id, language, chapter_number);

-- 4. Comment (Optional)
COMMENT ON COLUMN story_audio.chapter_number IS 'Order of the audio file in the story (1, 2, 3...)';
