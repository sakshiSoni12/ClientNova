import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const GEMINI_API_KEY = "AIzaSyBNfU1nAROVgtZWHgm87mXPq8_ONgL2qHA";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

export async function GET() {
    try {
        const supabase = await createClient();

        // 1. Fetch "Red" signals (Overdue projects, etc)
        // We do a quick scan of projects to find critical ones
        const { data: projects } = await supabase
            .from('projects')
            .select('name, status, end_date, progress')
            .neq('status', 'completed')
            .order('end_date', { ascending: true }); // Earliest deadline first

        const today = new Date();
        const criticalProjects = projects?.filter((p: any) => {
            const endDate = new Date(p.end_date);
            return endDate < today || (endDate.getTime() - today.getTime()) / (1000 * 3600 * 24) < 3; // Overdue or due in 3 days
        }).slice(0, 5) || [];

        // 2. AI Synthesis
        const prompt = `
You are a Chief of Staff preparing a morning briefing.
Identify the Top 3 priorities for today based on this data.

CRITICAL PROJECTS (Overdue or Due Soon):
${JSON.stringify(criticalProjects)}

TASK:
1. Write a "Morning Briefing" (2-3 sentences, executive summary tone).
2. List 3 "Must-Do" priorities.

OUTPUT JSON ONLY:
{
  "briefing": "string",
  "priorities": [
    { "title": "string", "type": "Urgent" | "High" | "Normal" }
  ]
}
`;
        let briefingData;
        try {
            const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });
            const json = await response.json();
            const text = json.candidates[0].content.parts[0].text.replace(/```json/g, "").replace(/```/g, "").trim();
            briefingData = JSON.parse(text);
        } catch (e) {
            // Fallback
            briefingData = {
                briefing: `You have ${criticalProjects.length} projects requiring attention today.`,
                priorities: criticalProjects.map((p: any) => ({
                    title: `Review ${p.name} (Due/Overdue)`,
                    type: "Urgent"
                })).slice(0, 3)
            };
        }

        return NextResponse.json(briefingData);

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
