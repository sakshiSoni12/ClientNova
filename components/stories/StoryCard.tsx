"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Story } from "@/lib/stories"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trash2, BookOpen, Headphones, Clock } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { deleteStory } from "@/lib/stories"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface StoryCardProps {
    story: Story
    index?: number
}

export function StoryCard({ story, index = 0 }: StoryCardProps) {
    const router = useRouter()

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault() // Prevent link navigation
        e.stopPropagation()

        try {
            const supabase = createClient()
            await deleteStory(supabase, story.id)
            router.refresh()
        } catch (error: any) {
            console.error("Failed to delete story:", error)
            alert(error.message || "Failed to delete story. Please try again.")
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
        >
            <div className="relative group">
                <Link href={`/stories/${story.id}`}>
                    <Card className="group relative overflow-hidden border-border/40 bg-card/40 backdrop-blur-sm transition-all duration-500 hover:border-primary/50 hover:bg-card/60 hover:shadow-2xl hover:shadow-primary/5">
                        {/* Hover Glow Effect */}
                        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0 opacity-0 transition-opacity duration-700 group-hover:from-primary/5 group-hover:to-accent/5 group-hover:opacity-100" />

                        <CardHeader className="space-y-4 pb-2 p-6">
                            <div className="flex items-center justify-between">
                                <Badge variant="outline" className="border-primary/40 bg-primary/5 text-xs font-medium tracking-widest text-primary uppercase">
                                    {story.genre}
                                </Badge>
                                <span className="text-xs font-medium tracking-widest text-muted-foreground uppercase pr-8">
                                    {story.emotional_tone}
                                </span>
                            </div>
                            <CardTitle className="font-serif text-2xl font-light tracking-wide text-foreground transition-colors group-hover:text-primary">
                                {story.title}
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-4 px-6">
                            <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground/90 font-sans">
                                {story.synopsis}
                            </p>
                        </CardContent>

                        <CardFooter className="flex items-center justify-between border-t border-border/20 pt-4 px-6 pb-6 text-xs text-muted-foreground">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5 transition-colors group-hover:text-foreground">
                                    <BookOpen className="h-3.5 w-3.5" />
                                    <span>{story.reading_time}</span>
                                </div>
                                <div className="flex items-center gap-1.5 transition-colors group-hover:text-foreground">
                                    <Headphones className="h-3.5 w-3.5" />
                                    <span>{story.listening_time}</span>
                                </div>
                            </div>

                            <div className="opacity-0 transition-opacity duration-300 group-hover:opacity-100 text-primary font-medium tracking-wider text-[10px] uppercase">
                                Enter Story &rarr;
                            </div>
                        </CardFooter>
                    </Card>
                </Link>

                <div className="absolute top-3 right-3 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors bg-background/50 backdrop-blur-sm"
                        onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            if (window.confirm(`Are you sure you want to delete "${story.title}"?\n\nThis action cannot be undone.`)) {
                                handleDelete(e)
                            }
                        }}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </motion.div>
    )
}
