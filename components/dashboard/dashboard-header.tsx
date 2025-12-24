"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Bell, Search } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import type { User } from "@supabase/supabase-js"
import { cn } from "@/lib/utils"

interface DashboardHeaderProps {
  user: User
  profile: { full_name?: string } | null
  className?: string
}

export function DashboardHeader({ user, profile, className }: DashboardHeaderProps) {
  const initials =
    profile?.full_name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() ||
    user.email?.[0].toUpperCase() ||
    "U"

  return (
    <header className={cn("border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10", className)}>
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-4 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search clients, projects..."
              className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
          </Button>

          <Avatar>
            <AvatarFallback className="bg-primary/10 text-primary font-medium">{initials}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
