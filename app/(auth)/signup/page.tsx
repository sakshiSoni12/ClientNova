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

function SignUpContent() {
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

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push("/")
      }
    })
  }, [searchParams, router, supabase])

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    const normalizedEmail = email.trim().toLowerCase()

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
          setMessage("Connection failed. Please check your internet or settings.")
        } else {
          setMessage(error.message)
        }
      } else {
        setMessage("Check your email to begin.")
      }
    } catch (err: any) {
      console.error("Unexpected Error:", err)
      setMessage("An unexpected error occurred.")
    } finally {
      setLoading(false)
    }
  }

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
            <h1 className="font-serif text-3xl md:text-4xl">Begin Journey</h1>
            <p className="text-muted-foreground font-light">Your mood, your story. Let's start.</p>
          </div>

          <form onSubmit={handleSignUp} className="space-y-6">
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
              {loading ? "Creating..." : "Create Account"}
            </Button>
          </form>

          {message && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm font-light text-destructive/80"
            >
              {message}
            </motion.p>
          )}

          <div className="pt-4">
            <Link href="/login" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Already have an account? Enter here.
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <SignUpContent />
    </Suspense>
  )
}
