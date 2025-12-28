import { NextResponse } from "next/server";
import { analyzeClient } from "@/lib/client-intelligence/strategist";
import { ClientData } from "@/lib/client-intelligence/types";

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Basic validation to ensure required fields exist
        if (!body.client_name || !body.project_status || !body.payment_history) {
            return NextResponse.json(
                { error: "Invalid input: Missing required client data fields." },
                { status: 400 }
            );
        }

        const analysis = await analyzeClient(body as ClientData);

        return NextResponse.json(analysis);
    } catch (error) {
        console.error("Client Intelligence Analysis Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
