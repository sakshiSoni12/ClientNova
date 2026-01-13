import { getStoryById, getStoryPages, getAllStoryAudio, getUserProgress } from "@/lib/stories"
import { StoryContainer } from "@/components/stories/StoryContainer"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export const dynamic = 'force-dynamic'

interface Props {
    params: Promise<{ id: string }>
}

export default async function StoryPage({ params }: Props) {
    const { id } = await params

    if (!id) return notFound()

    const supabase = await createClient()

    try {
        const story = await getStoryById(supabase, id)
        if (!story) {
            return notFound()
        }

        const pages = await getStoryPages(supabase, id)
        const audioList = await getAllStoryAudio(supabase, id)

        const { data: { user } } = await supabase.auth.getUser()
        let userProgress = null

        if (user) {
            userProgress = await getUserProgress(supabase, user.id, id)
        }

        return (
            <main className="min-h-screen bg-background text-foreground overflow-hidden selection:bg-primary/20">
                <div className="fixed inset-0 pointer-events-none noise-overlay opacity-[0.03]" />
                <div className="fixed inset-0 pointer-events-none vignette-overlay opacity-50" />
                <StoryContainer
                    story={story}
                    pages={pages}
                    audioOptions={audioList}
                    initialProgress={userProgress}
                />

                {/* Admin Edit Link */}
                {user && (
                    <div className="fixed top-6 right-6 z-50">
                        <a href={`/admin/edit-story/${story.id}`} className="px-4 py-2 bg-foreground/10 hover:bg-foreground/20 backdrop-blur rounded-full text-xs font-bold uppercase tracking-widest transition-all">
                            Edit Story
                        </a>
                    </div>
                )}
            </main>
        )
    } catch (e) {
        console.error(e)
        return notFound()
    }
}
