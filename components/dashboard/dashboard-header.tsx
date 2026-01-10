"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Bell, Search } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import type { User } from "@supabase/supabase-js"
import { cn } from "@/lib/utils"
import { useSearchParams, usePathname, useRouter } from "next/navigation"
import { useCallback } from "react"

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { DashboardSidebar } from "./dashboard-sidebar"
import { NotificationsPopover } from "./notifications-popover"

interface DashboardHeaderProps {
  user: User
  profile: { full_name?: string } | null
  className?: string
}

export function DashboardHeader({ user, profile, className }: DashboardHeaderProps) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { replace } = useRouter()

  // ... (keep logic same)

  const initials = profile?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() ||
    user.email?.[0].toUpperCase() ||
    "U"

  const handleSearch = useCallback((term: string) => {
    // ... (keep logic same)
    const params = new URLSearchParams(searchParams)
    if (term) {
      params.set('search', term)
    } else {
      params.delete('search')
    }
    replace(`${pathname}?${params.toString()}`)
  }, [searchParams, pathname, replace])

  return (
    <header className={cn("border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10", className)}>
      <div className="flex items-center justify-between px-4 md:px-6 py-3">
        <div className="flex items-center gap-4 flex-1 max-w-md">
          {/* Mobile Menu Trigger */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="mr-2">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 bg-transparent border-none">
                <DashboardSidebar className="w-full h-full border-none bg-background/95 backdrop-blur-xl relative" />
              </SheetContent>
            </Sheet>
          </div>

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              onChange={(e) => handleSearch(e.target.value)}
              defaultValue={searchParams.get('search')?.toString()}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <div className="hidden md:block">
            <ThemeToggle />
          </div>
          <NotificationsPopover />

          <Avatar className="w-8 h-8 md:w-10 md:h-10">
            <AvatarFallback className="bg-primary/10 text-primary font-medium">{initials}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
