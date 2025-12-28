import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          const all = request.cookies.getAll()
          console.log("[Middleware] Cookies received:", all.map(c => c.name))
          return all
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
      global: {
        // Force IPv4 to resolve Node.js 18+ Undici timeouts on Windows
        fetch: (url, options) => {
          return fetch(url, {
            ...options,
            // @ts-ignore - Undici specific option
            dispatcher: new (require('undici').Agent)({
              connect: { lookup: (hostname: string, options: any, callback: any) => { require('dns').lookup(hostname, { family: 4 }, callback) } }
            })
          })
        }
      }
    },
  )

  // CHANGE: We call getUser() to trigger cookie refreshing (Supabase SSR),
  // but we IGNORE the result and NEVER redirect to login from here.
  // This matches the "Emergency Bypass" behavior requested by the user.
  try {
    await supabase.auth.getUser()
  } catch (error) {
    console.warn("[Middleware] checking user failed (ignoring to allow access):", error)
  }

  return supabaseResponse
}
