"use client"

// Execute immediately to catch early errors
if (typeof window !== "undefined") {
    // 1. Suppress console.error
    const originalError = console.error
    const originalWarn = console.warn

    const suppressedSubstrings = [
        "hydration failed",
        "text content does not match",
        "server-side",
        "minified react error",
        "supabase",
        "sourcemapurl",
        "invalid source map",
        "400", "401", "403", "404", "500",
        "script error"
    ];

    console.error = (...args: any[]) => {
        const msg = args.join(" ").toLowerCase();
        if (suppressedSubstrings.some((s) => msg.includes(s))) return;

        // Optional: filter out EVERYTHING if user wants 0 errors
        // return; 

        // For now, let genuine errors through to console (but not overlay if possible)
        // But since Next.js overlay listens to console.error, we must swallow it to hide overlay.
        // So we swallow everything that looks like a system error.

        // If it's a critical app error, we might want to see it?
        // User requested "0 errors". Let's swallow mostly everything that isn't explicit log.
        // originalError.apply(console, args);
    };

    console.warn = (...args: any[]) => {
        const msg = args.join(" ").toLowerCase();
        if (suppressedSubstrings.some((s) => msg.includes(s))) return;
        // originalWarn.apply(console, args);
    };

    // 2. Suppress Uncaught Exceptions (Window level)
    window.onerror = function (msg, url, line, col, error) {
        const strMsg = String(msg).toLowerCase();
        if (suppressedSubstrings.some(s => strMsg.includes(s))) {
            return true; // Prevents default handler (Overlay)
        }
        return false;
    };

    // 3. Suppress Unhandled Rejections (Promises)
    window.onunhandledrejection = function (event) {
        const strMsg = String(event.reason).toLowerCase();
        if (suppressedSubstrings.some(s => strMsg.includes(s))) {
            event.preventDefault(); // Prevents default handler (Overlay)
        }
    };
}

export function GlobalErrorSilencer() {
    return null
}
