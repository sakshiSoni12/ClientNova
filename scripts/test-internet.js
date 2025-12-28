const https = require('https');

console.log("Testing general internet connectivity...");

const urls = [
    'https://www.google.com',
    'https://example.com',
    'https://ltvlxsvksepqlxkoerdp.supabase.co' // The problematic one
];

async function testUrl(url) {
    return new Promise((resolve) => {
        const start = Date.now();
        const req = https.get(url, { timeout: 5000 }, (res) => {
            res.on('data', () => { }); // Consume
            res.on('end', () => {
                console.log(`[SUCCESS] ${url} - Status: ${res.statusCode} (${Date.now() - start}ms)`);
                resolve(true);
            });
        });

        req.on('error', (err) => {
            console.error(`[FAILED] ${url} - Error: ${err.message}`);
            resolve(false);
        });

        req.on('timeout', () => {
            req.destroy();
            console.error(`[TIMEOUT] ${url}`);
            resolve(false);
        });
    });
}

(async () => {
    console.log("--- Starting Tests ---");
    for (const url of urls) {
        await testUrl(url);
    }
    console.log("--- Finished ---");
})();
