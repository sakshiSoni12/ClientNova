-- Enable DELETE for authenticated users on relevant tables

-- 1. Policies for 'stories'
-- Drop existing delete policy if it exists (to be safe, though usually we just create if not exists)
DROP POLICY IF EXISTS "Enable delete for users" ON "public"."stories";
-- Create new policy allowing delete for authenticated users
CREATE POLICY "Enable delete for users" ON "public"."stories" FOR DELETE TO authenticated USING (true);

-- 2. Policies for 'story_pages'
DROP POLICY IF EXISTS "Enable delete for users" ON "public"."story_pages";
CREATE POLICY "Enable delete for users" ON "public"."story_pages" FOR DELETE TO authenticated USING (true);

-- 3. Policies for 'story_audio'
DROP POLICY IF EXISTS "Enable delete for users" ON "public"."story_audio";
CREATE POLICY "Enable delete for users" ON "public"."story_audio" FOR DELETE TO authenticated USING (true);

-- 4. Policies for 'user_story_progress'
DROP POLICY IF EXISTS "Enable delete for users" ON "public"."user_story_progress";
CREATE POLICY "Enable delete for users" ON "public"."user_story_progress" FOR DELETE TO authenticated USING (auth.uid() = user_id);
