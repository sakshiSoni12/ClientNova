import { ClientData, IntelligenceOutput } from "./types";

const GEMINI_API_KEY = "AIzaSyBNfU1nAROVgtZWHgm87mXPq8_ONgL2qHA";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

export async function analyzeClient(data: ClientData): Promise<IntelligenceOutput> {
    const prompt = `
  You are a Senior Client Success Strategist with 12+ years of experience at a premium brand studio.
  Your role is to analyze client data and produce calm, experienced human judgment.
  
  TASK:
  Analyze the following client data and return a JSON object with strategic insights.
  
  INPUT DATA:
  ${JSON.stringify(data, null, 2)}
  
  STRICT OUTPUT SCHEMA (JSON ONLY, NO MARKDOWN, NO EXPLANATIONS):
  {
    "client_mood": "Calm | Anxious | Happy | Ghosting",
    "risk_level": "Low | Medium | High",
    "confidence_score": number (0-100),
    "key_signals": [
      "string (short factual observation)",
      "string (short factual observation)",
      "string (short factual observation)"
    ],
    "next_best_action": "string (one clear recommendation, senior-level advice in plain professional English)",
    "tone_guidance": "string (how to communicate next)"
  }
  
  REASONING GUIDELINES:
  1. Mood: Infer from response patterns, feedback timing, and meetings. Ghosting is specific (no reply).
  2. Risk: Weigh payment history and engagement heavily.
  3. Action: Must be specific, realistic, and senior-level (e.g., "Schedule alignment call", "Pause work", "Upsell").
  4. Signals: Exactly 3 key distinct points driving the assessment.
  `;

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    responseMimeType: "application/json"
                }
            }),
        });

        if (!response.ok) {
            throw new Error(`Gemini API Error: ${response.statusText}`);
        }

        const json = await response.json();
        const textResponse = json.candidates[0].content.parts[0].text;

        // Clean up markdown code blocks if present (Gemini sometimes adds them despite instructions)
        const cleanJson = textResponse.replace(/```json/g, "").replace(/```/g, "").trim();

        return JSON.parse(cleanJson) as IntelligenceOutput;
    } catch (error) {
        console.error("AI Analysis Failed:", error);
        // Fallback to a safe default if AI fails, to prevent app crash
        return {
            client_mood: "Calm",
            risk_level: "Low",
            confidence_score: 0,
            key_signals: ["AI Service unreachable", "Using fallback mode", "Data preserved"],
            next_best_action: "Manual review recommended due to system connectivity issue.",
            tone_guidance: "Professional and direct."
        };
    }
}
