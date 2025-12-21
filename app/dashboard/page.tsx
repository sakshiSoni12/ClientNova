import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { StatsOverview } from "@/components/dashboard/stats-overview"
import { RecentClients } from "@/components/dashboard/recent-clients"
import { ActiveProjects } from "@/components/dashboard/active-projects"
import { MonthlyRevenueChart } from "@/components/dashboard/monthly-revenue-chart"

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Fetch user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  // Fetch stats
  const { count: clientsCount } = await supabase.from("clients").select("*", { count: "exact", head: true })

  const { count: projectsCount } = await supabase.from("projects").select("*", { count: "exact", head: true })

  const { count: activeProjectsCount } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true })
    .in("status", ["in_progress", "planning"])

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col">
        <DashboardHeader user={data.user} profile={profile} />

        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome back, {profile?.full_name || "User"}</h1>
              <p className="text-muted-foreground">Here's what's happening with your clients today.</p>
            </div>

            <StatsOverview
              clientsCount={clientsCount || 0}
              projectsCount={projectsCount || 0}
              activeProjectsCount={activeProjectsCount || 0}
            />

            <MonthlyRevenueChart />

            <div className="grid lg:grid-cols-2 gap-8">
              <RecentClients />
              <ActiveProjects />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
