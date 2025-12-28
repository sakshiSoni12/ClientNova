"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, TrendingUp, AlertCircle, CheckCircle, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface FinanceInsight {
    risk_profile: "Reliable" | "Inconsistent" | "High Risk";
    expected_payment_behavior: string;
    financial_insight: string;
}

interface PaymentPredictionCardProps {
    clientId: string;
}

export function PaymentPredictionCard({ clientId }: PaymentPredictionCardProps) {
    const [data, setData] = useState<FinanceInsight | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFinance = async () => {
            try {
                const res = await fetch('/api/finance-ai', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ clientId })
                });
                const json = await res.json();
                if (!json.error) setData(json);
            } catch (e) {
                console.error("Finance AI error", e);
            } finally {
                setLoading(false);
            }
        };
        fetchFinance();
    }, [clientId]);

    if (loading) return <div className="animate-pulse h-32 bg-slate-50 rounded-xl" />;

    if (!data) return null;

    const isRisk = data.risk_profile === 'High Risk';
    const isGood = data.risk_profile === 'Reliable';

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-900 font-serif text-lg font-medium">
                    <Wallet className="w-5 h-5 text-emerald-600" />
                    <h3>Cash Flow Prediction</h3>
                </div>
                <Badge className={cn(
                    "uppercase tracking-wider font-bold",
                    isRisk ? "bg-red-100 text-red-700 hover:bg-red-100" :
                        isGood ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" :
                            "bg-amber-100 text-amber-700 hover:bg-amber-100"
                )}>
                    {data.risk_profile}
                </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Expected Behavior</p>
                    <p className="text-sm font-medium text-slate-800">{data.expected_payment_behavior}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <p className="text-xs text-slate-500 uppercase font-semibold mb-1">CFO Insight</p>
                    <p className="text-sm font-medium text-slate-800 flex items-start gap-2">
                        <TrendingUp className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                        {data.financial_insight}
                    </p>
                </div>
            </div>
        </div>
    );
}
