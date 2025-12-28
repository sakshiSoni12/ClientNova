"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Activity, ShieldCheck } from 'lucide-react';
import { HealthCard, HealthProject } from '@/components/project-health-monitor/health-card';

import { createClient } from "@/lib/supabase/client";

export default function ProjectHealthPage() {
    const [projects, setProjects] = useState<HealthProject[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHealth = async () => {
            try {
                // 1. Fetch raw projects from Supabase (Client-side bypasses API auth issues)
                const supabase = createClient();
                const { data: rawProjects, error } = await supabase
                    .from('projects')
                    .select('*')
                    .order('updated_at', { ascending: false });

                if (!rawProjects || rawProjects.length === 0) {
                    // console.log("No active projects found in DB (Client-side fetch)");
                    setLoading(false);
                    return;
                }

                // 2. OPTIMISTIC UPDATE: Show projects immediately with basic data
                // Match HealthProject interface strictly to avoid crashes
                const placeholderProjects: HealthProject[] = rawProjects.map((p: any) => ({
                    id: p.id,
                    name: p.name,
                    status: p.status || "active",
                    progress: p.progress || 0,

                    // Optimistic Defaults (Safe for HealthCard)
                    health: "Healthy",
                    reason: "Analyzing project velocity...",
                    action: "Waiting for AI assessment...",

                    // Numeric defaults to prevent calculation errors
                    daysElapsed: 0,
                    daysTotal: 1,
                    expectedProgress: 0,
                    actualPace: 1
                }));
                setProjects(placeholderProjects);
                setLoading(false);

                // 3. Send to API for AI Analysis (Background Update)
                const response = await fetch('/api/project-health-monitor', {
                    method: "POST",
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ projects: rawProjects })
                });

                const data = await response.json();
                if (data.insights && Array.isArray(data.insights) && data.insights.length > 0) {
                    setProjects(data.insights);
                }
            } catch (error) {
                console.error("Failed to fetch project health", error);
                // Keep the placeholder projects if API fails, so screen isn't empty
            } finally {
                setLoading(false);
            }
        };

        fetchHealth();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    return (
        <div className="min-h-screen bg-white md:bg-slate-50 p-8 space-y-8">
            {/* Header */}
            <header className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-serif text-slate-900 mb-3 flex items-center gap-3">
                        <ShieldCheck className="w-8 h-8 text-indigo-600" />
                        Project Health Monitor
                    </h1>
                    <p className="text-slate-700 max-w-2xl text-base leading-relaxed font-medium">
                        Our AI analyzes velocity, stagnation, and timeline risks to verify the true health of your portfolio.
                        No self-reported status — just raw signal analysis.
                    </p>
                </div>
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-200 shadow-sm text-xs font-bold text-slate-700">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    Powered by Senior PM Intelligence
                </div>
            </header>

            {/* Content */}
            {loading ? (
                <div className="flex flex-col items-center justify-center h-64 gap-4">
                    <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                    <span className="text-sm font-bold text-slate-400 animate-pulse tracking-widest uppercase">Analyzing Portfolio...</span>
                </div>
            ) : projects.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Activity className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900">No Active Projects</h3>
                    <p className="text-slate-500 text-sm mt-1">Start a project to see health insights.</p>
                </div>
            ) : (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                >
                    {projects.map((project) => (
                        <HealthCard key={project.id} project={project} />
                    ))}
                </motion.div>
            )}
        </div>
    );
}
