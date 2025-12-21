"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Plus, Trash2 } from "lucide-react"
import { AddTeamMemberDialog } from "./add-team-member-dialog"

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

  const fetchMembers = async () => {
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
  }

  const handleDeleteMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this team member assignment?")) return

    const supabase = createClient()
    const { error } = await supabase.from("team_members").delete().eq("id", memberId)

    if (!error) {
      fetchMembers()
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading team members...</div>
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
        <Card className="glass border-border/50">
          <CardContent className="text-center py-16">
            <p className="text-muted-foreground mb-4">No team assignments yet</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Assign First Member
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => (
            <Card key={member.id} className="glass border-border/50 hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {member.profiles?.full_name?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{member.profiles?.full_name || "Unknown"}</p>
                      {member.role && <p className="text-xs text-muted-foreground">{member.role}</p>}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteMember(member.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                {member.projects && (
                  <div className="pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground">Assigned to</p>
                    <p className="text-sm font-medium">{member.projects.name}</p>
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
