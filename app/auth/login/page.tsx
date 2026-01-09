"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client" // Correct client import
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { InteractiveLogo } from "@/components/interactive-logo"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // DEBUG STATE: keep logs in console, but don't show on UI to keep it clean
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw new Error(error.message)
      }

      // Force hard reload/redirect to ensure dashboard hydration
      window.location.href = "/dashboard"

    } catch (err: any) {
      setError(err.message || "An error occurred during sign in")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <InteractiveLogo
            width={40}
            height={40}
            containerClassName="rounded-xl bg-background"
          />
          <span className="text-2xl font-semibold">ClientNova</span>
        </div>

        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>Enter your credentials to access your dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
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
                  placeholder="Enter your password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Error:</span> {error}
                  </div>
                  {error.includes("Email not confirmed") && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-1 border-destructive/50 text-destructive hover:bg-destructive/10"
                      onClick={async (e) => {
                        e.preventDefault();
                        const supabase = createClient();
                        const { error: resendError } = await supabase.auth.resend({
                          type: 'signup',
                          email,
                          options: {
                            emailRedirectTo: `${window.location.origin}/auth/callback`
                          }
                        });
                        if (resendError) {
                          setError(resendError.message);
                        } else {
                          setError("Confirmation email sent! Please check your inbox.");
                        }
                      }}
                    >
                      Resend Confirmation Email
                    </Button>
                  )}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
            </form>
            <div className="mt-6 text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/auth/sign-up" className="text-primary hover:underline">
                Create Account
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
