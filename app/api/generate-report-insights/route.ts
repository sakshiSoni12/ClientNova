import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"

// Use GEMINI_API_KEY as primary to match project-health-monitor
const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || ""
const genAI = new GoogleGenerativeAI(API_KEY)

export async function POST(req: Request) {
    try {
        const { client, projects } = await req.json()

        if (!client || !projects) {
            return NextResponse.json({ error: "Missing data" }, { status: 400 })
        }

        // AI ATTEMPT
        if (API_KEY) {
            try {
                const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

                const prompt = `
            Act as a senior business consultant. Analyze the following client engagement data and generate an executive summary and actionable recommendations.

            Client: ${client.name} (${client.company || 'N/A'})
            Status: ${client.status}
            Projects: (${projects.length})
            ${projects.map((p: any) => `- ${p.name}: Status=${p.status}, Priority=${p.priority}, Budget=Rs. ${p.budget || 0}, Created=${new Date(p.created_at).toLocaleDateString()}`).join('\n')}

            Your output must be strict JSON in the following format:
            {
                "summary": "Values...",
                "recommendations": ["Rec 1...", "Rec 2...", "Rec 3..."],
                "health_status": "green" | "yellow" | "red"
            }

            Guidelines:
            1. Summary: 4-6 lines max. Professional, calm, neutral, consultant tone. No hype. Infer momentum and risk based on project statuses and count.
            2. Recommendation: 3-5 bullet points. Actionable, realistic, specific to the data (e.g. if many projects are 'in_progress', suggest review; if budget high, suggest optimization).
            3. Health Status: Infer purely from data (green=good, yellow=caution, red=risk).

            Do NOT include markdown formatting in JSON output.
            `

                const result = await model.generateContent(prompt)
                const response = await result.response
                const text = response.text()

                const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim()
                const jsonData = JSON.parse(cleanText)
                return NextResponse.json(jsonData)

            } catch (aiError) {
                console.error("Gemini AI Generation Failed:", aiError)
                // Fall through to deterministic logic
            }
        } else {
            console.warn("No API Key found (checked GEMINI_API_KEY and GOOGLE_API_KEY)")
        }

        // --- DETERMINISTIC FALLBACK (Project Health Logic) ---
        // This runs if AI fails or no key is present, ensuring user always gets a report.

        const activeProjects = projects.filter((p: any) => p.status === 'in_progress').length
        const completedProjects = projects.filter((p: any) => p.status === 'completed').length
        const totalBudget = projects.reduce((sum: number, p: any) => sum + (p.budget || 0), 0)

        // Generate Summary
        let summary = `Client engagement for ${client.name} is currently active. There are ${activeProjects} projects in progress and ${completedProjects} completed projects logged in the system. `

        if (totalBudget > 0) {
            summary += `The total accumulated budget across all initiatives is Rs. ${totalBudget.toLocaleString()}. `
        }

        if (activeProjects === 0 && completedProjects === 0) {
            summary = `This client currently has no active or completed projects listed. Engagement appears to be in an initial or dormant phase.`
        } else if (activeProjects > 2) {
            summary += `Activity level is high, indicating strong momentum. `
        } else {
            summary += `Engagement cadence is steady. `
        }

        // Generate Recommendations
        const recommendations = []

        if (activeProjects > 3) {
            recommendations.push("Review resource allocation due to high volume of active projects.")
            recommendations.push("Schedule a sync to prioritize upcoming deliverables.")
        } else if (activeProjects === 0) {
            recommendations.push("Propose new initiatives to re-engage client.")
            recommendations.push("Review past completed projects for upsell opportunities.")
        } else {
            recommendations.push("Maintain current regular check-in cadence.")
            recommendations.push("Monitor budget utilization for active work streams.")
        }

        if (!client.email || !client.phone) {
            recommendations.push("Update client contact details to ensure communication channels are clear.")
        }

        return NextResponse.json({
            summary,
            recommendations,
            health_status: activeProjects > 0 ? "green" : "yellow"
        })

    } catch (error: any) {
        console.error("Critical Error in Report Insights:", error)
        return NextResponse.json({ error: error.message || "Failed to generate insights" }, { status: 500 })
    }
}
