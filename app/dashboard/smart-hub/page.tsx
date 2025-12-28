"use client";

import React, { useState, useEffect } from 'react';
import { DailyBriefingWidget } from '@/components/ai-suite/daily-briefing-widget';
import { WorkloadOptimizer } from '@/components/ai-suite/workload-optimizer';
import { InsightsTimeline } from '@/components/ai-suite/insights-timeline';
import { PaymentPredictionCard } from '@/components/ai-suite/payment-prediction-card';
import { AutoDocPanel } from '@/components/ai-suite/auto-doc-panel';
import { FutureSnapshotModal } from '@/components/intelligence/future-snapshot-modal';
import { createClient } from '@/lib/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Sparkles, BrainCircuit } from 'lucide-react';

// Simple types for local selector
interface SimpleClient {
    id: string;
    name: string;
}

export default function SmartHubPage() {
    const [clients, setClients] = useState<SimpleClient[]>([]);
    const [selectedClientId, setSelectedClientId] = useState<string>("");
    const [showSnapshot, setShowSnapshot] = useState(false);

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const supabase = createClient();
                const { data, error } = await supabase.from('clients').select('id, name').limit(10);

                if (error) {
                    // console.log("Supabase Client Fetch Error:", error);
                    return;
                }

                if (data) {
                    setClients(data);
                    if (data.length > 0) setSelectedClientId(data[0].id);
                }
            } catch (e) {
                // console.log("Critical Client Fetch Error:", e);
            }
        };
        fetchClients();
    }, []);

    return (
        <div className="min-h-screen p-6 md:p-8 space-y-8">
            <header className="mb-8">
                < div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-serif text-slate-900 mb-2 flex items-center gap-3">
                            <BrainCircuit className="w-8 h-8 text-indigo-600" />
                            Smart Hub
                            <span className="text-xs font-sans font-bold bg-indigo-100 text-indigo-700 px-2 py-1 rounded-md uppercase tracking-wide">Beta</span>
                        </h1>
                        <p className="text-slate-500 max-w-2xl text-sm leading-relaxed">
                            Your centralized command center. Advanced AI models analyzing cash flow, team capacity, and operational trends in real-time.
                        </p>
                    </div>
                </div>
            </header>

            {/* 1. Daily Command Center (Top Priority) */}
            <section>
                <DailyBriefingWidget />
            </section>

            {/* 2. Operational Intelligence (Team & Trends) */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-6">
                    <WorkloadOptimizer />

                    {/* Client Spotlight Section */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-serif font-medium text-slate-900">Client Deep Dive</h3>
                            <div className="flex gap-2">
                                {selectedClientId && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="gap-2 text-purple-700 bg-purple-50 border-purple-200 hover:bg-purple-100"
                                        onClick={() => setShowSnapshot(true)}
                                    >
                                        <Sparkles className="w-3 h-3" />
                                        Future Snapshot
                                    </Button>
                                )}
                                <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                                    <SelectTrigger className="w-[200px]">
                                        <SelectValue placeholder="Select Client" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {clients.map(c => (
                                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {selectedClientId ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <PaymentPredictionCard clientId={selectedClientId} />
                                <AutoDocPanel clientId={selectedClientId} />
                            </div>
                        ) : (
                            <div className="text-center py-10 text-slate-400">Select a client to view AI insights</div>
                        )}

                        {/* AI Future Snapshot Modal */}
                        {selectedClientId && (
                            <FutureSnapshotModal
                                isOpen={showSnapshot}
                                onClose={() => setShowSnapshot(false)}
                                clientId={selectedClientId}
                                clientName={clients.find(c => c.id === selectedClientId)?.name || "Client"}
                            />
                        )}
                    </div>
                </div>

                <div className="xl:col-span-1">
                    <InsightsTimeline />
                </div>
            </div>
        </div>
    );
}
