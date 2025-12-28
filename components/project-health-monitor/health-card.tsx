"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertTriangle,
    CheckCircle2,
    AlertOctagon,
    ChevronDown,
    Activity,
    CalendarClock,
    TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface HealthProject {
    id: string;
    name: string;
    status: string;
    progress: number;
    health: "Healthy" | "At Risk" | "Critical";
    reason: string;
    action: string;
    daysElapsed: number;
    daysTotal: number;
    expectedProgress: number;
    actualPace: number;
}

interface HealthCardProps {
    project: HealthProject;
}

export function HealthCard({ project }: HealthCardProps) {
    const [expanded, setExpanded] = useState(false);

    const isCritical = project.health === "Critical";
    const isAtRisk = project.health === "At Risk";
    const isHealthy = project.health === "Healthy";

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "rounded-2xl border bg-white overflow-hidden transition-all duration-300",
                isCritical ? "border-red-200 shadow-red-100 hover:shadow-red-200" :
                    isAtRisk ? "border-amber-200 shadow-amber-100 hover:shadow-amber-200" :
                        "border-emerald-200 shadow-emerald-100 hover:shadow-emerald-200",
                "shadow-lg hover:shadow-xl"
            )}
        >
            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="font-serif text-lg font-medium text-slate-900">{project.name}</h3>
                        <p className="text-xs text-slate-500 uppercase tracking-wide mt-1">
                            {project.status} • {project.progress}% Complete
                        </p>
                    </div>
                    <div className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5",
                        isCritical ? "bg-red-50 text-red-700" :
                            isAtRisk ? "bg-amber-50 text-amber-700" :
                                "bg-emerald-50 text-emerald-700"
                    )}>
                        {isCritical && <AlertOctagon className="w-3.5 h-3.5" />}
                        {isAtRisk && <AlertTriangle className="w-3.5 h-3.5" />}
                        {isHealthy && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {project.health}
                    </div>
                </div>

                {/* Metrics Bar */}
                <div className="flex items-center gap-6 mb-6 text-sm text-slate-600">
                    <div className="flex items-center gap-2" title="Pace vs Timeline (1.0 is perfect)">
                        <TrendingUp className={cn("w-4 h-4", project.actualPace < 0.8 ? "text-amber-500" : "text-emerald-500")} />
                        <span className="font-medium">{project.actualPace.toFixed(2)}x Pace</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CalendarClock className="w-4 h-4 text-slate-400" />
                        <span>Day {project.daysElapsed} of {project.daysTotal}</span>
                    </div>
                </div>

                {/* AI Insight */}
                <div className={cn(
                    "p-4 rounded-xl text-sm leading-relaxed border",
                    isCritical ? "bg-red-50/50 border-red-100 text-red-900" :
                        isAtRisk ? "bg-amber-50/50 border-amber-100 text-amber-900" :
                            "bg-slate-50 border-slate-100 text-slate-700"
                )}>
                    <div className="font-medium mb-1 flex items-center gap-2">
                        <Activity className="w-4 h-4 opacity-70" />
                        Analysis
                    </div>
                    {project.reason}
                </div>
            </div>

            {/* Expandable Action */}
            <div className="bg-slate-50/80 border-t border-slate-100 px-6 py-3">
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="flex items-center justify-between w-full text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-slate-800 transition-colors"
                >
                    Recommended Action
                    <ChevronDown className={cn("w-4 h-4 transition-transform", expanded && "rotate-180")} />
                </button>
                <AnimatePresence>
                    {expanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="pt-3 pb-2 text-sm text-indigo-900 font-medium leading-relaxed">
                                {project.action}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
