"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Copy, Sparkles, RefreshCw, CheckCircle2, MessageSquarePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface MessageGeneratorDialogProps {
    clientName: string;
}

export function MessageGeneratorDialog({ clientName }: MessageGeneratorDialogProps) {
    const [open, setOpen] = useState(false);
    const [context, setContext] = useState("no_reply");
    const [tone, setTone] = useState("Professional");
    const [customInput, setCustomInput] = useState("");
    const [generatedMessage, setGeneratedMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleGenerate = async () => {
        setLoading(true);
        setGeneratedMessage("");
        try {
            const response = await fetch("/api/generate-message", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    clientName,
                    context,
                    tone,
                    customInput: context === "custom" ? customInput : undefined
                }),
            });
            const data = await response.json();
            if (data.error) {
                console.error("API Error:", data.error);
                setGeneratedMessage("Error: " + data.error);
            } else if (data.message) {
                setGeneratedMessage(data.message);
            } else {
                setGeneratedMessage("No message returned. Please try again.");
            }
        } catch (error) {
            console.error("Network Error:", error);
            setGeneratedMessage("System unavailable. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedMessage);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 bg-slate-900 text-white hover:bg-slate-800 shadow-sm border border-slate-900">
                    <MessageSquarePlus className="w-4 h-4" />
                    Draft Message
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-white gap-0 border-none shadow-2xl">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} // smooth apple-like ease
                >
                    <div className="p-6 bg-slate-50 border-b border-slate-100">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 font-serif text-xl text-slate-900">
                                <Sparkles className="w-5 h-5 text-indigo-600" />
                                Smart Message Generator
                            </DialogTitle>
                            <DialogDescription className="text-slate-500">
                                Generate a senior-level message for <strong className="text-slate-900">{clientName}</strong>.
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Context Trigger</Label>
                                <Select value={context} onValueChange={setContext}>
                                    <SelectTrigger className="bg-white border-slate-300 text-slate-900 font-medium h-11 transition-all hover:border-slate-400 focus:ring-2 focus:ring-slate-900/10">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="no_reply">No Reply (Nudge)</SelectItem>
                                        <SelectItem value="payment_overdue">Payment Overdue</SelectItem>
                                        <SelectItem value="project_delivered">Project Delivered</SelectItem>
                                        <SelectItem value="custom">Custom Situation</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Tone</Label>
                                <Select value={tone} onValueChange={setTone}>
                                    <SelectTrigger className="bg-white border-slate-300 text-slate-900 font-medium h-11 transition-all hover:border-slate-400 focus:ring-2 focus:ring-slate-900/10">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Polite">Polite</SelectItem>
                                        <SelectItem value="Professional">Professional</SelectItem>
                                        <SelectItem value="Firm">Firm</SelectItem>
                                        <SelectItem value="Friendly">Friendly</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <AnimatePresence>
                            {context === "custom" && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Situation Details</Label>
                                    <Textarea
                                        value={customInput}
                                        onChange={(e) => setCustomInput(e.target.value)}
                                        placeholder="Briefly describe what you need to say..."
                                        className="resize-none h-20 bg-white border-slate-300 focus:border-slate-900 focus:ring-0"
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Output Area */}
                        <div className="relative min-h-[160px] bg-slate-50 rounded-xl border border-slate-200 p-4 transition-all focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500/50 focus-within:bg-white">
                            <AnimatePresence>
                                {loading && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-10 rounded-xl"
                                    >
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                                            <span className="text-xs font-bold text-slate-900 animate-pulse tracking-wide">CRAFTING DRAFT...</span>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {!generatedMessage && !loading ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm gap-2">
                                    <MessageSquarePlus className="w-8 h-8 opacity-20" />
                                    <span>Ready to generate</span>
                                </div>
                            ) : (
                                <textarea
                                    readOnly={true}
                                    className="w-full h-full bg-transparent border-none resize-none focus:outline-none text-slate-800 text-sm leading-relaxed font-medium"
                                    value={generatedMessage}
                                />
                            )}
                        </div>
                    </div>

                    <DialogFooter className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between sm:justify-between w-full">
                        <div className="flex gap-2">
                            {generatedMessage && (
                                <Button variant="ghost" size="sm" onClick={handleCopy} className={cn("gap-2 hover:bg-emerald-50 hover:text-emerald-700 transition-colors", copied && "text-emerald-600")}>
                                    {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    {copied ? "Copied" : "Copy"}
                                </Button>
                            )}
                        </div>
                        <div className="flex gap-2">
                            {generatedMessage && (
                                <Button variant="ghost" onClick={handleGenerate} disabled={loading} className="hover:bg-slate-200">
                                    <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
                                    Regenerate
                                </Button>
                            )}
                            <Button onClick={handleGenerate} disabled={loading || (context === 'custom' && !customInput)} className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/10 transition-all active:scale-95">
                                {generatedMessage ? "Try Another Version" : "Generate Draft"}
                            </Button>
                        </div>
                    </DialogFooter>
                </motion.div>
            </DialogContent>
        </Dialog>
    );
}
