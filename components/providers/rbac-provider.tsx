"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

type UserRole = "admin" | "team_member" | "viewer"

interface RBACContextType {
    role: UserRole
    isLoading: boolean
    isAdmin: boolean
    isTeamMember: boolean
    isViewer: boolean
    refreshRole: () => Promise<void>
}

const RBACContext = createContext<RBACContextType>({
    role: "viewer",
    isLoading: true,
    isAdmin: false,
    isTeamMember: false,
    isViewer: true,
    refreshRole: async () => { },
})

export function RBACProvider({ children }: { children: React.ReactNode }) {
    const [role, setRole] = useState<UserRole>("viewer")
    const [isLoading, setIsLoading] = useState(true)
    const supabase = createClient()
    const router = useRouter()

    const fetchRole = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                setRole("viewer")
                setIsLoading(false)
                return
            }

            const { data: profile } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", user.id)
                .single()

            if (profile?.role) {
                setRole(profile.role as UserRole)
            } else {
                // Default to viewer if no profile found
                setRole("viewer")
            }
        } catch (error) {
            console.error("Error fetching role:", error)
            setRole("viewer")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchRole()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
            fetchRole()
        })

        return () => {
            subscription.unsubscribe()
        }
    }, [])

    const value = {
        role,
        isLoading,
        isAdmin: role === "admin",
        isTeamMember: role === "team_member",
        isViewer: role === "viewer",
        refreshRole: fetchRole,
    }

    return <RBACContext.Provider value={value}>{children}</RBACContext.Provider>
}

export const useRBAC = () => useContext(RBACContext)
