"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Search, Building2, User } from "lucide-react";

interface ClientSimple {
    id: string;
    name: string;
    company: string | null;
    status: string;
}

interface ClientSelectorProps {
    clients: ClientSimple[];
    selectedClientId: string | null;
    onSelect: (client: ClientSimple) => void;
}

export function ClientSelector({ clients, selectedClientId, onSelect }: ClientSelectorProps) {
    const [search, setSearch] = React.useState("");

    const filtered = clients.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.company && c.company.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="flex flex-col h-full bg-white border-r border-slate-200">
            <div className="p-4 border-b border-slate-100">
                <h3 className="font-serif text-lg font-medium text-slate-900 mb-4">Clients</h3>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search clients..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {filtered.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-sm">
                        No clients found.
                    </div>
                ) : (
                    filtered.map((client) => (
                        <button
                            key={client.id}
                            onClick={() => onSelect(client)}
                            className={cn(
                                "w-full text-left p-3 rounded-lg text-sm transition-all group border border-transparent",
                                selectedClientId === client.id
                                    ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                                    : "hover:bg-slate-50 text-slate-600 hover:border-slate-100"
                            )}
                        >
                            <div className="font-medium flex items-center gap-2">
                                <User className={cn("w-3.5 h-3.5", selectedClientId === client.id ? "text-slate-400" : "text-slate-400 group-hover:text-slate-500")} />
                                {client.name}
                            </div>
                            {client.company && (
                                <div className={cn("text-xs mt-1 pl-5.5 truncate", selectedClientId === client.id ? "text-slate-400" : "text-slate-400")}>
                                    {client.company}
                                </div>
                            )}
                        </button>
                    ))
                )}
            </div>
        </div>
    );
}
