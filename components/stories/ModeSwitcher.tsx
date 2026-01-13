"use client"

import { Button } from "@/components/ui/button"
import { BookOpen, Headphones, Sparkles, X } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface ModeSwitcherProps {
    currentMode: 'read' | 'listen' | 'hybrid'
    onModeChange: (mode: 'read' | 'listen' | 'hybrid') => void
    onExit: () => void
}

export function ModeSwitcher({ currentMode, onModeChange, onExit }: ModeSwitcherProps) {
    const modes = [
        { id: 'read', icon: BookOpen, label: 'Read' },
        { id: 'hybrid', icon: Sparkles, label: 'Hybrid' },
        { id: 'listen', icon: Headphones, label: 'Listen' },
    ] as const

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 p-1.5 rounded-full bg-background/80 backdrop-blur-md border border-border/40 shadow-xl"
        >
            {modes.map((mode) => (
                <button
                    key={mode.id}
                    onClick={() => onModeChange(mode.id)}
                    className={cn(
                        "relative px-4 py-2 rounded-full text-[10px] uppercase tracking-widest transition-all duration-300 flex items-center gap-2",
                        currentMode === mode.id
                            ? "text-background"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                >
                    {currentMode === mode.id && (
                        <motion.div
                            layoutId="activeMode"
                            className="absolute inset-0 bg-foreground rounded-full -z-10"
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                    )}
                    <mode.icon className="h-3 w-3" />
                    <span className="hidden sm:inline">{mode.label}</span>
                </button>
            ))}

            <div className="w-px h-4 bg-border/50 mx-1" />

            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={onExit}
            >
                <X className="h-4 w-4" />
            </Button>
        </motion.div>
    )
}
