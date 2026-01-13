import { createClient } from "@/lib/supabase/server"
import { getUserLibrary } from "@/lib/stories"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { BookOpen, LogOut } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export const dynamic = 'force-dynamic'

export default async function MyLibraryPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login?next=/my-library')
    }

    const library = await getUserLibrary(supabase, user.id)

    return (
        <main className="min-h-screen bg-background relative overflow-hidden">
            {/* Atmosphere */}
            <div className="fixed inset-0 pointer-events-none noise-overlay" />
            <div className="fixed inset-0 pointer-events-none vignette-overlay" />

            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 p-6 md:p-8 flex justify-between items-center z-50">
                <Link href="/stories">
                    <span className="font-serif italic text-muted-foreground hover:text-foreground transition-colors opacity-70">← The Library</span>
                </Link>
                <div className="flex gap-4 items-center">
                    <ThemeToggle />
                </div>
            </nav>

            <div className="container mx-auto px-4 py-24 md:py-32 relative z-10">
                <header className="mb-12 border-b border-border/10 pb-8">
                    <h1 className="font-serif text-4xl md:text-5xl font-medium tracking-tight text-foreground mb-4">
                        My Library
                    </h1>
                    <p className="text-muted-foreground font-light text-lg">
                        Your journey through the silence.
                    </p>
                </header>

                {library.length > 0 ? (
                    <div className="grid gap-4">
                        {library.map((item) => (
                            <Link key={item.id} href={`/stories/${item.story.id}`}>
                                <div className="group relative overflow-hidden rounded-lg border border-border/20 bg-card/20 p-6 transition-all hover:bg-card/40 hover:border-primary/20">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3">
                                                <Badge variant="outline" className="text-[10px] uppercase tracking-widest bg-primary/5 border-primary/10 text-primary">
                                                    {item.story.genre}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground/60 uppercase tracking-wider">
                                                    Last read {new Date(item.updated_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <h3 className="text-2xl font-serif text-foreground group-hover:text-primary transition-colors">
                                                {item.story.title}
                                            </h3>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            <div className="flex flex-col items-end">
                                                <span className="text-sm font-medium text-foreground">
                                                    Page {item.last_page}
                                                </span>
                                                <span className="text-xs text-muted-foreground uppercase tracking-widest">
                                                    {item.preferred_mode} mode
                                                </span>
                                            </div>
                                            <div className="h-10 w-10 rounded-full border border-primary/20 flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                                                <BookOpen className="h-4 w-4" />
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 space-y-6 text-center border border-dashed border-border/20 rounded-xl bg-card/10">
                        <div className="h-16 w-16 rounded-full bg-muted/20 flex items-center justify-center text-muted-foreground">
                            <BookOpen className="h-6 w-6" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-serif text-xl">Your library is empty</h3>
                            <p className="text-muted-foreground max-w-sm mx-auto">
                                You haven't started any stories yet. Visit the main library to find your first book.
                            </p>
                        </div>
                        <Link href="/stories">
                            <span className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                                Explore Stories
                            </span>
                        </Link>
                    </div>
                )}
            </div>
        </main>
    )
}
