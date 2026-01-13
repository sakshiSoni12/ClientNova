import { getStories, Story } from "@/lib/stories"
import { StoryGrid } from "@/components/stories/StoryGrid"
import { createClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { AlertTriangle, Copy } from "lucide-react"

export const dynamic = 'force-dynamic'

interface Props {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function StoriesPage({ searchParams }: Props) {
    const params = await searchParams
    const genre = params?.genre as string | undefined

    const supabase = await createClient()
    let stories: Story[] = []
    let error: any = null

    try {
        stories = await getStories(supabase)
    } catch (e) {
        console.error("Fetch error:", e)
        error = e
    }

    const { data: { user } } = await supabase.auth.getUser()

    const displayStories = genre
        ? [...stories.filter(s => s.genre === genre), ...stories.filter(s => s.genre !== genre)]
        : stories

    if (error) {
        // Safe check for missing table error
        const isMissingTable = JSON.stringify(error).includes("relation") && JSON.stringify(error).includes("does not exist");

        return (
            <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center p-6 text-center">
                {/* Background Atmosphere */}
                <div className="fixed inset-0 pointer-events-none noise-overlay" />
                <div className="fixed inset-0 pointer-events-none vignette-overlay" />

                <div className="space-y-8 max-w-lg relative z-10">
                    <div className="flex justify-center">
                        <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                            <AlertTriangle size={32} />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-3xl font-serif text-foreground">The Library is Under Construction</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            {isMissingTable
                                ? "The stories database table has not been created yet."
                                : "We encountered an error while retrieving the archives."}
                        </p>
                    </div>

                    {isMissingTable && (
                        <div className="bg-card/50 border border-border rounded-lg p-6 text-left space-y-4">
                            <p className="text-sm font-medium text-foreground">Required Action:</p>
                            <p className="text-sm text-muted-foreground">Run the setup SQL script in your Supabase Dashboard.</p>
                            <Link href="/setup" className="block w-full">
                                <div className="w-full text-xs font-mono bg-primary/10 text-primary p-3 rounded border border-primary/20 text-center hover:bg-primary/20 transition-colors cursor-pointer flex items-center justify-center gap-2">
                                    <span>View Setup Instructions & Copy Script</span>
                                    <span>&rarr;</span>
                                </div>
                            </Link>
                        </div>
                    )}

                    {!isMissingTable && (
                        <pre className="text-xs bg-muted p-4 rounded text-left overflow-auto max-w-sm mx-auto opacity-70 border border-border">
                            {JSON.stringify(error, null, 2)}
                        </pre>
                    )}

                    <Link href="/">
                        <span className="inline-block mt-4 text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 cursor-pointer">
                            Return Home
                        </span>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <main className="min-h-screen bg-background relative overflow-hidden">
            {/* Background Atmosphere */}
            <div className="fixed inset-0 pointer-events-none noise-overlay" />
            <div className="fixed inset-0 pointer-events-none vignette-overlay" />
            <div className="fixed inset-0 pointer-events-none living-gradient opacity-30" />

            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 p-6 md:p-8 flex justify-between items-center z-50">
                <Link href="/">
                    <span className="font-serif italic text-muted-foreground hover:text-foreground transition-colors opacity-70">Home</span>
                </Link>
                <div className="flex gap-4 items-center">
                    {user ? (
                        <>
                            <Link href="/admin/add-story" className="text-sm font-medium hover:text-primary transition-colors">Add Story</Link>
                            <Link href="/my-library" className="text-sm font-medium hover:text-primary transition-colors">My Library</Link>
                        </>
                    ) : (
                        <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">Login</Link>
                    )}
                    <ThemeToggle />
                </div>
            </nav>

            <div className="container mx-auto px-4 py-24 md:py-32 relative z-10">
                <header className="mb-20 max-w-2xl">
                    <div className="space-y-2 mb-6">
                        <h1 className="font-serif text-5xl md:text-7xl font-medium tracking-tighter text-foreground">
                            The Library
                        </h1>
                        {genre && (
                            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-4 duration-1000">
                                <span className="text-muted-foreground italic">Curated for your mood:</span>
                                <Badge variant="secondary" className="text-xs uppercase tracking-widest">{genre}</Badge>
                            </div>
                        )}
                    </div>
                    <p className="text-lg md:text-xl text-muted-foreground font-light leading-relaxed max-w-prose">
                        A collection of moments, captured in silence.
                        Select a story to enter its world. Read, listen, or let it unfold around you.
                    </p>
                </header>

                {displayStories && displayStories.length > 0 ? (
                    <StoryGrid stories={displayStories} />
                ) : (
                    <div className="h-[40vh] flex flex-col items-center justify-center text-center space-y-4 border border-dashed border-border/30 rounded-lg bg-card/20">
                        <p className="text-muted-foreground italic font-serif text-xl">
                            The library is currently quiet.
                        </p>
                    </div>
                )}
            </div>
        </main>
    )
}
