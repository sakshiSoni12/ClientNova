"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Sparkles } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [teamMemberId, setTeamMemberId] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      // 1. Sign in with Email/Password first
      const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) throw signInError
      if (!user) throw new Error("Authentication failed")

      // 2. Validate Team Member ID
      // Fetch the profile to check the ID
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('team_member_id, status')
        .eq('id', user.id)
        .single()

      if (profileError) {
        // If profile fetch fails, we should probably sign them out as it's an integrity issue
        await supabase.auth.signOut()
        throw new Error("Could not verify identity configuration.")
      }

      if (!profile) {
        await supabase.auth.signOut()
        throw new Error("User profile not found.")
      }

      // Check Status
      if (profile.status === 'disabled') {
        await supabase.auth.signOut()
        throw new Error("Account is disabled.")
      }

      // STRICT VALIDATION: Team Member ID must match
      // if (profile.team_member_id !== teamMemberId) {
      await supabase.auth.signOut()
      throw new Error("Invalid Team Member ID provided.")
      //}//

      // 3. Success
      router.refresh()
      router.push("/dashboard")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
      // Ensure we don't leave a half-logged-in state if ID validation failed locally
      if (error instanceof Error && error.message.includes("Invalid Team Member ID")) {
        // already signed out above
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-2xl font-semibold">ClientNova</span>
        </div>

        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>Sign in with your Team ID</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="teamMemberId">Team Member ID</Label>
                <Input
                  id="teamMemberId"
                  type="text"
                  placeholder="TM-1234"
                  required
                  value={teamMemberId}
                  onChange={(e) => setTeamMemberId(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
            <div className="mt-6 text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/auth/sign-up" className="text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
