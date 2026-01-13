import { SupabaseClient } from '@supabase/supabase-js'

export type Story = {
    id: string
    title: string
    genre: string
    synopsis: string
    emotional_tone: string
    reading_time: string
    listening_time: string
    language_available: string[]
    created_at: string
}

export type StoryPage = {
    id: string
    story_id: string
    page_number: number
    content_text: string
    chapter_title: string | null
}

export type StoryAudio = {
    id: string
    story_id: string
    language: string
    audio_url: string
    duration: number
    chapter_number?: number
}

export type UserProgress = {
    last_page: number
    preferred_mode: 'read' | 'listen' | 'hybrid'
}

export async function getStories(supabase: SupabaseClient, genre?: string) {
    let query = supabase.from('stories').select('*').order('created_at', { ascending: false })

    if (genre) {
        query = query.eq('genre', genre)
    }

    const { data, error } = await query
    if (error) throw error

    // Deduplicate by title to handle potential database duplicates
    const uniqueStories = Array.from(new Map((data as Story[]).map(item => [item.title, item])).values());

    return uniqueStories
}

export async function getStoryById(supabase: SupabaseClient, id: string) {
    const { data, error } = await supabase.from('stories').select('*').eq('id', id).single()

    if (error) throw error
    return data as Story
}

export async function getStoryPages(supabase: SupabaseClient, storyId: string) {
    const { data, error } = await supabase
        .from('story_pages')
        .select('*')
        .eq('story_id', storyId)
        .order('page_number', { ascending: true })

    if (error) throw error
    return data as StoryPage[]
}

export async function getAllStoryAudio(supabase: SupabaseClient, storyId: string) {
    const { data, error } = await supabase
        .from('story_audio')
        .select('*')
        .eq('story_id', storyId)
        .order('chapter_number', { ascending: true }) // Playlist sorting enabled


    if (error) throw error
    return data as StoryAudio[]
}

export async function getUserProgress(supabase: SupabaseClient, userId: string, storyId: string) {
    const { data, error } = await supabase
        .from('user_story_progress')
        .select('last_page, preferred_mode')
        .eq('user_id', userId)
        .eq('story_id', storyId)
        .single()

    if (error && error.code !== 'PGRST116') {
        console.error('Error fetching progress:', error)
        return null
    }
    return data as UserProgress | null
}

export async function saveUserProgress(
    supabase: SupabaseClient,
    userId: string,
    storyId: string,
    lastPage: number,
    mode: 'read' | 'listen' | 'hybrid'
) {
    const { error } = await supabase
        .from('user_story_progress')
        .upsert(
            {
                user_id: userId,
                story_id: storyId,
                last_page: lastPage,
                preferred_mode: mode,
                updated_at: new Date().toISOString()
            },
            { onConflict: 'user_id, story_id' }
        )

    if (error) console.error('Error saving progress:', error)
}

export async function getUserLibrary(supabase: SupabaseClient, userId: string) {
    const { data, error } = await supabase
        .from('user_story_progress')
        .select(`
      *,
      stories (*)
    `)
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })

    if (error) {
        console.error('Error fetching library:', error)
        return []
    }

    // Flatten structure for easier UI consumption: { ...progress, story: { ...storyData } }
    // Note: 'stories' comes back as an object because of the join semantics in single relation, 
    // or array if multiple. Here it's one-to-one from progress entry to story.
    return data.map((item: any) => ({
        ...item,
        story: item.stories
    })) as (UserProgress & { id: string, updated_at: string, story: Story })[]
}

export function matchMoodToGenre(moodAnalysis: any): string {
    // Simple heuristic matching based on keywords in mood description
    const text = (moodAnalysis?.title + " " + moodAnalysis?.description).toLowerCase();

    if (text.includes("fear") || text.includes("dread") || text.includes("shadow") || text.includes("dark") || text.includes("quiet room")) return 'Horror';
    if (text.includes("mystery") || text.includes("cipher") || text.includes("question") || text.includes("intellectual") || text.includes("tokyo")) return 'Mystery';
    if (text.includes("future") || text.includes("space") || text.includes("vast") || text.includes("tech") || text.includes("echo")) return 'Sci-Fi';
    if (text.includes("love") || text.includes("warm") || text.includes("connection") || text.includes("coffee") || text.includes("stranger")) return 'Romance';

    // Default fallback
    return 'Mystery';
}

// --- Creation Functions ---

export async function createStory(supabase: SupabaseClient, story: Partial<Story>) {
    const { data, error } = await supabase
        .from('stories')
        .insert(story)
        .select()
        .single()

    if (error) throw error
    return data as Story
}

export async function addStoryPage(supabase: SupabaseClient, page: Partial<StoryPage>) {
    const { data, error } = await supabase
        .from('story_pages')
        .insert(page)
        .select()
        .single()

    if (error) throw error
    return data as StoryPage
}

export async function addStoryAudio(supabase: SupabaseClient, audio: Partial<StoryAudio>) {
    const { data, error } = await supabase
        .from('story_audio')
        .insert(audio)
        .select()
        .single()

    if (error) throw error
    return data as StoryAudio
}

export async function updateStory(supabase: SupabaseClient, id: string, updates: Partial<Story>) {
    const { data, error } = await supabase
        .from('stories')
        .update(updates)
        .eq('id', id)
        .select()
        .maybeSingle()

    if (error) throw error
    if (!data) throw new Error("Story not found or not updated")
    return data as Story
}

export async function updateStoryPage(supabase: SupabaseClient, id: string, updates: Partial<StoryPage>) {
    const { data, error } = await supabase
        .from('story_pages')
        .update(updates)
        .eq('id', id)
        .select()
        .maybeSingle()

    if (error) throw error
    // Pages might legitimately be missing if concurrent edits happen, but generally should exist
    return data as StoryPage
}

export async function upsertStoryAudio(supabase: SupabaseClient, audio: Partial<StoryAudio>) {
    // 1. Check if audio already exists for this story and language (default EN)
    const { data: existing } = await supabase
        .from('story_audio')
        .select('id')
        .eq('story_id', audio.story_id)
        .eq('language', audio.language || 'EN')
        .maybeSingle()

    if (existing) {
        // 2. Update existing
        const { data, error } = await supabase
            .from('story_audio')
            .update(audio)
            .eq('id', existing.id)
            .select()
            .single()

        if (error) throw error
        return data as StoryAudio
    } else {
        // 3. Insert new
        // Ensure we don't send an undefined ID
        const audioData = { ...audio }
        if (!audioData.id) delete audioData.id

        const { data, error } = await supabase
            .from('story_audio')
            .insert(audioData)
            .select()
            .single()

        if (error) throw error
        return data as StoryAudio

    }
}

export async function deleteStory(supabase: SupabaseClient, storyId: string) {
    // 1. Delete associated audio
    const { error: audioError } = await supabase
        .from('story_audio')
        .delete()
        .eq('story_id', storyId)
    if (audioError) throw audioError

    // 2. Delete associated pages
    const { error: pagesError } = await supabase
        .from('story_pages')
        .delete()
        .eq('story_id', storyId)
    if (pagesError) throw pagesError

    // 3. Delete user progress (if any)
    const { error: progressError } = await supabase
        .from('user_story_progress')
        .delete()
        .eq('story_id', storyId)
    if (progressError) throw progressError

    // 4. Finally, delete the story
    const { error, count } = await supabase
        .from('stories')
        .delete({ count: 'exact' })
        .eq('id', storyId)

    if (error) throw error
    if (count === 0) throw new Error("Permission denied or story not found. You may not have the rights to delete this story.")
}
