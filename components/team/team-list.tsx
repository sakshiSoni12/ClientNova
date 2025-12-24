"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Plus, Trash2, Loader2, UserX } from "lucide-react"
import { AddTeamMemberDialog } from "./add-team-member-dialog"
import { useToast } from "@/components/ui/use-toast"

interface Profile {
  id: string
  full_name: string | null
  role: string | null
  avatar_url: string | null
}

interface TeamMember {
  id: string
  profile_id: string
  project_id: string | null
  role: string | null
  created_at: string
  profiles?: Profile
  projects?: { name: string }
}

export function TeamList() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchMembers = async () => {
    // We don't set global isLoading to true here to avoid flickering on re-fetch
    const supabase = createClient()
    const { data } = await supabase
      .from("team_members")
      .select("*, profiles(id, full_name, role, avatar_url), projects(name)")
      .order("created_at", { ascending: false })

    if (data) setMembers(data)
    setIsLoading(false)
  }

  useEffect(() => {
    fetchMembers()
  }, [])

  const handleMemberAdded = () => {
    fetchMembers()
    setIsDialogOpen(false)
    toast({ title: "Team member assigned", description: "Successfully assigned member to project." })
  }

  const handleDeleteMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this team member assignment?")) return

    setDeletingId(memberId)
    const supabase = createClient()
    const { error } = await supabase.from("team_members").delete().eq("id", memberId)

    if (error) {
      toast({
        title: "Failed to remove member",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({ title: "Assignment removed", description: "Team member has been unassigned." })
      await fetchMembers()
    }
    setDeletingId(null)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading team...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team</h1>
          <p className="text-muted-foreground mt-1">Manage team member assignments</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Assign Member
        </Button>
      </div>

      {members.length === 0 ? (
        <Card className="glass border-border/50 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
              <UserX className="w-8 h-8 opacity-40" />
            </div>
            <p className="text-lg font-medium mb-1">No team assignments</p>
            <p className="text-sm text-muted-foreground mb-4">Start by assigning users to projects.</p>
            <Button onClick={() => setIsDialogOpen(true)} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Assign First Member
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => (
            <Card key={member.id} className="glass border-border/50 hover:border-primary/50 transition-all hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {member.profiles?.full_name?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{member.profiles?.full_name || "Unknown"}</p>
                      {member.role && <p className="text-xs text-muted-foreground">{member.role}</p>}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteMember(member.id)}
                    disabled={deletingId === member.id}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    {deletingId === member.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </Button>
                </div>
                {member.projects && (
                  <div className="pt-3 border-t border-border mt-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Project</span>
                      <span className="font-medium bg-secondary px-2 py-0.5 rounded text-secondary-foreground">
                        {member.projects.name}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddTeamMemberDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} onMemberAdded={handleMemberAdded} />
    </div>
  )
}
