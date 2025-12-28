"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { ClientSelector } from "@/components/client-intelligence-new/client-selector";
import { RealPanel } from "@/components/client-intelligence-new/real-panel";
import { Brain, Sparkles } from "lucide-react";

interface ClientSimple {
    id: string;
    name: string;
    company: string | null;
    status: string;
}

export default function ClientIntelligencePageRedux() {
    const [clients, setClients] = useState<ClientSimple[]>([]);
    const [selectedClient, setSelectedClient] = useState<ClientSimple | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClients = async () => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from("clients")
                .select("id, name, company, status")
                .order("name");

            if (data) {
                setClients(data);
                if (data.length > 0) {
                    setSelectedClient(data[0]);
                }
            }
            setLoading(false);
        };

        fetchClients();
    }, []);

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)] rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-sm">
            {/* Header Area within the panel */}
            <div className="bg-white border-b border-slate-100 p-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                        <Brain className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-serif font-bold text-slate-900">Client Intelligence Panel</h1>
                        <p className="text-xs text-slate-500 font-medium">AI-Powered Strategic Advisory</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-1 min-h-0">
                {/* Sidebar Selector */}
                <div className="w-80 h-full shrink-0">
                    {loading ? (
                        <div className="p-8 text-center text-slate-400 text-sm">Loading clients...</div>
                    ) : (
                        <ClientSelector
                            clients={clients}
                            selectedClientId={selectedClient?.id || null}
                            onSelect={setSelectedClient}
                        />
                    )}
                </div>

                {/* Main Content */}
                <div className="flex-1 bg-slate-50/50 h-full min-w-0">
                    {selectedClient ? (
                        <RealPanel clientId={selectedClient.id} clientName={selectedClient.name} />
                    ) : (
                        <div className="flex items-center justify-center h-full text-slate-400">
                            Select a client to begin.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
