import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const url = req.nextUrl.searchParams.get("url");

    if (!url) {
        return new NextResponse("Missing URL", { status: 400 });
    }

    try {
        console.log(`[Proxy] Fetching image: ${url}`);
        const response = await fetch(url, {
            headers: {
                // Mimic a browser request to avoid 403s on some storage configs
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[Proxy] Failed to fetch image. Status: ${response.status}, Body: ${errorText}`);
            throw new Error(`Failed to fetch image: ${response.status}`);
        }

        const blob = await response.blob();
        const buffer = Buffer.from(await blob.arrayBuffer());

        return new NextResponse(buffer, {
            headers: {
                "Content-Type": response.headers.get("Content-Type") || "image/jpeg",
                "Access-Control-Allow-Origin": "*",
                "Cache-Control": "public, max-age=3600"
            },
        });
    } catch (error: any) {
        console.error("[Proxy] Critical Error:", error);
        return new NextResponse(JSON.stringify({ error: "Failed to fetch image", details: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
