import { redirect } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { SettingsForm } from "@/components/settings/settings-form"

export default async function SettingsPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    // redirect("/auth/login")
    // console.log("Auth error:", error)
  }

  // MOCK Fallback for debug mode
  const userId = data?.user?.id || 'debug-user'
  const safeUser = data?.user || { id: 'debug-user', email: 'debug@clientnova.com' } as any

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).single()

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Profile</h3>
        <p className="text-sm text-muted-foreground">
          This is how others will see you on the site.
        </p>
      </div>
      <Separator />
      <SettingsForm user={safeUser} profile={profile} />
    </div>
  )
}
