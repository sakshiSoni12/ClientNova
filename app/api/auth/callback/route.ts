import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const error = requestUrl.searchParams.get("error")
  const errorDescription = requestUrl.searchParams.get("error_description")

  // Handle OAuth errors
  if (error) {
    console.error("Auth error:", error, errorDescription)
    const redirectUrl = new URL("/login", requestUrl.origin)
    redirectUrl.searchParams.set("error", errorDescription || error)
    return NextResponse.redirect(redirectUrl)
  }

  if (!code) {
    const redirectUrl = new URL("/login", requestUrl.origin)
    redirectUrl.searchParams.set("error", "no_code")
    return NextResponse.redirect(redirectUrl)
  }

  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options)
              })
            } catch (error) {
              console.error("Error setting cookie:", error)
            }
          },
        },
      },
    )

    const { error: exchangeError, data } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error("Exchange error:", exchangeError)
      const redirectUrl = new URL("/login", requestUrl.origin)
      redirectUrl.searchParams.set("error", exchangeError.message)
      return NextResponse.redirect(redirectUrl)
    }

    // Verify session was created
    if (!data.session) {
      console.error("No session created after code exchange")
      const redirectUrl = new URL("/login", requestUrl.origin)
      redirectUrl.searchParams.set("error", "session_creation_failed")
      return NextResponse.redirect(redirectUrl)
    }

    // Success - redirect to intended page or Library
    const next = requestUrl.searchParams.get("next")
    const successUrl = new URL(next || "/saved", requestUrl.origin)
    successUrl.searchParams.set("logged_in", "true")
    return NextResponse.redirect(successUrl)
  } catch (error) {
    console.error("Unexpected error in callback:", error)
    const redirectUrl = new URL("/login", requestUrl.origin)
    redirectUrl.searchParams.set("error", "An unexpected error occurred")
    return NextResponse.redirect(redirectUrl)
  }
}
