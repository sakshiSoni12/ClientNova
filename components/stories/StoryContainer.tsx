"use client"

import { useState, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Story, StoryPage, StoryAudio, UserProgress, saveUserProgress } from "@/lib/stories"
import { StoryIntro } from "./StoryIntro"
import { BookReader } from "./BookReader"
import { ModeSwitcher } from "./ModeSwitcher"
import { AudioPlayer } from "./AudioPlayer"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

interface StoryContainerProps {
    story: Story
    pages: StoryPage[]
    audioOptions: StoryAudio[]
    initialProgress: UserProgress | null
}

export function StoryContainer({ story, pages, audioOptions, initialProgress }: StoryContainerProps) {
    const [hasStarted, setHasStarted] = useState(false)
    const [mode, setMode] = useState<'read' | 'listen' | 'hybrid'>('read')
    const [audioLanguage, setAudioLanguage] = useState<string>('EN')
    const [ridingMode, setRidingMode] = useState(false)
    const [currentAudioId, setCurrentAudioId] = useState<string | null>(null)

    // Initialize from progress if available
    const [currentPage, setCurrentPage] = useState(initialProgress?.last_page || 1)

    // Filter audio for current language and sort by chapter_number (if available) or insertion order
    // Ensure we have a valid list for the playlist
    const playlist = audioOptions
        .filter(a => a.language === audioLanguage)
        // If sorting isn't happening in DB yet, we might want to sort here as fallback
        .sort((a, b) => (a.chapter_number || 0) - (b.chapter_number || 0))

    // Determine current audio
    const currentAudioIndex = currentAudioId
        ? playlist.findIndex(a => a.id === currentAudioId)
        : 0

    const currentAudio = playlist[currentAudioIndex !== -1 ? currentAudioIndex : 0]
    const hasNext = currentAudioIndex < playlist.length - 1

    // Update currentAudioId if it becomes invalid or on init
    useEffect(() => {
        if (!currentAudioId && playlist.length > 0) {
            setCurrentAudioId(playlist[0].id)
        }
    }, [playlist, currentAudioId])

    const handleNextTrack = () => {
        if (hasNext) {
            setCurrentAudioId(playlist[currentAudioIndex + 1].id)
        }
    }

    const handleAudioEnded = () => {
        if (ridingMode && hasNext) {
            handleNextTrack()
        }
    }

    const availableLanguages = Array.from(new Set(audioOptions.map(a => a.language)))

    // Save Progress Logic
    const saveProgress = async () => {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            await saveUserProgress(supabase, user.id, story.id, currentPage, mode)
        }
    }

    // Auto-save on page change (debounced ideally, but simple effect is okay for MVP)
    useEffect(() => {
        // ... (rest of effect)
    }, [currentPage, mode, hasStarted]) // removed effect body for brevity in replace, but we need to keep existing logic.
    // Wait, replace_file_content doesn't merge. I need to be careful not to delete the useEffect body.
    // Let me rewrite the useEffect fully in the replacement content to be safe.

    useEffect(() => {
        if (hasStarted) {
            const timer = setTimeout(() => {
                saveProgress()
            }, 2000)
            return () => clearTimeout(timer)
        }
    }, [currentPage, mode, hasStarted])


    const handleStart = (selectedMode: 'read' | 'listen' | 'hybrid') => {
        setMode(selectedMode)
        setHasStarted(true)
    }

    const handleExit = () => {
        saveProgress()
        setHasStarted(false)
    }

    return (
        <>
            <AnimatePresence mode="wait">
                {!hasStarted ? (
                    <motion.div
                        key="intro"
                        className="absolute inset-0 z-50 bg-background overflow-hidden"
                        exit={{ opacity: 0, scale: 1.05, filter: "blur(5px)" }}
                        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <div className="absolute top-6 left-6 z-[60]">
                            <Link href="/stories" className="flex items-center justify-center h-10 w-10 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                                <X className="h-5 w-5" />
                            </Link>
                        </div>
                        <StoryIntro story={story} onStart={handleStart} />
                    </motion.div>
                ) : (
                    <motion.div
                        key="reader"
                        className="absolute inset-0 z-40 bg-background/95 min-h-screen flex flex-col overflow-hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                    >
                        <ModeSwitcher currentMode={mode} onModeChange={setMode} onExit={handleExit} />

                        <div className="flex-1 flex flex-col items-center justify-center p-4 relative">

                            {/* Book Reader */}
                            {mode !== 'listen' && (
                                <motion.div
                                    layout
                                    className="w-full h-full flex items-center justify-center"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    <BookReader
                                        pages={pages}
                                        currentPage={currentPage}
                                        onPageChange={setCurrentPage}
                                    />
                                </motion.div>
                            )}

                            {/* Audio Player Container */}
                            {(mode === 'listen' || mode === 'hybrid') && (
                                <motion.div
                                    initial={{ y: 100, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: 100, opacity: 0 }}
                                    className={cn(
                                        "z-30 transition-all duration-500",
                                        mode === 'listen'
                                            ? "absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-xl"
                                            : "fixed bottom-8 right-8 w-[320px]"
                                    )}
                                >
                                    {currentAudio ? (
                                        <AudioPlayer
                                            audio={currentAudio}
                                            mode={mode}
                                            availableLanguages={availableLanguages}
                                            onLanguageChange={setAudioLanguage}
                                            onEnded={handleAudioEnded}
                                            autoPlay={ridingMode} // If riding mode is on, we auto-play next tracks
                                            ridingMode={ridingMode}
                                            onToggleRidingMode={() => setRidingMode(!ridingMode)}
                                            hasNext={hasNext}
                                            onNext={handleNextTrack}
                                        />
                                    ) : (
                                        <div className="bg-card/80 backdrop-blur border border-border/50 p-6 rounded-2xl text-center space-y-2">
                                            <p className="text-muted-foreground font-serif italic">The silence is absolute.</p>
                                            <p className="text-xs text-muted-foreground opacity-70">No audio recording found for this story.</p>
                                        </div>
                                    )}

                                    {/* Listen Mode Background Title */}
                                    {mode === 'listen' && (
                                        <div className="absolute top-24 left-0 right-0 text-center pointer-events-none -z-10">
                                            <h2 className="text-4xl md:text-6xl font-serif text-foreground/5">{story.title}</h2>
                                        </div>
                                    )}
                                </motion.div>
                            )}


                            {/* Empty state for Listen Mode - just art */}
                            {mode === 'listen' && (
                                <div className="absolute inset-0 -z-10">
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5 opacity-50" />
                                </div>
                            )}

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
