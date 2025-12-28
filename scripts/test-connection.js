const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ltvlxsvksepqlxkoerdp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0dmx4c3Zrc2VwcWx4a29lcmRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNDUzNjksImV4cCI6MjA4MTgyMTM2OX0.b9YWe3_9uhn22aEXaK-7GTSzzlYlsxtg4i209bkHNTY';

console.log("Testing connection to:", SUPABASE_URL);

// Custom fetch with longer timeout
const customFetch = async (url, options) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds

    try {
        const res = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(timeoutId);
        return res;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
};

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false },
    global: { fetch: customFetch }
});

async function testConnection() {
    try {
        console.log("Attempting fetch with 30s timeout...");
        const start = Date.now();
        const { data, error } = await supabase.from('clients').select('id').limit(1);
        const duration = Date.now() - start;

        if (error) {
            console.error("CONNECTION FAILED:", error.message);
        } else {
            console.log("CONNECTION SUCCESSFUL!");
            console.log(`Fetched ${data.length} rows in ${duration}ms`);
        }
    } catch (err) {
        console.error("CRITICAL ERROR:", err.message);
        if (err.cause) console.error("Cause:", err.cause);
    }
}

testConnection();
