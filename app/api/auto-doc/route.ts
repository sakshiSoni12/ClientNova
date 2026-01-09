import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export async function POST(request: Request) {
    try {
        const { clientId, rawText } = await request.json();
        const supabase = await createClient();

        if (!clientId || !rawText) return NextResponse.json({ error: "Missing Input" }, { status: 400 });

        // 1. AI Summarization Phase
        const prompt = `
You are an Executive Assistant. 
Summarize the following raw meeting notes into a clean, structured record.

RAW TEXT:
"${rawText}"

TASK:
1. Extract "DECISIONS" (What was agreed).
2. Extract "ACTIONS" (Who needs to do what).
3. Keep it extremely concise. Bullet points only.

OUTPUT FORMAT (Plain Text):
[DATE] Meeting Summary
**Decisions**:
- ...
**Actions**:
- ...
`;

        // AI Call
        let summary = "";
        try {
            const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });
            const json = await response.json();
            summary = json.candidates[0].content.parts[0].text;
        } catch (e) {
            // Fallback if AI fails: just save the raw text with a header
            summary = `[DATE] Manual Entry\n${rawText}`;
        }

        // 2. Fetch existing notes to append
        const { data: client } = await supabase.from('clients').select('notes').eq('id', clientId).single();

        const newNotes = client?.notes
            ? `${client.notes}\n\n---\n${summary}`
            : summary;

        // 3. Save to Supabase
        // Note: In a real "Additive Only" constraint, we might prefer a new table 'client_logs'. 
        // But the brief says "Automatically saved under the specific client's history/timeline".
        // Assuming 'notes' field is the history for now as per previous context on "no new tables".
        const { error: updateError } = await supabase
            .from('clients')
            .update({ notes: newNotes })
            .eq('id', clientId);

        if (updateError) throw updateError;

        return NextResponse.json({ success: true, summary });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
