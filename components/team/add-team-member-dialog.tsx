"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AddTeamMemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onMemberAdded: () => void
}

export function AddTeamMemberDialog({ open, onOpenChange, onMemberAdded }: AddTeamMemberDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [profiles, setProfiles] = useState<{ id: string; full_name: string | null }[]>([])
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      const { data: profilesData } = await supabase.from("profiles").select("id, full_name").order("full_name")
      const { data: projectsData } = await supabase.from("projects").select("id, name").order("name")

      if (profilesData) setProfiles(profilesData)
      if (projectsData) setProjects(projectsData)
    }
    if (open) fetchData()
  }, [open])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()

    const { error: insertError } = await supabase.from("team_members").insert({
      profile_id: formData.get("profile_id") as string,
      project_id: (formData.get("project_id") as string) || null,
      role: (formData.get("role") as string) || null,
    })

    if (insertError) {
      setError(insertError.message)
      setIsLoading(false)
      return
    }

    setIsLoading(false)
    onMemberAdded()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Team Member</DialogTitle>
          <DialogDescription>Assign a team member to a project</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="profile_id">Team Member *</Label>
            <Select name="profile_id" required>
              <SelectTrigger id="profile_id">
                <SelectValue placeholder="Select member" />
              </SelectTrigger>
              <SelectContent>
                {profiles.map((profile) => (
                  <SelectItem key={profile.id} value={profile.id}>
                    {profile.full_name || "Unknown"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="project_id">Project</Label>
            <Select name="project_id">
              <SelectTrigger id="project_id">
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Input id="role" name="role" placeholder="e.g. Designer, Developer" />
          </div>

          {error && <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">{error}</p>}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Assigning..." : "Assign Member"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
