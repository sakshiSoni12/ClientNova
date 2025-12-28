"use client";

import React, { useEffect, useState } from 'react';
import { Sun, CheckCircle2, AlertOctagon, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface Priority {
    title: string;
    type: "Urgent" | "High" | "Normal";
}

interface DailyBriefing {
    briefing: string;
    priorities: Priority[];
}

export function DailyBriefingWidget() {
    const [data, setData] = useState<DailyBriefing | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBriefing = async () => {
            try {
                const res = await fetch('/api/daily-briefing');
                const json = await res.json();
                if (json.briefing) setData(json);
            } catch (e) {
                console.error("Briefing error", e);
            } finally {
                setLoading(false);
            }
        };
        fetchBriefing();
    }, []);

    if (loading) return <div className="h-40 bg-slate-50 animate-pulse rounded-xl" />;
    if (!data) return null;

    return (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 text-white shadow-xl relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row gap-8">
                <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-2 text-indigo-300 font-serif font-medium">
                        <Sun className="w-5 h-5" />
                        <h3>Daily Command Center</h3>
                    </div>
                    <div>
                        <h2 className="text-2xl font-semibold leading-tight mb-2">Morning Briefing</h2>
                        <p className="text-slate-300 leading-relaxed max-w-xl">{data.briefing}</p>
                    </div>
                </div>

                <div className="md:w-80 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Today's Priorities</h4>
                    <div className="space-y-3">
                        {data.priorities.map((item, i) => (
                            <div key={i} className="flex items-start gap-3">
                                {item.type === 'Urgent' ? (
                                    <AlertOctagon className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                                ) : (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                                )}
                                <span className="text-sm font-medium text-slate-100">{item.title}</span>
                            </div>
                        ))}
                    </div>
                    <Button variant="link" className="text-indigo-300 hover:text-white p-0 h-auto mt-4 text-xs">
                        View Full Agenda <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
