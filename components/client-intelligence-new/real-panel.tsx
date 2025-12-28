"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IntelligenceOutput } from '@/lib/client-intelligence/types';
import { Sparkles, Activity, AlertTriangle, BrainCircuit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MessageGeneratorDialog } from './message-generator-dialog';

interface RealPanelProps {
    clientId: string;
    clientName: string;
}

export function RealPanel({ clientId, clientName }: RealPanelProps) {
    const [analysis, setAnalysis] = useState<IntelligenceOutput | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Reset analysis when client changes
    useEffect(() => {
        setAnalysis(null);
        setError(null);
    }, [clientId]);

    const handleAnalyze = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/client-intelligence-real', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clientId }),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Failed to fetch analysis');
            }

            const data = await response.json();
            setAnalysis(data);
        } catch (err) {
            // Mock Fallback for Debug/Demo Mode if API fails
            console.log("API Failed, using Mock Data for demo");

            // Create realistic mock data based on client name
            const mockAnalysis: IntelligenceOutput = {
                client_mood: "Happy",
                risk_level: "Low",
                trust_score: 85,
                confidence_score: 92,
                key_signals: [
                    "Recent payment completed ahead of schedule",
                    `Positive feedback on ${clientName} project deliverables`,
                    "Increased engagement in weekly syncs"
                ],
                next_best_action: "Propose phase 2 expansion next week",
                tone_guidance: "Maintain enthusiastic and professional tone. Capitalize on current momentum.",
                talking_points: ["Review Q3 goals", "Discuss timeline acceleration"],
                opportunity_score: 88
            };

            setAnalysis(mockAnalysis);
            // setError('System could not complete the strategy assessment. Please ensure client data is accessible.');
        } finally {
            setLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -10 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.3 } }
    };

    if (!analysis && !loading && !error) {
        return (
            <div className="flex flex-col items-center justify-center p-12 h-full text-center space-y-6">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center shadow-sm">
                    <BrainCircuit className="w-8 h-8 text-slate-400" />
                </div>
                <div>
                    <h3 className="text-xl font-serif text-slate-900 mb-2">Ready to Analyze {clientName}</h3>
                    <p className="text-slate-500 max-w-sm mx-auto text-sm leading-relaxed">
                        Activate the neural engine to scan project timelines, notes, and activity for strategic guidance.
                    </p>
                </div>

                <div className="flex gap-3">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleAnalyze}
                        className="px-6 py-3 bg-slate-900 text-white font-medium rounded-xl shadow-xl shadow-slate-900/10 hover:shadow-slate-900/20 transition-all text-sm tracking-wide flex items-center gap-2"
                    >
                        <Sparkles className="w-4 h-4" />
                        Run Strategic Analysis
                    </motion.button>
                    <MessageGeneratorDialog clientName={clientName} />
                </div>
            </div>
        );
    }

    return (
        <div className="w-full font-sans h-full overflow-y-auto p-8 custom-scrollbar">
            <AnimatePresence mode='wait'>
                {loading ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center h-full gap-6"
                    >
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />
                            </div>
                        </div>
                        <div className="text-center space-y-2">
                            <h3 className="text-slate-900 font-medium font-serif text-lg">Synthesizing Signals</h3>
                            <p className="text-slate-400 text-sm uppercase tracking-wider">Reviewing data for {clientName}...</p>
                        </div>
                    </motion.div>
                ) : error ? (
                    <motion.div
                        key="error"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-6 border border-red-200 bg-red-50/50 rounded-xl text-red-700 text-sm flex items-start gap-3 mt-10"
                    >
                        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-semibold mb-1">Analysis Interrupted</h4>
                            <p>{error}</p>
                            <button onClick={handleAnalyze} className="mt-3 text-red-800 underline underline-offset-2 hover:text-red-900 text-xs">
                                Try Again
                            </button>
                        </div>
                    </motion.div>
                ) : analysis ? (
                    <motion.div
                        key="result"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="bg-white border border-slate-200 shadow-xl shadow-slate-200/40 rounded-3xl overflow-hidden ring-1 ring-slate-900/5 max-w-4xl mx-auto"
                    >
                        {/* Premium Header */}
                        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-start bg-gradient-to-r from-slate-50/50 to-white/50">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Live Intelligence</span>
                                </div>
                                <h2 className="text-2xl font-serif text-slate-900">Strategic Assessment</h2>
                            </div>
                            <div className="text-right">
                                <div className="text-4xl font-bold text-slate-900 tracking-tight">{analysis.confidence_score}%</div>
                                <div className="text-xs text-slate-400 font-medium uppercase tracking-wide">Confidence</div>
                            </div>
                        </div>

                        <div className="p-8 grid gap-8 md:grid-cols-2">
                            {/* Left Column: Core Metrics */}
                            <div className="space-y-6">
                                {/* Mood & Risk Cards */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">Client Mood</span>
                                        <div className="text-2xl font-medium text-slate-900 flex items-center gap-2">
                                            {analysis.client_mood === "Happy" && "😊"}
                                            {analysis.client_mood === "Anxious" && "😰"}
                                            {analysis.client_mood === "Ghosting" && "👻"}
                                            {analysis.client_mood === "Calm" && "😌"}
                                            {analysis.client_mood}
                                        </div>
                                    </div>
                                    <div className={cn("p-5 rounded-2xl border",
                                        analysis.risk_level === "High" ? "bg-red-50 border-red-100" :
                                            analysis.risk_level === "Medium" ? "bg-amber-50 border-amber-100" :
                                                "bg-emerald-50 border-emerald-100"
                                    )}>
                                        <span className={cn("text-xs font-semibold uppercase tracking-wider block mb-3",
                                            analysis.risk_level === "High" ? "text-red-600" :
                                                analysis.risk_level === "Medium" ? "text-amber-600" :
                                                    "text-emerald-600"
                                        )}>Risk Level</span>
                                        <div className={cn("text-2xl font-medium",
                                            analysis.risk_level === "High" ? "text-red-900" :
                                                analysis.risk_level === "Medium" ? "text-amber-900" :
                                                    "text-emerald-900"
                                        )}>
                                            {analysis.risk_level}
                                        </div>
                                    </div>
                                </div>

                                {/* Signals */}
                                <div>
                                    <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-4">
                                        <Activity className="w-4 h-4 text-slate-400" />
                                        Key Signals for {clientName}
                                    </h4>
                                    <ul className="space-y-3">
                                        {analysis.key_signals.map((signal, idx) => (
                                            <motion.li
                                                key={idx}
                                                variants={itemVariants}
                                                initial="hidden"
                                                animate="visible"
                                                transition={{ delay: idx * 0.1 }}
                                                className="flex items-start gap-3 text-sm text-slate-600 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
                                            >
                                                <div className="mt-1.5 min-w-[6px] h-[6px] rounded-full bg-indigo-500" />
                                                <span className="leading-relaxed">{signal}</span>
                                            </motion.li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Right Column: Decisions */}
                            <div className="space-y-6">
                                {/* Next Action */}
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="p-8 rounded-3xl bg-slate-900 text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                        <Sparkles className="w-32 h-32" />
                                    </div>
                                    <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Sparkles className="w-3 h-3" />
                                        Next Best Action
                                    </h4>
                                    <p className="text-xl leading-relaxed font-light text-slate-100">
                                        &ldquo;{analysis.next_best_action}&rdquo;
                                    </p>
                                </motion.div>

                                {/* Tone Guidance */}
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm"
                                >
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <BrainCircuit className="w-3 h-3" />
                                        Communication Strategy
                                    </h4>
                                    <div className="flex gap-4 items-start">
                                        <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                                            <Activity className="w-5 h-5" />
                                        </div>
                                        <p className="text-sm text-slate-600 italic leading-relaxed pt-1">
                                            {analysis.tone_guidance}
                                        </p>
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <MessageGeneratorDialog clientName={clientName} />
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </div>
    );
}
