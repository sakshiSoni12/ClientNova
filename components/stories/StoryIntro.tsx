"use client"

import { motion } from "framer-motion"
import { Story } from "@/lib/stories"
import { Button } from "@/components/ui/button"
import { BookOpen, Headphones, Sparkles } from "lucide-react"

interface StoryIntroProps {
    story: Story
    onStart: (mode: 'read' | 'listen' | 'hybrid') => void
}

export function StoryIntro({ story, onStart }: StoryIntroProps) {
    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center p-6 text-center z-50">

            {/* Content */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                className="max-w-3xl space-y-12 relative z-10"
            >
                {/* Meta */}
                <div className="space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="flex items-center justify-center gap-4 text-xs font-medium tracking-[0.2em] text-primary uppercase"
                    >
                        <span>{story.genre}</span>
                        <span className="h-1 w-1 rounded-full bg-primary/40" />
                        <span>{story.emotional_tone}</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        className="font-serif text-5xl md:text-7xl lg:text-8xl font-light tracking-tight text-foreground"
                    >
                        {story.title}
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6, duration: 1 }}
                        className="text-lg md:text-xl text-muted-foreground font-light leading-relaxed max-w-xl mx-auto italic font-serif"
                    >
                        &ldquo;{story.synopsis}&rdquo;
                    </motion.p>
                </div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 1 }}
                    className="flex items-center justify-center gap-8 text-sm text-muted-foreground/80"
                >
                    <div className="flex flex-col items-center gap-1">
                        <BookOpen className="h-4 w-4 mb-1" />
                        <span className="tracking-widest uppercase text-[10px]">Read</span>
                        <span>{story.reading_time}</span>
                    </div>
                    <div className="w-px h-8 bg-border/40" />
                    <div className="flex flex-col items-center gap-1">
                        <Headphones className="h-4 w-4 mb-1" />
                        <span className="tracking-widest uppercase text-[10px]">Listen</span>
                        <span>{story.listening_time}</span>
                    </div>
                </motion.div>

                {/* Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1, duration: 0.8 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8"
                >
                    <Button
                        size="lg"
                        variant="outline"
                        className="h-14 px-8 min-w-[160px] text-xs uppercase tracking-widest bg-transparent border-foreground/10 hover:bg-foreground/5 hover:text-foreground hover:border-foreground/30 transition-all duration-500"
                        onClick={() => onStart('read')}
                    >
                        <BookOpen className="mr-2 h-4 w-4" />
                        Read
                    </Button>

                    <Button
                        size="lg"
                        className="h-14 px-10 min-w-[180px] text-xs uppercase tracking-widest bg-foreground text-background hover:bg-foreground/90 transition-all duration-500 shadow-[0_0_30px_-5px_var(--primary)]"
                        onClick={() => onStart('hybrid')}
                    >
                        <Sparkles className="mr-2 h-4 w-4" />
                        Experience
                    </Button>

                    <Button
                        size="lg"
                        variant="outline"
                        className="h-14 px-8 min-w-[160px] text-xs uppercase tracking-widest bg-transparent border-foreground/10 hover:bg-foreground/5 hover:text-foreground hover:border-foreground/30 transition-all duration-500"
                        onClick={() => onStart('listen')}
                    >
                        <Headphones className="mr-2 h-4 w-4" />
                        Listen
                    </Button>
                </motion.div>

                {/* Hint */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 1 }}
                    className="text-[10px] text-muted-foreground/60 uppercase tracking-[0.3em] absolute bottom-[-100px] left-0 right-0"
                >
                    Headphones Recommended
                </motion.div>

            </motion.div>
        </div>
    )
}
