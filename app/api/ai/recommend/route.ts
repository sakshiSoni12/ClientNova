import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function POST(req: Request) {
    try {
        const { answers } = await req.json();
        const supabase = await createClient();

        // Fetch our dynamic stories from Supabase
        const { data: stories, error } = await supabase
            .from('stories')
            .select('*');

        if (error || !stories || stories.length === 0) {
            console.error("Failed to fetch stories for AI:", error);
            // Fallback if no stories found
            return NextResponse.json({
                moodAnalysis: {
                    title: "The Library is Quiet",
                    description: "We could not reach the archives at this moment.",
                    intent: "Please try again later."
                },
                recommendations: []
            });
        }

        // Prepare library for AI prompt
        const libraryDocs = stories.map(s => ({
            id: s.id,
            title: s.title,
            genre: s.genre,
            tone: s.emotional_tone,
            synopsis: s.synopsis
        }));

        if (!process.env.GEMINI_API_KEY) {
            console.warn("No GEMINI_API_KEY found. using basic fallback.");
            // Return random 3 stories if no API key
            return NextResponse.json({
                moodAnalysis: {
                    title: "Quiet Reflection",
                    description: "You are seeking stories that mirror your inner state.",
                    intent: "I want to explore the unknown."
                },
                recommendations: stories.slice(0, 3).map(s => ({ ...s, reasoning: "Selected from our archives." }))
            });
        }

        // Contextual AI Prompt
        const prompt = `
      You are NovelAura, an emotionally intelligent reading companion.
      Analyze the user's reading mood based on their quiz answers:
      ${JSON.stringify(answers)}

      Match them with exactly 3 stories from this available library:
      ${JSON.stringify(libraryDocs)}

      Return a strict JSON object with this shape:
      {
        "moodAnalysis": {
          "title": "A poetic 3-4 word mood title (e.g. 'Seeking Quiet Light')",
          "description": "A 2 sentence deep, empathetic analysis of their mental state. Speak directly to them ('You are feeling...').",
          "intent": "A single first-person sentence capturing their desire (e.g. 'I want a story that feels like rain.')"
        },
        "recommendations": [
          {
            "storyId": "UUID string (must match the library ID)",
            "reasoning": "A single sentence explaining strictly WHY this story fits their current mood. Be poetic but specific."
          }
        ]
      }
      Do not include markdown formatting like \`\`\`json. Just the raw JSON.
    `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
        const aiData = JSON.parse(responseText);

        // Hydrate recommendations with full story data
        const hydratedRecs = aiData.recommendations.map((rec: any) => {
            const original = stories.find(s => s.id === rec.storyId);
            if (!original) return null;
            return {
                ...original,
                // Map fields to match what the UI might expect if it differs, 
                // but since we are controlling the UI, let's just pass everything.
                // NOTE: The UI expects 'author' but our stories don't have authors in DB yet.
                // We'll add a 'NovelAura' placeholder author.
                author: "NovelAura Original",
                reasoning: rec.reasoning
            };
        }).filter(Boolean);

        return NextResponse.json({
            moodAnalysis: aiData.moodAnalysis,
            recommendations: hydratedRecs
        });

    } catch (error) {
        console.error("AI Recommendation Error:", error);
        return NextResponse.json({
            moodAnalysis: { title: "Error", description: "Something went wrong.", intent: "" },
            recommendations: []
        }, { status: 500 });
    }
}
