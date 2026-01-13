"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { StoryPage } from "@/lib/stories"
import { cn } from "@/lib/utils"
// import { ChevronLeft, ChevronRight } from "lucide-react" // Removed icons for cleaner look as requested
import { Button } from "@/components/ui/button"
import { usePageTurnSound } from "./usePageTurnSound"

interface BookReaderProps {
    pages: StoryPage[]
    currentPage: number
    onPageChange: (page: number) => void
    fontSize?: 'sm' | 'md' | 'lg'
}

export function BookReader({ pages, currentPage, onPageChange, fontSize = 'md' }: BookReaderProps) {
    const [direction, setDirection] = useState(0)
    const { triggerTurnStart, triggerTurnMain, triggerTurnEnd } = usePageTurnSound()

    // Corner anticipation state
    const [hoverCorner, setHoverCorner] = useState<'left' | 'right' | null>(null)

    // Sort pages just in case
    const sortedPages = [...pages].sort((a, b) => a.page_number - b.page_number)
    const pageContent = sortedPages[currentPage - 1]
    const totalPages = sortedPages.length

    const paginate = (newDirection: number) => {
        const nextPage = currentPage + newDirection
        if (nextPage >= 1 && nextPage <= totalPages) {
            triggerTurnMain('fast') // Trigger the "whoosh"
            setDirection(newDirection)
            onPageChange(nextPage)
        }
    }

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight") {
                triggerTurnStart()
                paginate(1)
            }
            if (e.key === "ArrowLeft") {
                triggerTurnStart()
                paginate(-1)
            }
        }
        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [currentPage])

    // Physics constants
    const BEND_ANGLE = 4
    const SKEW_AMOUNT = 1

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 20 : -20, // Reduced distance for subtlety
            opacity: 0,
            rotateY: direction > 0 ? BEND_ANGLE * 2 : -BEND_ANGLE * 2, // Start slightly bent
            skewY: direction > 0 ? SKEW_AMOUNT : -SKEW_AMOUNT,
            scale: 0.98, // Slight depth scale
            filter: "brightness(0.95) blur(1px)", // Shadow/blur effect
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            rotateY: 0,
            skewY: 0,
            scale: 1,
            filter: "brightness(1) blur(0px)",
            transition: {
                duration: 0.6,
                type: "spring" as "spring",
                stiffness: 100,
                damping: 20,
                mass: 1.2
            }
        },
        exit: (direction: number) => ({
            zIndex: 2, // Exit page stays on top momentarily (like real page turning over)
            x: direction < 0 ? 40 : -40,
            opacity: 0,
            rotateY: direction < 0 ? BEND_ANGLE * 3 : -BEND_ANGLE * 3, // Bend more as it leaves
            skewY: direction < 0 ? -SKEW_AMOUNT : SKEW_AMOUNT,
            scale: 0.98,
            filter: "brightness(0.9) blur(1px)", // Darkens as it turns away
            transition: {
                duration: 0.5,
                ease: "easeInOut" as "easeInOut"
            }
        }),
    }

    const handleAnimationComplete = () => {
        triggerTurnEnd() // Trigger "settle" sound
    }

    return (
        <div className="relative w-full max-w-2xl mx-auto h-full min-h-[70vh] flex flex-col items-center justify-center perspective-2000">

            {/* Paper Container */}
            <motion.div
                className="relative w-full bg-[#fdfbf7] dark:bg-[#1a1c29] rounded-sm shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] min-h-[600px] border-l border-r border-[#e3e1dd] dark:border-white/5 overflow-hidden flex flex-col origin-center"
                animate={{
                    rotateY: hoverCorner === 'right' ? -1 : hoverCorner === 'left' ? 1 : 0, // Very subtle container tilt
                    rotateZ: hoverCorner === 'right' ? -0.5 : hoverCorner === 'left' ? 0.5 : 0,
                }}
                transition={{ duration: 0.4, ease: "easeOut" }}
            >
                {/* Paper Texture & Lighting Gradient */}
                {/* Texture */}
                <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-multiply dark:mix-blend-overlay"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
                />

                {/* Spine Shadow */}
                <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-black/20 to-transparent pointer-events-none z-10 mix-blend-multiply dark:mix-blend-soft-light" />
                {/* Right Edge highlight/shadow */}
                <div className="absolute inset-y-0 right-0 w-4 bg-gradient-to-l from-black/5 to-transparent pointer-events-none z-10" />

                {/* Content Layer */}
                <AnimatePresence initial={false} custom={direction} mode="popLayout">
                    {/* popLayout helps keeps pages overlapping correctly during turn */}
                    <motion.div
                        key={currentPage}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        onAnimationComplete={handleAnimationComplete}
                        className="absolute inset-0 flex flex-col bg-[#fdfbf7] dark:bg-[#1a1c29]" // Each page needs its own background for the 3D effect to look solid
                    >
                        {/* Page Header (Chapter/Number) */}
                        <div className="flex justify-between items-center p-8 md:p-10 text-[9px] tracking-[0.3em] font-medium uppercase text-muted-foreground border-b border-black/5 dark:border-white/5">
                            <span>{pageContent?.chapter_title || `Chapter ${Math.ceil(currentPage / 3)}`}</span>
                            <span>{currentPage} &middot; {totalPages}</span>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 px-8 md:px-16 py-10 overflow-y-auto pointer-events-auto relative z-10">
                            <div className={cn(
                                "font-serif text-foreground/90 leading-loose prose dark:prose-invert prose-p:mb-6 prose-p:last:mb-0 mx-auto max-w-none selection:bg-primary/20",
                                fontSize === 'sm' && "text-base",
                                fontSize === 'md' && "text-lg",
                                fontSize === 'lg' && "text-xl",
                            )}>
                                {pageContent?.content_text.split('\n\n').map((para, i) => (
                                    <p key={i}>{para}</p>
                                ))}
                                {/* End of page ornament */}
                                <div className="flex justify-center mt-12 mb-4 opacity-30">
                                    <span className="font-serif italic text-xl">~</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Anticipation / Navigation Triggers (Invisible tap areas) */}
                {/* Previous Page Zone (Left 15%) */}
                <div
                    className={cn("absolute left-0 top-0 bottom-0 w-[15%] cursor-pointer transition-opacity duration-300 z-50", currentPage <= 1 ? "hidden" : "")}
                    onMouseEnter={() => { setHoverCorner('left'); }}
                    onMouseLeave={() => setHoverCorner(null)}
                    onClick={() => paginate(-1)}
                >
                    {/* Visual Hint on Hover */}
                    <div className={cn("w-full h-full bg-gradient-to-r from-black/5 to-transparent opacity-0 transition-opacity duration-500", hoverCorner === 'left' ? "opacity-100" : "")} />
                </div>

                {/* Next Page Zone (Right 15%) */}
                <div
                    className={cn("absolute right-0 top-0 bottom-0 w-[15%] cursor-pointer transition-opacity duration-300 z-50", currentPage >= totalPages ? "hidden" : "")}
                    onMouseEnter={() => { setHoverCorner('right'); }}
                    onMouseLeave={() => setHoverCorner(null)}
                    onClick={() => paginate(1)}
                >
                    {/* Visual Hint on Hover: Page curl shadow effect */}
                    <div className={cn("absolute right-0 w-full h-full bg-gradient-to-l from-black/10 to-transparent opacity-0 transition-opacity duration-500", hoverCorner === 'right' ? "opacity-100" : "")} />
                </div>

            </motion.div>

            {/* Page Depth Effect Removed */}

        </div>
    )
}
