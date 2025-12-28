import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { analyzeClient } from "@/lib/client-intelligence/strategist";
import { ClientData } from "@/lib/client-intelligence/types";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { clientId } = body;

        if (!clientId) {
            return NextResponse.json(
                { error: "Invalid input: Missing clientId." },
                { status: 400 }
            );
        }

        const supabase = await createClient();

        // 1. Fetch Client Details
        const { data: client, error: clientError } = await supabase
            .from("clients")
            .select("*")
            .eq("id", clientId)
            .single();

        if (clientError || !client) {
            return NextResponse.json({ error: "Client not found" }, { status: 404 });
        }

        // 2. Fetch Client Projects
        const { data: projects, error: projectError } = await supabase
            .from("projects")
            .select("*")
            .eq("client_id", clientId);

        // 3. Construct the Payload for AI
        // Since we lack specific tables for payments/emails, we infer patterns or use placeholders.
        
        // Analyze projects for "delays" (simple check: if end_date < now and status != 'completed')
        const now = new Date();
        let delaysCount = 0;
        let activeProjectsPhase = "No active projects";

        if (projects && projects.length > 0) {
             const active = projects.find((p: any) => p.status !== 'completed' && p.status !== 'cancelled');
             if (active) activeProjectsPhase = active.status || "Ongoing";
             
             projects.forEach((p: any) => {
                if (p.end_date && new Date(p.end_date) < now && p.status !== 'completed') {
                    delaysCount++;
                }
             });
        }

        // We construct a narrative for the notes field to help the AI
        let enrichedNotes = client.notes || "No manual notes provided.";
        enrichedNotes += `\n[System Context]: Client Company: ${client.company || 'N/A'}. Industry: ${client.industry || 'N/A'}.`;
        
        const aiPayload: ClientData = {
            client_name: client.name,
            client_notes: enrichedNotes,
            email_summary: "Email integration not active. infer mood from notes/projects.",
            project_status: {
                current_phase: activeProjectsPhase,
                delays_count: delaysCount,
                last_feedback_days_ago: 0 // We don't track this yet, default to 0
            },
            payment_history: {
                // We default these as we don't have the table
                total_invoices: 0,
                paid_on_time: 0,
                late_payments: 0,
                outstanding_amount: 0
            },
            recent_activity: {
                meetings_attended: 0,
                missed_meetings: 0,
                response_pattern: "Data Unavailable"
            }
        };

        // 4. Run Analysis
        // We reuse the existing strategist function as it handles the AI interaction perfectly
        const analysis = await analyzeClient(aiPayload);

        return NextResponse.json(analysis);

    } catch (error) {
        console.error("Real Client Intelligence Analysis Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
