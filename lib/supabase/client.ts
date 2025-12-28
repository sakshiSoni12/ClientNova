import { createBrowserClient } from '@supabase/ssr';

let client: ReturnType<typeof createBrowserClient> | undefined;

export function createClient() {
  if (client) return client;

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) console.error("FATAL: Supabase URL is missing!");
  console.log("Supabase Client Init - URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "Defined" : "MISSING");

  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  return client;
}
