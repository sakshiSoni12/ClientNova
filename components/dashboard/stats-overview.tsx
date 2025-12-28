"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Users, FolderKanban, TrendingUp } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface StatsOverviewProps {
  initialClientsCount?: number
  initialProjectsCount?: number
  initialActiveProjectsCount?: number
}

export function StatsOverview({
  initialClientsCount = 0,
  initialProjectsCount = 0,
  initialActiveProjectsCount = 0
}: StatsOverviewProps) {
  const [counts, setCounts] = useState({
    clients: initialClientsCount,
    projects: initialProjectsCount,
    activeProjects: initialActiveProjectsCount
  })

  // Use client-side fetching to guarantee data visibility (bypassing potentially broken server auth)
  useEffect(() => {
    const fetchStats = async () => {
      const supabase = createClient()

      // Parallel fetching for speed
      const [clientsRes, projectsRes, activeRef] = await Promise.all([
        supabase.from("clients").select("*", { count: "exact", head: true }),
        supabase.from("projects").select("*", { count: "exact", head: true }),
        supabase.from("projects").select("*", { count: "exact", head: true }).in("status", ["in_progress", "planning"])
      ])

      setCounts({
        clients: clientsRes.count || 0,
        projects: projectsRes.count || 0,
        activeProjects: activeRef.count || 0
      })
    }

    fetchStats()
  }, [])

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card className="glass border-border/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Clients</p>
              <p className="text-3xl font-bold">{counts.clients}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass border-border/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Projects</p>
              <p className="text-3xl font-bold">{counts.projects}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <FolderKanban className="w-6 h-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass border-border/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Active Projects</p>
              <p className="text-3xl font-bold">{counts.activeProjects}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
