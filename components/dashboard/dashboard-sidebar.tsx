"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { BarChart3, Briefcase, FolderOpen, Home, Settings, Share2, UserPlus, Users, Sparkles, ShieldAlert, Brain, Activity, BrainCircuit } from "lucide-react"


// New imports
import { motion } from "framer-motion"
import { ScrollArea } from "@/components/ui/scroll-area"
import { usePermissions } from "@/hooks/use-permissions"


export function DashboardSidebar({ className }: { className?: string }) {
  const pathname = usePathname()
  const { isAdmin } = usePermissions()

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/dashboard/projects", label: "Projects", icon: Briefcase },
    { href: "/dashboard/clients", label: "Clients", icon: Users },
    { href: "/dashboard/client-intelligence", label: "Client Intelligence", icon: Brain },
    { href: "/dashboard/project-health", label: "Project Health", icon: Activity },
    { href: "/dashboard/smart-hub", label: "Smart Hub", icon: BrainCircuit },
    { href: "/dashboard/team", label: "Team", icon: UserPlus },
    { href: "/dashboard/social", label: "Social", icon: Share2 },
    { href: "/dashboard/reports", label: "Reports", icon: BarChart3 },
    { href: "/dashboard/files", label: "Files", icon: FolderOpen },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ]



  return (
    <aside className={cn("w-64 border-r border-border/40 bg-background/95 backdrop-blur-xl flex flex-col h-full sticky top-0 z-30", className)}>
      <div className="p-6 pb-2">
        <Link href="/dashboard" className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight">ClientNova</span>
            <span className="text-xs text-muted-foreground font-medium">Workspace</span>
          </div>
        </Link>
      </div>

      <ScrollArea className="flex-1 px-4 py-4">
        <div className="flex flex-col gap-6">
          <div className="space-y-1.5">
            {links.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href
              return (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3 relative overflow-hidden group transition-all duration-300",
                      isActive && "bg-primary/10 text-primary hover:bg-primary/20",
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="active-pill"
                        className="absolute inset-0 bg-primary/10 border-l-2 border-primary"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      />
                    )}
                    <Icon className={cn("w-5 h-5 transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                    <span className="relative z-10">{link.label}</span>
                  </Button>
                </Link>
              )
            })}
          </div>

          {isAdmin && (
            <div className="space-y-1.5 pt-2 border-t border-border/50">
              <div className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Admin
              </div>
              <Link href="/dashboard/admin/users">
                <Button variant="ghost" className="w-full justify-start gap-3 group">
                  <Users className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  User Roles
                </Button>
              </Link>
              <Link href="/dashboard/admin/approvals">
                <Button variant="ghost" className="w-full justify-start gap-3 group">
                  <ShieldAlert className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  Approvals
                </Button>
              </Link>
            </div>
          )}
        </div>
      </ScrollArea>

    </aside>
  )
}
