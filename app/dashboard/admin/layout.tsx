"use client"

import { usePermissions } from "@/hooks/use-permissions"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { isAdmin, isLoading } = usePermissions()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && !isAdmin) {
            router.push("/dashboard")
            // You might also want to show a toast "Access Denied"
        }
    }, [isAdmin, isLoading, router])

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!isAdmin) {
        return null
    }

    return <div className="space-y-6">{children}</div>
}
