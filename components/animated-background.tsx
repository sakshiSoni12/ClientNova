"use client"

import { motion, useMotionValue, useSpring } from "framer-motion"
import { useEffect, useState } from "react"

export function AnimatedBackground() {
    const [mounted, setMounted] = useState(false)

    // Mouse tracking setup
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    // Smooth spring animation for the movement
    const springConfig = { damping: 25, stiffness: 150 }
    const x1 = useSpring(mouseX, springConfig)
    const y1 = useSpring(mouseY, springConfig)
    const x2 = useSpring(mouseX, { ...springConfig, damping: 30 }) // Slightly different damping for depth
    const y2 = useSpring(mouseY, { ...springConfig, damping: 30 })

    useEffect(() => {
        setMounted(true)

        const handleMouseMove = (e: MouseEvent) => {
            const { innerWidth, innerHeight } = window
            // Calculate normalized position (-0.5 to 0.5)
            const x = e.clientX / innerWidth - 0.5
            const y = e.clientY / innerHeight - 0.5

            // Set motion values (multiply by factor for movement range)
            mouseX.set(x * 100) // Move up to 100px
            mouseY.set(y * 100)
        }

        window.addEventListener("mousemove", handleMouseMove)
        return () => window.removeEventListener("mousemove", handleMouseMove)
    }, [mouseX, mouseY])

    return (
        <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none">
            {/* Interactive Orb 1 (Top Left) */}
            <motion.div
                style={{ x: x1, y: y1 }}
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                    scale: { duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
                    opacity: { duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }
                }}
                className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px]"
            />

            {/* Interactive Orb 2 (Bottom Right) */}
            <motion.div
                style={{ x: x2, y: y2 }} // Moves slightly differently for parallax
                animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.2, 0.4, 0.2],
                }}
                transition={{
                    scale: { duration: 12, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 2 },
                    opacity: { duration: 12, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 2 }
                }}
                className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px]"
            />

            {/* Floating particles - Client-side only */}
            {mounted && (
                <div className="absolute inset-0 opacity-20">
                    {[...Array(6)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{
                                x: Math.random() * 100 + "%",
                                y: Math.random() * 100 + "%",
                            }}
                            animate={{
                                y: [0, -100, 0],
                                x: [0, Math.random() * 50 - 25, 0],
                            }}
                            transition={{
                                duration: 20 + Math.random() * 10,
                                repeat: Number.POSITIVE_INFINITY,
                                ease: "linear",
                            }}
                            className="absolute w-2 h-2 bg-primary rounded-full blur-sm"
                            style={{
                                left: 0,
                                top: 0
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
