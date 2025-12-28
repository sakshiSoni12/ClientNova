"use client";

import React, { useState } from 'react';
import { ClientIntelligencePanel } from '@/components/client-intelligence/panel';
import { ClientData } from '@/lib/client-intelligence/types';
import { Brain, Sparkles } from 'lucide-react';

const MOCK_SCENARIOS: Record<string, ClientData> = {
    standard: {
        client_name: "Acme Corp",
        client_notes: "Generally good relationship, some slow approvals.",
        email_summary: "Last email was about Q3 targets.",
        project_status: {
            current_phase: "Development",
            delays_count: 0,
            last_feedback_days_ago: 3
        },
        payment_history: {
            total_invoices: 12,
            paid_on_time: 12,
            late_payments: 0,
            outstanding_amount: 0
        },
        recent_activity: {
            meetings_attended: 4,
            missed_meetings: 0,
            response_pattern: "Consistent"
        }
    },
    high_risk: {
        client_name: "Globex Inc",
        client_notes: "Multiple revisions requested outside of scope.",
        email_summary: " complaining about timelines.",
        project_status: {
            current_phase: "Design",
            delays_count: 4,
            last_feedback_days_ago: 9
        },
        payment_history: {
            total_invoices: 5,
            paid_on_time: 2,
            late_payments: 3,
            outstanding_amount: 15000
        },
        recent_activity: {
            meetings_attended: 2,
            missed_meetings: 2,
            response_pattern: "Sporadic"
        }
    },
    ghosting: {
        client_name: "Soylent Corp",
        client_notes: "Radio silence after invoice sent.",
        email_summary: "No replies to last 3 threads.",
        project_status: {
            current_phase: "Handoff",
            delays_count: 0,
            last_feedback_days_ago: 21
        },
        payment_history: {
            total_invoices: 3,
            paid_on_time: 2,
            late_payments: 0,
            outstanding_amount: 5000
        },
        recent_activity: {
            meetings_attended: 0,
            missed_meetings: 1,
            response_pattern: "Ghosting"
        }
    }
};

export default function ClientIntelligencePage() {
    const [selectedScenario, setSelectedScenario] = useState<string>('standard');

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-serif text-slate-900 flex items-center gap-3">
                    <span className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                        <Brain className="w-6 h-6" />
                    </span>
                    Client Intelligence Center
                </h1>
                <p className="text-slate-500 max-w-2xl text-lg font-light">
                    Use robust AI heuristics to analyze client signals and generate senior-level strategic advice.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Controls */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                            <Sparkles className="w-3 h-3" />
                            Select Client Context
                        </h3>
                        <div className="flex flex-col gap-2">
                            {Object.keys(MOCK_SCENARIOS).map(key => (
                                <button
                                    key={key}
                                    onClick={() => setSelectedScenario(key)}
                                    className={`px-4 py-3 text-left rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-between group ${selectedScenario === key
                                            ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10'
                                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:pl-5'
                                        }`}
                                >
                                    {key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ')}
                                    {selectedScenario === key && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 text-slate-400 text-xs font-mono overflow-hidden relative group">
                        <div className="absolute top-3 right-3 text-slate-600 text-[10px] uppercase font-bold tracking-widest border border-slate-800 px-2 py-1 rounded">Raw Data Payload</div>
                        <pre className="overflow-x-auto custom-scrollbar pt-6 opacity-70 group-hover:opacity-100 transition-opacity">
                            {JSON.stringify(MOCK_SCENARIOS[selectedScenario], null, 2)}
                        </pre>
                    </div>
                </div>

                {/* Panel Display */}
                <div className="lg:col-span-8">
                    <ClientIntelligencePanel
                        key={selectedScenario}
                        clientData={MOCK_SCENARIOS[selectedScenario]}
                    />
                </div>
            </div>
        </div>
    );
}
