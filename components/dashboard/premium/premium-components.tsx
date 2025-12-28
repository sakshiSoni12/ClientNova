"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

export const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: i * 0.1,
            duration: 0.5,
            ease: "easeOut"
        }
    })
}

export const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
}

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
    className?: string
    delay?: number
}

export function GlassCard({ children, className, delay = 0, ...props }: GlassCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
            className={cn(
                "relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl",
                className
            )}
            {...props}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
            <div className="relative z-10 p-6">{children}</div>
        </motion.div>
    )
}

interface StatCardProps {
    title: string
    value: string
    trend?: string
    trendUp?: boolean
    icon: LucideIcon
    color: string
    index: number
}

export function StatCard({ title, value, trend, trendUp, icon: Icon, color, index }: StatCardProps) {
    return (
        <GlassCard delay={index * 0.1} className="group hover:bg-black/50 transition-colors duration-300">
            <div className="flex justify-between items-start mb-4">
                <div className={cn("p-3 rounded-xl bg-gradient-to-br opacity-80 group-hover:opacity-100 transition-opacity", color)}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
                {trend && (
                    <div className={cn("text-xs font-semibold px-2 py-1 rounded-full bg-white/5 border border-white/5", trendUp ? "text-emerald-400" : "text-rose-400")}>
                        {trend}
                    </div>
                )}
            </div>
            <div>
                <h3 className="text-muted-foreground text-sm font-medium mb-1">{title}</h3>
                <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
            </div>
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
        </GlassCard>
    )
}

export function PremiumHeader({ title, subtitle }: { title: string, subtitle: string }) {
    return (
        <div className="mb-8">
            <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-4xl font-bold tracking-tight text-white mb-2"
            >
                {title}
            </motion.h1>
            <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-muted-foreground text-lg"
            >
                {subtitle}
            </motion.p>
        </div>
    )
}
