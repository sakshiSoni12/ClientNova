"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export function AnimatedBackground() {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    return (
        <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none bg-inherit">
            <div className="absolute inset-0 flex items-center justify-center opacity-40 mix-blend-multiply dark:mix-blend-screen">
                {/* 
                   The "Purple Blurry Motionable Flower" Effect 
                   created by overlapping, rotating, and scaling disparate blurred shapes
                */}

                {/* Petal/Orb 1 */}
                <motion.div
                    animate={{
                        scale: [1, 1.4, 1],
                        rotate: [0, 90, 0],
                        filter: ["blur(80px)", "blur(100px)", "blur(80px)"],
                    }}
                    transition={{
                        duration: 15,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute w-[600px] h-[600px] bg-purple-500/30 rounded-full mix-blend-screen"
                    style={{ x: -100, y: -100 }}
                />

                {/* Petal/Orb 2 */}
                <motion.div
                    animate={{
                        scale: [1, 1.5, 1],
                        rotate: [0, -90, 0],
                        x: [100, 150, 100],
                        filter: ["blur(90px)", "blur(120px)", "blur(90px)"],
                    }}
                    transition={{
                        duration: 18,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1
                    }}
                    className="absolute w-[500px] h-[500px] bg-indigo-500/30 rounded-full mix-blend-screen"
                />

                {/* Petal/Orb 3 */}
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        rotate: [0, 180, 0],
                        y: [100, 50, 100],
                        filter: ["blur(70px)", "blur(100px)", "blur(70px)"],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 2
                    }}
                    className="absolute w-[550px] h-[550px] bg-violet-500/30 rounded-full mix-blend-screen"
                    style={{ x: 50, y: 150 }}
                />

                {/* Core Center Glow */}
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute w-[300px] h-[300px] bg-fuchsia-500/20 rounded-full blur-[60px]"
                />
            </div>
        </div>
    )
}
