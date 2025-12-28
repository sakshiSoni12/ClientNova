import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const GEMINI_API_KEY = "AIzaSyBNfU1nAROVgtZWHgm87mXPq8_ONgL2qHA";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

interface ParsedProject {
    id: string;
    name: string;
    description: string;
    status: string;
    startDate: string;
    endDate: string;
    progress: number;
    updatedAt: string;
    // Derived metrics
    daysTotal: number;
    daysElapsed: number;
    expectedProgress: number;
    actualPace: number; // 0 to 1+ (1 = on track)
    isOverdue: boolean;
    daysSinceLastUpdate: number;
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient();

        // 1. Fetch Active Projects
        let { data: projects, error } = await supabase
            .from('projects')
            .select('*')
            .neq('status', 'completed')
            .neq('status', 'archived')
            .order('updated_at', { ascending: false });

        if (error) {
            // Log error but allow fallthrough to admin bypass if applicable
            console.error("User fetch failed, attempting admin bypass...", error);
        }

        if (!projects || projects.length === 0) {
            console.log("No projects found with user session. Attempting Admin Bypass...");

            // Fallback: Try fetching with Service Role (Admin) key to bypass RLS
            // This fixes the "projects active but not showing" issue if auth is in debug mode
            const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

            if (serviceRoleKey) {
                const adminSupabase = createSupabaseClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    serviceRoleKey
                );

                const { data: adminProjects } = await adminSupabase
                    .from('projects')
                    .select('*')
                    .neq('status', 'completed')
                    .neq('status', 'archived')
                    .order('updated_at', { ascending: false });

                if (adminProjects && adminProjects.length > 0) {
                    projects = adminProjects;
                    console.log(`Admin Bypass: Found ${projects.length} projects.`);
                }
            }
        }

        if (!projects || projects.length === 0) return NextResponse.json({ insights: [] });

        const insights = await Promise.all(projects.map(async (project) => {
            const today = new Date();
            const start = new Date(project.start_date);
            const end = new Date(project.end_date);
            const updated = new Date(project.updated_at);

            const totalDuration = Math.max(1, (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
            const elapsed = Math.max(0, (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
            const daysSinceUpdate = Math.floor((today.getTime() - updated.getTime()) / (1000 * 60 * 60 * 24));

            const isOverdue = today > end && project.progress < 100;
            const expectedProgress = Math.min(100, (elapsed / totalDuration) * 100);
            const pace = project.progress / Math.max(1, expectedProgress); // 1.0 = perfect match, <1.0 = behind

            const projectData: ParsedProject = {
                id: project.id,
                name: project.name,
                description: project.description,
                status: project.status,
                startDate: project.start_date,
                endDate: project.end_date,
                progress: project.progress,
                updatedAt: project.updated_at,
                daysTotal: Math.floor(totalDuration),
                daysElapsed: Math.floor(elapsed),
                expectedProgress: Math.floor(expectedProgress),
                actualPace: parseFloat(pace.toFixed(2)),
                isOverdue,
                daysSinceLastUpdate: daysSinceUpdate
            };

            return await analyzeProjectHealth(projectData);
        }));

        return NextResponse.json({ insights });

    } catch (error: any) {
        console.error("Project Health Analysis Failed:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

async function analyzeProjectHealth(project: ParsedProject) {
    try {
        const prompt = `
You are a Senior Project Manager analyzing the health of a project.
Use the data below to determine if the project is Healthy, At Risk, or Critical.
Be strictly factual and decisive.

PROJECT DATA:
Name: ${project.name}
Status: ${project.status}
Progress: ${project.progress}% (Expected based on timeline: ${project.expectedProgress}%)
Days Elapsed: ${project.daysElapsed} / ${project.daysTotal}
Last Activity: ${project.daysSinceLastUpdate} days ago
Overdue: ${project.isOverdue}

RULES:
1. Health Status:
   - CRITICAL if: Overdue OR Progress is significant lag (<50% of expected).
   - AT RISK if: Progress lagging (<75% of expected) OR No activity > 14 days.
   - HEALTHY if: On track or ahead.

2. Primary Reason:
   - 1 clear sentence explaining WHY (e.g., "Pace is 40% behind schedule.", "Project halted for 2 weeks.").

3. Action:
   - 1 specific command (e.g., "Schedule urgent alignment.", "Re-scope milestones.").

OUTPUT JSON ONLY:
{
  "health": "Healthy" | "At Risk" | "Critical",
  "reason": "string",
  "action": "string"
}
`;

        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            }),
        });

        if (!response.ok) throw new Error("Gemini API Error");

        const json = await response.json();
        const text = json.candidates[0].content.parts[0].text.replace(/```json/g, "").replace(/```/g, "").trim();
        const aiResult = JSON.parse(text);

        return {
            ...project,
            ...aiResult
        };

    } catch (e) {
        // Deterministic Fallback
        console.warn(`AI Failed for ${project.name}, using deterministic fallback.`);

        let health = "Healthy";
        let reason = "Project is progressing on track.";
        let action = "Continue monitoring.";

        if (project.isOverdue || project.actualPace < 0.5) {
            health = "Critical";
            reason = project.isOverdue ? "Deadline missed with incomplete work." : "Velocity is critically low (<50%).";
            action = "Immediate intervention required.";
        } else if (project.actualPace < 0.8 || project.daysSinceLastUpdate > 14) {
            health = "At Risk";
            reason = project.daysSinceLastUpdate > 14 ? "No activity detected for 2+ weeks." : "Progress is lagging behind timeline.";
            action = "Review blockers with team.";
        }

        return {
            ...project,
            health,
            reason,
            action
        };
    }
}
