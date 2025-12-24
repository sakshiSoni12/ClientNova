
"use client"

import React, { useEffect, useRef } from "react"
import { useTheme } from "next-themes"

interface Particle {
    x: number
    y: number
    opacity: number
    speedX: number
    speedY: number
    size: number
}

const FloatingParticles = () => {
    const containerRef = useRef<HTMLDivElement>(null)
    const particlesRef = useRef<Particle[]>([])
    const requestRef = useRef<number | null>(null)
    const { resolvedTheme } = useTheme()

    // Replaces useReducedMotion with native implementation
    const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false)

    const [mounted, setMounted] = React.useState(false)

    useEffect(() => {
        setMounted(true)
        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
        setPrefersReducedMotion(mediaQuery.matches)

        const handleChange = () => setPrefersReducedMotion(mediaQuery.matches)
        mediaQuery.addEventListener("change", handleChange)
        return () => mediaQuery.removeEventListener("change", handleChange)
    }, [])

    useEffect(() => {
        if (prefersReducedMotion || !mounted) return

        const container = containerRef.current
        if (!container) return

        const particleCount = 20
        const particles: Particle[] = []

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * 100, // percentage
                y: Math.random() * 100, // percentage
                opacity: Math.random() * 0.3 + 0.1,
                speedX: (Math.random() - 0.5) * 0.05,
                speedY: (Math.random() - 0.5) * 0.05,
                size: Math.random() * 3 + 1
            })
        }
        particlesRef.current = particles

        const updateParticles = () => {
            if (!containerRef.current) return

            particlesRef.current.forEach(p => {
                p.x += p.speedX
                p.y += p.speedY

                // Wrap around
                if (p.x < 0) p.x = 100
                if (p.x > 100) p.x = 0
                if (p.y < 0) p.y = 100
                if (p.y > 100) p.y = 0
            })

            const particleElements = containerRef.current.children
            for (let i = 0; i < particleElements.length; i++) {
                const el = particleElements[i] as HTMLElement
                const p = particlesRef.current[i]
                el.style.transform = `translate3d(${p.x}vw, ${p.y}vh, 0)`
            }

            requestRef.current = requestAnimationFrame(updateParticles)
        }

        requestRef.current = requestAnimationFrame(updateParticles)

        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current)
        }
    }, [prefersReducedMotion, mounted])

    if (prefersReducedMotion || !mounted) return null

    const particleColor = resolvedTheme === "light" ? "bg-black" : "bg-white"

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 pointer-events-none z-[-5] overflow-hidden"
            aria-hidden="true"
        >
            {Array.from({ length: 20 }).map((_, i) => (
                <div
                    key={i}
                    className={`absolute rounded-full blur-[1px] ${particleColor}`}
                    style={{
                        top: 0,
                        left: 0,
                        width: `${Math.random() * 3 + 1}px`,
                        height: `${Math.random() * 3 + 1}px`,
                        opacity: 0.15,
                        willChange: "transform"
                    }}
                />
            ))}
        </div>
    )
}

export default FloatingParticles
