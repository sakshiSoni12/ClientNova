"use client";

import React, { useState } from 'react';
import { PenTool, Save, Check, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface AutoDocPanelProps {
    clientId: string;
}

export function AutoDocPanel({ clientId }: AutoDocPanelProps) {
    const [text, setText] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const handleSummarize = async () => {
        if (!text.trim()) return;
        setIsSaving(true);

        try {
            const res = await fetch('/api/auto-doc', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clientId, rawText: text })
            });
            const json = await res.json();

            if (json.success) {
                toast.success("Notes summarized & saved!");
                setText(""); // Clear on success
            } else {
                toast.error("Failed to save notes.");
            }
        } catch (e) {
            toast.error("Connection error.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-slate-900 font-serif text-lg font-medium">
                    <PenTool className="w-5 h-5 text-indigo-600" />
                    <h3>Auto-Documentation</h3>
                </div>
                <div className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    AI Assistant
                </div>
            </div>

            <Textarea
                placeholder="Paste rough notes, call logs, or brain dumps here..."
                className="min-h-[120px] bg-slate-50 border-slate-200 focus:bg-white resize-none mb-4"
                value={text}
                onChange={(e) => setText(e.target.value)}
            />

            <div className="flex justify-end">
                <Button
                    onClick={handleSummarize}
                    disabled={isSaving || !text.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-md shadow-indigo-200"
                >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {isSaving ? "Summarizing..." : "Summarize & Save to Profile"}
                </Button>
            </div>
        </div>
    );
}
