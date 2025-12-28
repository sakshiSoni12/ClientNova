import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const GEMINI_API_KEY = "AIzaSyBNfU1nAROVgtZWHgm87mXPq8_ONgL2qHA";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

export async function GET() {
    try {
        const supabase = await createClient();

        // 1. Fetch Team Members and their Projects
        // Note: Relation `team_members` maps `profile_id` to `project_id`.
        const { data: assignments, error } = await supabase
            .from('team_members')
            .select(`
                profile_id,
                role,
                profiles (full_name, avatar_url),
                projects (status, name)
            `);

        if (error) throw error;

        // 2. Aggregation Logic
        const workloadMap: Record<string, any> = {};

        assignments?.forEach((item: any) => {
            const pid = item.profile_id;
            const projectStatus = item.projects?.status;

            if (projectStatus === 'completed' || projectStatus === 'archived' || projectStatus === 'cancelled') return;

            if (!workloadMap[pid]) {
                workloadMap[pid] = {
                    name: item.profiles?.full_name || "Unknown",
                    avatar: item.profiles?.avatar_url,
                    role: item.role,
                    active_count: 0,
                    project_names: []
                };
            }
            workloadMap[pid].active_count++;
            workloadMap[pid].project_names.push(item.projects?.name);
        });

        const teamData = Object.values(workloadMap);

        // 3. AI Analysis
        const prompt = `
You are a Staffing & Capacity Expert.
Analyze the current team workload distribution.

TEAM DATA:
${JSON.stringify(teamData, null, 2)}

TASK:
1. Identify who is OVERLOADED (Risk of burnout).
2. Identify who is UNDERUTILIZED (Capacity available).
3. Suggest 1 re-balancing action.

OUTPUT JSON ONLY:
{
  "overloaded_members": ["name"],
  "underutilized_members": ["name"],
  "capacity_insight": "string (leadership observation)",
  "suggested_action": "string (specific move)"
}
`;
        let analysis;
        try {
            const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });
            const json = await response.json();
            const text = json.candidates[0].content.parts[0].text.replace(/```json/g, "").replace(/```/g, "").trim();
            analysis = JSON.parse(text);
        } catch (e) {
            // Fallback
            const overloaded = teamData.filter((m: any) => m.active_count > 4).map((m: any) => m.name);
            analysis = {
                overloaded_members: overloaded,
                underutilized_members: [],
                capacity_insight: overloaded.length > 0 ? "High load detected on key members." : "Team load is balanced.",
                suggested_action: "Review assignments."
            };
        }

        return NextResponse.json({ teamData, analysis });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
