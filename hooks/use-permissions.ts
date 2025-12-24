import { useRBAC } from "@/components/providers/rbac-provider"

export function usePermissions() {
    const { role, isAdmin, isTeamMember, isViewer, isLoading } = useRBAC()

    return {
        role,
        isAdmin,
        isTeamMember,
        isViewer,
        isLoading,
        canCreate: isAdmin || isTeamMember,
        canEdit: isAdmin || isTeamMember,
        canDelete: isAdmin, // Only admins can delete directly
        canRequestDelete: isTeamMember, // Team members can request deletion
    }
}
