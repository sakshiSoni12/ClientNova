"use client";

import React, { useEffect, useState } from 'react';
import { AreaChart, TrendingUp, TrendingDown, Minus, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Trend {
    category: string;
    insight: string;
    sentiment: "positive" | "negative" | "neutral";
}

export function InsightsTimeline() {
    const [trends, setTrends] = useState<Trend[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrends = async () => {
            try {
                const res = await fetch('/api/insights-timeline');
                const json = await res.json();
                if (json.trends) setTrends(json.trends);
            } catch (e) {
                console.error("Trends error", e);
            } finally {
                setLoading(false);
            }
        };
        fetchTrends();
    }, []);

    if (loading) return <div className="animate-pulse h-64 bg-slate-50 rounded-xl" />;

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
                <div className="bg-indigo-50 p-2 rounded-lg">
                    <AreaChart className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                    <h3 className="text-lg font-serif font-medium text-slate-900">Intelligence Timeline</h3>
                    <p className="text-xs text-slate-500">Analysis vs Last Month</p>
                </div>
            </div>

            <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-[17px] before:w-0.5 before:bg-slate-100">
                {trends.map((trend, i) => (
                    <div key={i} className="relative pl-10">
                        <div className={cn(
                            "absolute left-0 top-1 w-9 h-9 rounded-full border-4 border-white flex items-center justify-center bg-white shadow-sm z-10",
                            trend.sentiment === 'positive' ? "text-emerald-500" :
                                trend.sentiment === 'negative' ? "text-rose-500" : "text-slate-400"
                        )}>
                            {trend.sentiment === 'positive' ? <TrendingUp className="w-4 h-4" /> :
                                trend.sentiment === 'negative' ? <TrendingDown className="w-4 h-4" /> :
                                    <Minus className="w-4 h-4" />}
                        </div>

                        <div className="bg-slate-50 rounded-lg p-4 transition-all hover:bg-slate-100">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{trend.category}</span>
                            </div>
                            <p className="text-sm font-medium text-slate-800 leading-relaxed font-serif italic">
                                "{trend.insight}"
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
                <Lightbulb className="w-3 h-3" />
                <span>AI analyzes 30-day historical windows</span>
            </div>
        </div>
    );
}
