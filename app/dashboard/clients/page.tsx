import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { ClientsList } from "@/components/clients/clients-list"

export default async function ClientsPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col">
        <DashboardHeader user={data.user} profile={profile} />

        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <ClientsList />
          </div>
        </main>
      </div>
    </div>
  )
}
