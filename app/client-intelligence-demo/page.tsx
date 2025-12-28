"use client";

import React, { useState } from 'react';
import { ClientIntelligencePanel } from '@/components/client-intelligence/panel';
import { ClientData } from '@/lib/client-intelligence/types';

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

export default function ClientIntelligenceDemo() {
    const [selectedScenario, setSelectedScenario] = useState<string>('standard');

    return (
        <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-900">
            <div className="max-w-4xl mx-auto">
                <header className="mb-12">
                    <h1 className="text-3xl font-serif mb-4">Client Intelligence Demo</h1>
                    <p className="text-slate-600 max-w-xl">
                        This module analyzes client inputs to generate strategic advice.
                        Select a scenario below to test the heuristic engine.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                    {/* Controls */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Select Mock Data</h3>
                        <div className="flex flex-col gap-2">
                            {Object.keys(MOCK_SCENARIOS).map(key => (
                                <button
                                    key={key}
                                    onClick={() => setSelectedScenario(key)}
                                    className={`px-4 py-3 text-left rounded-lg text-sm font-medium transition-colors ${selectedScenario === key
                                            ? 'bg-slate-900 text-white'
                                            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                                        }`}
                                >
                                    {key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ')}
                                </button>
                            ))}
                        </div>

                        <div className="mt-8 p-4 bg-white rounded-lg border border-slate-200 text-xs font-mono text-slate-500 overflow-hidden">
                            <pre>{JSON.stringify(MOCK_SCENARIOS[selectedScenario], null, 2)}</pre>
                        </div>
                    </div>

                    {/* Panel Display */}
                    <div className="md:col-span-2">
                        <ClientIntelligencePanel
                            key={selectedScenario} // Force re-render on change 
                            clientData={MOCK_SCENARIOS[selectedScenario]}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
