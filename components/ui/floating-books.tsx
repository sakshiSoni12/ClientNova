"use client"

import { useEffect, useState, useRef } from "react"
import { motion, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion"
import { Book3D } from "./book-3d"

// Configuration
const BOOK_COUNT = 15
const COLORS = [
    "#2D2A32", // Dark Charcoal
    "#4A3B32", // Leather Brown
    "#3E3640", // Muted Eggplant
    "#5C5346", // Army/Taupe
    "#2C333A", // Midnight Slate
    "#8C3A3A", // Deep Red (Rare)
]

interface FloatingBookData {
    id: number
    x: number // %
    y: number // %
    scale: number
    rotation: { x: number; y: number; z: number }
    color: string
    texture: "leather" | "parchment" | "matte" | "cloth"
    delay: number
    duration: number
}

export function FloatingBooks() {
    const [books, setBooks] = useState<FloatingBookData[]>([])

    // Mouse Parallax
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    // Smooth mouse Spring
    const springX = useSpring(mouseX, { stiffness: 40, damping: 20 })
    const springY = useSpring(mouseY, { stiffness: 40, damping: 20 })

    // Initialize randomized books
    useEffect(() => {
        const newBooks = Array.from({ length: BOOK_COUNT }).map((_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            scale: 0.5 + Math.random() * 0.6, // 0.5 to 1.1
            rotation: {
                x: Math.random() * 40 - 20,
                y: Math.random() * 30 - 15,
                z: Math.random() * 360,
            },
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            texture: Math.random() > 0.6 ? "leather" : (Math.random() > 0.5 ? "cloth" : "matte"),
            delay: Math.random() * 5,
            duration: 15 + Math.random() * 10, // 15-25s slow loop
        })) as FloatingBookData[]

        setBooks(newBooks)

        const handleMouseMove = (e: MouseEvent) => {
            const { innerWidth, innerHeight } = window
            // Normalize -1 to 1
            mouseX.set((e.clientX / innerWidth) * 2 - 1)
            mouseY.set((e.clientY / innerHeight) * 2 - 1)
        }

        window.addEventListener("mousemove", handleMouseMove)
        return () => window.removeEventListener("mousemove", handleMouseMove)
    }, [mouseX, mouseY])

    // ScrollParallax
    const { scrollYProgress } = useScroll()
    const blurVal = useTransform(scrollYProgress, [0, 1], [0, 4])

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-[0]">
            {books.map((book) => (
                <AnimatedBook
                    key={book.id}
                    data={book}
                    mouseX={springX}
                    mouseY={springY}
                />
            ))}
        </div>
    )
}

function AnimatedBook({
    data,
    mouseX,
    mouseY
}: {
    data: FloatingBookData,
    mouseX: any,
    mouseY: any
}) {
    // Parallax strength based on "depth" (scale)
    // Larger books (closer) move more? Or smaller (further) move slower?
    // Let's standard parallax: Closer things move faster.
    const parallaxFactor = data.scale * 30

    const x = useTransform(mouseX, (val: number) => val * parallaxFactor)
    const y = useTransform(mouseY, (val: number) => val * parallaxFactor)

    return (
        <motion.div
            style={{
                position: "absolute",
                left: `${data.x}%`,
                top: `${data.y}%`,
                x,
                y,
                opacity: 0.1 + (data.scale * 0.08), // Subtle but visible
                filter: data.scale < 0.7 ? "blur(3px)" : "blur(0px)", // Distant = blurred
            }}
            animate={{
                y: [0, -40, 0], // Bobbing
                rotateX: [data.rotation.x, data.rotation.x + 10, data.rotation.x],
                rotateY: [data.rotation.y, data.rotation.y - 15, data.rotation.y],
                rotateZ: [data.rotation.z, data.rotation.z + 5, data.rotation.z]
            }}
            transition={{
                duration: data.duration,
                repeat: Infinity,
                ease: "easeInOut",
                delay: data.delay
            }}
        >
            <Book3D
                color={data.color}
                texture={data.texture}
                scale={data.scale}
                // Determine rotation for the 3D model itself
                rotation={{ x: 60, y: 0, z: 0 }} // Base tilt so we see cover + spine
            />
        </motion.div>
    )
}
