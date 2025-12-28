import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { SocialMediaList } from "@/components/social/social-media-list"

export default async function SocialPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    // redirect("/auth/login")
    // console.log("Auth error:", error)
  }

  // MOCK Fallback for debug mode
  const userId = data?.user?.id || 'debug-user'

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).single()

  return (
    <div className="max-w-7xl mx-auto">
      <SocialMediaList />
    </div>
  )
}
