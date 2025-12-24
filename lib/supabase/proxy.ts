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
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (request.nextUrl.pathname.startsWith("/dashboard") && !user) {
      const url = request.nextUrl.clone()
      url.pathname = "/auth/login"
      return NextResponse.redirect(url)
    }

    return supabaseResponse
  } catch (error) {
    // If we get an error (like invalid refresh token), redirect to login
    // The cookies are already set to be cleared by Supabase client behavior in some cases,
    // but explicit redirect prevents the crash.
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    // Create a new response to force clear cookies if needed, or just redirect
    const response = NextResponse.redirect(url)

    // Attempt to clear session cookies explicitly to be safe
    response.cookies.delete('sb-access-token')
    response.cookies.delete('sb-refresh-token')
    // Note: The cookie name depends on your supabase configuration, usually sb-<project-ref>-auth-token

    return response
  }
}
