"use client"

import { useRBAC } from "@/components/providers/rbac-provider"

interface WelcomeMessageProps {
    fallbackName?: string
}

export function WelcomeMessage({ fallbackName = "User" }: WelcomeMessageProps) {
    const { role } = useRBAC()

    // Map role to display name
    const getDisplayName = () => {
        if (!role) return fallbackName

        switch (role) {
            case "admin":
                return "Admin"
            case "team_member":
                return "Team Member"
            case "viewer":
                return "Viewer"
            default:
                // Capitalize first letter of unknown roles
                const roleStr = role as string;
                return roleStr.charAt(0).toUpperCase() + roleStr.slice(1)
        }
    }

    return (
        <h1 className="text-3xl font-bold mb-2">
            Welcome back, {getDisplayName()}
        </h1>
    )
}
