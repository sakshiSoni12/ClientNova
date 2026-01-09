import { NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
// Trying a generally stable model version, but we have a fallback now so it matters less.
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

// --- FALLBACK LOGIC ---
const FALLBACK_TEMPLATES: Record<string, Record<string, string[]>> = {
    "no_reply": {
        "Polite": [
            "Hi {name},\n\nI hope you’re having a good week.\n\nI’m writing to bubble this up to the top of your inbox. We’re ready to move forward whenever you are.\n\nLet me know if you need any further information from my end.\n\nBest,",
            "Hi {name},\n\nJust a gentle nudge on this.\n\nWe’d love to keep the momentum going. Do you have a moment to review the latest update?\n\nThanks,"
        ],
        "Professional": [
            "Hi {name},\n\nFollowing up on my previous message regarding the project status.\n\nPlease let us know if there are any blockers on your end, or if we should proceed with the current plan.\n\nRegards,",
            "Hello {name},\n\nChecking in to ensure we stay on timeline.\n\nCould you please confirm if you’ve had a chance to review the pending items? We are standing by to proceed.\n\nBest,"
        ],
        "Firm": [
            "Hi {name},\n\nI’m following up as we haven’t heard back yet.\n\nTo avoid any impact on the project timeline, we need your input by end of week. Please let us know your status.\n\nThanks,",
            "Hello {name},\n\nWe are currently paused waiting for your feedback.\n\nPlease reply at your earliest convenience so we can avoid rescheduling the next phase.\n\nRegards,"
        ],
        "Friendly": [
            "Hey {name},\n\nJust checking in! 🌟\n\nHope everything is going well. We’re excited to move to the next step—just need a quick green light from you.\n\nLet me know!\n\nBest,",
            "Hi {name},\n\nHope you’re having a great week!\n\nJust wanted to see if you’ve had a chance to look at the last update. We’re ready when you are.\n\nCheers,"
        ]
    },
    "payment_overdue": {
        "Polite": [
            "Hi {name},\n\nI hope you’re doing well.\n\nThis is a friendly reminder that invoice #{invoice_id} is now overdue. Could you please check on the status of this payment?\n\nThank you,",
            "Hi {name},\n\nJust a heads-up that we haven’t received payment for the latest invoice yet.\n\nIf this has already been sent, please disregard. Otherwise, we’d appreciate it if you could process it soon.\n\nBest,"
        ],
        "Professional": [
            "Hi {name},\n\nWe noticed that our latest invoice is past due.\n\nPlease kindly process the payment at your earliest convenience to ensure uninterrupted service.\n\nLet us know if you need another copy of the invoice.\n\nRegards,",
            "Hello {name},\n\nThis is a reminder regarding the outstanding balance on your account.\n\nPlease remit payment as soon as possible via the usual method.\n\nThank you,"
        ],
        "Firm": [
            "Hi {name},\n\nWe are writing to address the outstanding invoice which is now significantly overdue.\n\nPlease settle this balance immediately to avoid any service disruption or late fees.\n\nRegards,",
            "Hello {name},\n\nYour account is showing an overdue balance.\n\nWe require payment to be cleared by tomorrow to continue our work on the project. Please treat this with urgency.\n\nThanks,"
        ],
        "Friendly": [
            "Hey {name},\n\nHope you’re doing well!\n\nLooks like we missed a payment for the latest invoice. Could you take a look when you get a second?\n\nThanks so much!",
            "Hi {name},\n\nJust a quick ping on the open invoice!\n\nI’m sure it just got buried, but if you could sort that out today, that would be amazing. Thanks!\n\nBest,"
        ]
    },
    "project_delivered": {
        "Polite": [
            "Hi {name},\n\nWe’re happy to let you know the project has been delivered!\n\nWe hope this meets your expectations. Please let us know if you have any questions.\n\nBest,",
        ],
        "Professional": [
            "Hi {name},\n\nConfirming that the final deliverables have been sent.\n\nIt has been a pleasure working on this. We look forward to your feedback.\n\nRegards,"
        ],
        "Firm": [
            "Hi {name},\n\nThe project is now marked as complete and delivered.\n\nPlease sign off on the final receipt so we can close the file.\n\nRegards,"
        ],
        "Friendly": [
            "Hey {name},\n\nProject delivered! 🎉\n\nWe loved working on this. Hope you love it as much as we do. Let us know what you think!\n\nCheers,"
        ]
    },
    "custom": {
        "Polite": ["Hi {name},\n\nRegarding: {custom}\n\nJust wanted to share a quick update on this. Let us know if this aligns with your thoughts.\n\nBest,"],
        "Professional": ["Hi {name},\n\nWriting to you about: {custom}\n\nPlease review the details and let us know how you would like to proceed.\n\nRegards,"],
        "Firm": ["Hi {name},\n\nI need to address: {custom}\n\nPlease give this your immediate attention.\n\nThanks,"],
        "Friendly": ["Hey {name},\n\nThinking about: {custom}\n\nWhat do you think? Let me know!\n\nBest,"]
    }
};

function generateFallback(clientName: string, context: string, tone: string, customInput?: string): string {
    const contextKey = context === "custom" ? "custom" : context;
    const toneKey = tone || "Professional";

    // Get templates for this context/tone
    const templates = FALLBACK_TEMPLATES[contextKey]?.[toneKey] || FALLBACK_TEMPLATES["no_reply"]["Professional"];

    // Pick random template
    const template = templates[Math.floor(Math.random() * templates.length)];

    // Replace placeholders
    let message = template.replace("{name}", clientName.split(' ')[0]); // Use first name
    if (customInput) {
        message = message.replace("{custom}", customInput);
    }
    // Random fake invoice ID if needed
    message = message.replace("{invoice_id}", Math.floor(1000 + Math.random() * 9000).toString());

    return message;
}

export async function POST(request: Request) {
    let clientName = "";
    let context = "";
    let tone = "";
    let customInput = "";

    try {
        const body = await request.json();
        clientName = body.clientName;
        context = body.context;
        tone = body.tone;
        customInput = body.customInput;

        const prompt = `
You are a Senior Account Manager with 10+ years of experience.
Task: Write a single email to a client.
Tone: ${tone}
Context: ${context === 'custom' ? customInput : context}
Client: ${clientName}

Keep it professional, human, and concise (max 3 paragraphs). No jargon.
`;

        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            }),
        });

        if (!response.ok) {
            // Log but don't throw to user, simply use fallback
            console.warn(`Gemini API failed with ${response.status}, switching to fallback.`);
            throw new Error("API Failure");
        }

        const json = await response.json();
        if (!json.candidates?.[0]?.content) {
            throw new Error("Invalid format");
        }

        const message = json.candidates[0].content.parts[0].text.trim();
        return NextResponse.json({ message });

    } catch (error) {
        console.log("Using Local Fallback Generator due to error:", error);

        // --- FALLBACK EXECUTION ---
        // Ensure we have at least basic data
        const safeName = clientName || "Client";
        const safeContext = context || "no_reply";
        const safeTone = tone || "Professional";

        const fallbackMessage = generateFallback(safeName, safeContext, safeTone, customInput);

        // Return 200 OK with the fallback message. 
        // The frontend doesn't need to know it failed, it just wants a message.
        return NextResponse.json({ message: fallbackMessage });
    }
}
