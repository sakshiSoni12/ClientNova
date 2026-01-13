"use client"

import { motion } from "framer-motion"
import { useMemo } from "react"
import { cn } from "@/lib/utils"

type BookTexture = "leather" | "parchment" | "matte" | "cloth"

interface Book3DProps {
    texture?: BookTexture
    color?: string
    opacity?: number
    blur?: number
    scale?: number
    rotation?: { x: number; y: number; z: number }
    className?: string
}

export function Book3D({
    texture = "matte",
    color = "#8b5cf6",
    opacity = 1,
    blur = 0,
    scale = 1,
    rotation = { x: 0, y: 0, z: 0 },
    className,
}: Book3DProps) {

    // book dimensions relative to scale
    const width = 140 * scale
    const height = 200 * scale
    const depth = 25 * scale

    // Generate random variation for organic feel
    const textureStyle = useMemo(() => {
        switch (texture) {
            case "leather":
                return {
                    backgroundImage: `linear-gradient(to right, ${color}cc, ${color}), url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.15'/%3E%3C/svg%3E")`,
                    boxShadow: `inset 2px 0 5px rgba(0,0,0,0.3)`
                }
            case "parchment":
                return {
                    backgroundColor: color,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.1'/%3E%3C/svg%3E")`,
                }
            case "cloth":
                return {
                    backgroundColor: color,
                    backgroundImage: `linear-gradient(0deg, rgba(0,0,0,0.05) 50%, transparent 50%), linear-gradient(90deg, rgba(0,0,0,0.05) 50%, transparent 50%)`,
                    backgroundSize: "4px 4px",
                }
            default: // matte
                return {
                    backgroundColor: color,
                    background: `linear-gradient(135deg, ${color}, ${color}dd)`
                }
        }
    }, [texture, color])

    return (
        <div
            className={cn("relative preserve-3d", className)}
            style={{
                width,
                height,
                opacity,
                filter: `blur(${blur}px)`,
                transformStyle: "preserve-3d",
                transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z}deg)`,
            }}
        >
            {/* Front Cover */}
            <div
                className="absolute inset-0 rounded-r-sm shadow-xl backface-hidden"
                style={{
                    ...textureStyle,
                    transform: `translateZ(${depth / 2}px)`,
                }}
            >
                {/* Subtle Border/Deboss */}
                <div className="absolute inset-2 border border-black/10 rounded-r-sm opacity-50" />
            </div>

            {/* Back Cover */}
            <div
                className="absolute inset-0 rounded-l-sm backface-hidden"
                style={{
                    ...textureStyle,
                    transform: `translateZ(-${depth / 2}px) rotateY(180deg)`,
                }}
            />

            {/* Spine */}
            <div
                className="absolute top-0 bottom-0 w-full backface-hidden"
                style={{
                    ...textureStyle,
                    width: depth,
                    left: -depth / 2,
                    transform: `rotateY(-90deg) translateZ(${depth / 2}px)`,
                    filter: "brightness(0.9)", // slightly darker spine
                }}
            />

            {/* Pages (Right Side) */}
            <div
                className="absolute top-1 bottom-1 right-0 bg-[#fdfbf6] backface-hidden"
                style={{
                    width: depth - 2,
                    transform: `rotateY(90deg) translateZ(${width - depth / 2 - 1}px)`,
                    background: `repeating-linear-gradient(90deg, #fdfbf6, #fdfbf6 1px, #e8e4d9 2px)`,
                }}
            />

            {/* Pages (Top) */}
            <div
                className="absolute top-0 left-0 right-1 bg-[#fdfbf6] backface-hidden"
                style={{
                    height: depth - 2,
                    transform: `rotateX(90deg) translateZ(${depth / 2 - 1}px)`,
                    background: `repeating-linear-gradient(0deg, #fdfbf6, #fdfbf6 1px, #e8e4d9 2px)`,
                }}
            />

            {/* Pages (Bottom) */}
            <div
                className="absolute bottom-0 left-0 right-1 bg-[#fdfbf6] backface-hidden"
                style={{
                    height: depth - 2,
                    transform: `rotateX(-90deg) translateZ(${height - depth / 2 - 1}px)`,
                    background: `repeating-linear-gradient(0deg, #fdfbf6, #fdfbf6 1px, #e8e4d9 2px)`,
                }}
            />
        </div>
    )
}
