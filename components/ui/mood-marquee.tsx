"use client"

import { motion } from "framer-motion"

const moods = [
    "Melancholy", "Euphoria", "Silence", "Nostalgia", "Desire",
    "Solitude", "Wonder", "Grief", "Hope", "Mystery", "Peace"
]

export function MoodMarquee() {
    return (
        <div className="relative w-full overflow-hidden py-12 md:py-24 border-t border-foreground/5 bg-background/30 backdrop-blur-sm">
            <div className="absolute inset-0 pointer-events-none z-10 bg-gradient-to-r from-background via-transparent to-background" />

            <div className="flex whitespace-nowrap">
                <motion.div
                    className="flex gap-16 md:gap-32 px-16"
                    animate={{ x: "-50%" }}
                    transition={{ duration: 60, ease: "linear", repeat: Infinity }}
                >
                    {[...moods, ...moods, ...moods, ...moods].map((mood, i) => (
                        <span
                            key={`${mood}-${i}`}
                            className="text-4xl md:text-6xl lg:text-7xl font-serif italic font-bold opacity-80 text-foreground shrink-0 select-none"
                        >
                            {mood}
                        </span>
                    ))}
                </motion.div>
            </div>
        </div>
    )
}
