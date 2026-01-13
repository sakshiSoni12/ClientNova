<<<<<<< HEAD
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
=======
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
        console.error('Supabase Error: Missing environment variables - Using placeholders to prevent build crash')
    } else if (!supabaseAnonKey.startsWith('ey')) {
        console.warn('CRITICAL SUPABASE WARNING: Your Anon Key does NOT look like a valid JWT (it should start with "ey..."). You might be using a "Publishable Key" from another service or a legacy format. Please check your Supabase Dashboard.')
    }

    // Use placeholders if env vars are missing to allow build to proceed
    // The app will obviously not work until env vars are set, but it calls build successfully.
    return createBrowserClient(
        supabaseUrl || 'https://placeholder.supabase.co',
        supabaseAnonKey || 'placeholder-key'
    )
>>>>>>> 53d242c (in9n9)
}
