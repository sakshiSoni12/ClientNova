"use client";

import React, { useEffect, useState } from 'react';
import { Users, AlertTriangle, CheckCircle, BarChart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface TeamMemberLoad {
    name: string;
    avatar: string;
    role: string;
    active_count: number;
}

interface WorkloadAnalysis {
    teamData: TeamMemberLoad[];
    analysis: {
        overloaded_members: string[];
        underutilized_members: string[];
        capacity_insight: string;
        suggested_action: string;
    };
}

export function WorkloadOptimizer() {
    const [data, setData] = useState<WorkloadAnalysis | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWorkload = async () => {
            try {
                const res = await fetch('/api/workload-ai');
                const json = await res.json();
                if (json.teamData) setData(json);
            } catch (e) {
                console.error("Workload AI error", e);
            } finally {
                setLoading(false);
            }
        };
        fetchWorkload();
    }, []);

    if (loading) return <div className="animate-pulse h-48 bg-slate-50 rounded-xl" />;
    if (!data) return null;

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-slate-900 font-serif text-lg font-medium">
                        <Users className="w-5 h-5 text-indigo-600" />
                        <h3>Team Workload Optimizer</h3>
                    </div>
                </div>
                <div className="flex items-start gap-3 bg-indigo-50/50 p-3 rounded-lg border border-indigo-100 text-sm text-indigo-900">
                    <BarChart className="w-4 h-4 mt-0.5 text-indigo-600 shrink-0" />
                    <div>
                        <p className="font-medium">{data.analysis.capacity_insight}</p>
                        <p className="text-indigo-700/80 text-xs mt-1">Suggestion: {data.analysis.suggested_action}</p>
                    </div>
                </div>
            </div>

            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.teamData.map((member) => {
                    const isOverloaded = data.analysis.overloaded_members.includes(member.name);
                    const isUnder = data.analysis.underutilized_members.includes(member.name);

                    return (
                        <div key={member.name} className={cn(
                            "flex items-center gap-3 p-3 rounded-xl border transition-all",
                            isOverloaded ? "bg-red-50 border-red-200" : "bg-white border-slate-200 hover:border-indigo-200"
                        )}>
                            <Avatar>
                                <AvatarImage src={member.avatar} />
                                <AvatarFallback>{member.name.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-900 truncate">{member.name}</p>
                                <p className="text-xs text-slate-500 truncate">{member.role || "Team Member"}</p>
                            </div>
                            <div className="text-right">
                                <span className={cn(
                                    "text-lg font-bold block",
                                    isOverloaded ? "text-red-600" : "text-slate-700"
                                )}>
                                    {member.active_count}
                                </span>
                                <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Projects</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
