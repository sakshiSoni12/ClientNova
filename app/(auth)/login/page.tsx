"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { ArrowLeft } from "lucide-react"

function LoginContent() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const searchParams = useSearchParams()
  const router = useRouter()

  const supabase = createClient()

  useEffect(() => {
    const error = searchParams.get("error")
    if (error) {
      setMessage(`Error: ${decodeURIComponent(error)}`)
    }

    // Check if we already have a session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push("/")
      }
    })
  }, [searchParams, router, supabase])

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    const normalizedEmail = email.trim().toLowerCase()

    // Validation
    if (!normalizedEmail) {
      setMessage("Please enter your email.")
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
          shouldCreateUser: true,
        },
      })

      if (error) {
        console.error("Supabase Auth Error:", error)
        if (error.message === "Failed to fetch") {
          setMessage("Connection failed. Please check your internet or ad-blockers.")
        } else {
          setMessage(error.message)
        }
      } else {
        setMessage("Check your email for the magic link.")
      }
    } catch (err: any) {
      console.error("Unexpected Error:", err)
      setMessage("An unexpected error occurred. " + (err.message || ""))
    } finally {
      setLoading(false)
    }
  }

  // Auto-redirect if session activates
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        router.push("/saved")
      }
    })
    return () => subscription.unsubscribe()
  }, [supabase, router])

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-6">
      <div className="noise-overlay" />
      <div className="living-gradient" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 p-6 flex justify-between items-center">
        <Link href="/">
          <span className="font-serif italic text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
            <ArrowLeft size={16} /> Return
          </span>
        </Link>
        <ThemeToggle />
      </nav>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="w-full max-w-md z-10"
      >
        <div className="glass-panel p-12 md:p-16 text-center space-y-8">
          <div className="space-y-4">
            <h1 className="font-serif text-3xl md:text-4xl">Entrance</h1>
            <p className="text-muted-foreground font-light">To save your journey, we just need an email.</p>
          </div>

          <form onSubmit={handleSignIn} className="space-y-6">
            <Input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-transparent border-0 border-b border-muted-foreground/30 rounded-none px-0 py-4 text-center text-lg focus-visible:ring-0 focus-visible:border-primary placeholder:text-muted-foreground/30 transition-colors"
            />

            <Button
              type="submit"
              disabled={loading || !email}
              className="w-full rounded-full py-6 text-base font-serif bg-foreground text-background hover:bg-foreground/90 transition-all duration-700"
            >
              {loading ? "Sending..." : "Send Magic Link"}
            </Button>
          </form>

          {message && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className={`p-4 rounded-lg text-sm mt-4 text-left ${message.includes("check your internet")
                  ? "bg-red-500/10 text-red-500 border border-red-500/20"
                  : "bg-primary/5 text-primary border border-primary/10"
                }`}
            >
              <p className="font-medium">{message}</p>
              {!message.includes("failed") && (
                <p className="mt-2 text-xs opacity-70 font-semibold border-t border-primary/10 pt-2">
                  ⚠️ Important: You must click the Magic Link on <u>this specific device</u> to log in here. Clicking it on your phone will not log you in on your computer.
                </p>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  )
}
