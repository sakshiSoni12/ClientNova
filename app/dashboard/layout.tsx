import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.getUser()
    if (error || !data?.user) {
        redirect("/auth/login")
    }

    // Fetch user profile
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950/20">
            <div className="p-4 hidden md:block h-screen sticky top-0">
                <DashboardSidebar className="h-full rounded-3xl shadow-sm border-none bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl" />
            </div>

            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                <div className="p-4 pb-0">
                    <DashboardHeader user={data.user} profile={profile} className="rounded-2xl shadow-sm border-none bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl" />
                </div>

                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                    <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
