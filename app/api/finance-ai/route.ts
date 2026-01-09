import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export async function POST(request: Request) {
    try {
        const { clientId } = await request.json();
        const supabase = await createClient();

        if (!clientId) return NextResponse.json({ error: "Client ID required" }, { status: 400 });

        // Fetch client's projects to infer payment/completion history
        const { data: projects, error } = await supabase
            .from('projects')
            .select('*')
            .eq('client_id', clientId)
            .order('end_date', { ascending: false });

        if (error) throw error;

        // Calculate "Financial" signals from Project data
        const completedProjects = projects?.filter(p => p.status === 'completed') || [];
        const totalCompleted = completedProjects.length;

        let delayedProjects = 0;
        let totalDaysLate = 0;

        completedProjects.forEach(p => {
            if (p.end_date && p.updated_at) {
                const endDate = new Date(p.end_date);
                const actualDate = new Date(p.updated_at);
                if (actualDate > endDate) {
                    delayedProjects++;
                    const diffTime = Math.abs(actualDate.getTime() - endDate.getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    totalDaysLate += diffDays;
                }
            }
        });

        const avgDelay = delayedProjects > 0 ? Math.round(totalDaysLate / delayedProjects) : 0;
        const lateProb = totalCompleted > 0 ? (delayedProjects / totalCompleted) : 0;

        // Construct AI Prompt
        const prompt = `
You are a Sharpe Finance Brain for a design agency. 
Analyze this client's payment/completion reliability based on project history.
We use "Project Completion" as a proxy for "Invoice Payment" since data is limited.

DATA:
- Total Projects Competed: ${totalCompleted}
- Projects Late: ${delayedProjects} (${(lateProb * 100).toFixed(1)}%)
- Avg Delay: ${avgDelay} days

TASK:
1. Assign Risk Profile: "Reliable" (Low delays), "Inconsistent" (Some delays), "High Risk" (Mostly late).
2. Predict Payment Timing: "Usually pays on time", "Expect 5-7 days delay", etc.
3. Insight: One sharp, financial observation suitable for a COO.

OUTPUT JSON ONLY:
{
  "risk_profile": "Reliable" | "Inconsistent" | "High Risk",
  "expected_payment_behavior": "string (short prediction)",
  "financial_insight": "string (1 line observation, no fluff)"
}
`;

        try {
            const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });

            if (!response.ok) throw new Error("AI Error");
            const json = await response.json();
            const text = json.candidates[0].content.parts[0].text.replace(/```json/g, "").replace(/```/g, "").trim();
            const analysis = JSON.parse(text);

            return NextResponse.json(analysis);

        } catch (aiError) {
            console.warn("Finance AI Fallback", aiError);
            // Deterministic Fallback
            let risk = "Reliable";
            let behavior = "Consistent payment history.";

            if (lateProb > 0.5) {
                risk = "High Risk";
                behavior = `Expect delays of ~${avgDelay} days.`;
            } else if (lateProb > 0.2) {
                risk = "Inconsistent";
                behavior = "Occasional delays detected.";
            }

            return NextResponse.json({
                risk_profile: risk,
                expected_payment_behavior: behavior,
                financial_insight: "Based on historical project timelines."
            });
        }

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
