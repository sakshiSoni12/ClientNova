import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const GEMINI_API_KEY = "AIzaSyBNfU1nAROVgtZWHgm87mXPq8_ONgL2qHA";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

export async function GET() {
    try {
        const supabase = await createClient();

        // 1. Fetch Basic Stats for Trend Analysis
        const { data: projects } = await supabase.from('projects').select('created_at, status, updated_at');
        const { data: clients } = await supabase.from('clients').select('created_at');

        if (!projects || !clients) return NextResponse.json({ trends: [] });

        const now = new Date();
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        // Helper to count
        const countInrange = (list: any[], key: string, start: Date, end: Date) =>
            list.filter(item => {
                const date = new Date(item[key]);
                return date >= start && date < end;
            }).length;

        const projectsThisMonth = countInrange(projects, 'created_at', thisMonthStart, now);
        const projectsLastMonth = countInrange(projects, 'created_at', lastMonthStart, thisMonthStart);

        const completedThisMonth = countInrange(projects.filter(p => p.status === 'completed'), 'updated_at', thisMonthStart, now);
        const completedLastMonth = countInrange(projects.filter(p => p.status === 'completed'), 'updated_at', lastMonthStart, thisMonthStart);

        const clientsThisMonth = countInrange(clients, 'created_at', thisMonthStart, now);
        const clientsLastMonth = countInrange(clients, 'created_at', lastMonthStart, thisMonthStart);

        // 2. AI Narrative Generation
        const prompt = `
You are a Data Storyteller for a business.
Compare this month's performance to last month's and find the narrative.

DATA:
- New Projects: ${projectsThisMonth} (Last Month: ${projectsLastMonth})
- Completed Projects: ${completedThisMonth} (Last Month: ${completedLastMonth})
- New Clients: ${clientsThisMonth} (Last Month: ${clientsLastMonth})

TASK:
Write 3 short, narrative insights (1 sentence each).
Focus on "Velocity", "Growth", and "Efficiency".
Example: "Project velocity is up 20% compared to October."

OUTPUT JSON ONLY:
{
  "trends": [
    { "category": "Velocity", "insight": "string", "sentiment": "positive" | "negative" | "neutral" },
    { "category": "Growth", "insight": "string", "sentiment": "positive" | "negative" | "neutral" },
    { "category": "Efficiency", "insight": "string", "sentiment": "positive" | "negative" | "neutral" }
  ]
}
`;
        let trends;
        try {
            const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });
            const json = await response.json();
            const text = json.candidates[0].content.parts[0].text.replace(/```json/g, "").replace(/```/g, "").trim();
            trends = JSON.parse(text).trends;
        } catch (e) {
            trends = [
                { category: "Velocity", insight: `You completed ${completedThisMonth} projects this month.`, sentiment: "neutral" },
                { category: "Growth", insight: `Added ${clientsThisMonth} new clients recently.`, sentiment: "positive" }
            ];
        }

        return NextResponse.json({ trends });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
