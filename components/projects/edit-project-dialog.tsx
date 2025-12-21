"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Project {
  id: string
  client_id: string | null
  name: string
  description: string | null
  status: string
  priority: string
  start_date: string | null
  end_date: string | null
  budget: number | null
  progress: number
}

interface EditProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onProjectUpdated: () => void
  project: Project
}

export function EditProjectDialog({ open, onOpenChange, onProjectUpdated, project }: EditProjectDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [clients, setClients] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    const fetchClients = async () => {
      const supabase = createClient()
      const { data } = await supabase.from("clients").select("id, name").order("name")
      if (data) setClients(data)
    }
    if (open) fetchClients()
  }, [open])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()

    const { error: updateError } = await supabase
      .from("projects")
      .update({
        name: formData.get("name") as string,
        client_id: (formData.get("client_id") as string) || null,
        description: (formData.get("description") as string) || null,
        status: formData.get("status") as string,
        priority: formData.get("priority") as string,
        start_date: (formData.get("start_date") as string) || null,
        end_date: (formData.get("end_date") as string) || null,
        budget: formData.get("budget") ? Number.parseFloat(formData.get("budget") as string) : null,
        progress: Number.parseInt(formData.get("progress") as string) || 0,
        updated_at: new Date().toISOString(),
      })
      .eq("id", project.id)

    if (updateError) {
      setError(updateError.message)
      setIsLoading(false)
      return
    }

    setIsLoading(false)
    onProjectUpdated()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>Update the project information</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input id="name" name="name" required defaultValue={project.name} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_id">Client</Label>
              <Select name="client_id" defaultValue={project.client_id || undefined}>
                <SelectTrigger id="client_id">
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue={project.status}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select name="priority" defaultValue={project.priority}>
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input id="start_date" name="start_date" type="date" defaultValue={project.start_date || ""} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input id="end_date" name="end_date" type="date" defaultValue={project.end_date || ""} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">Budget ($)</Label>
              <Input
                id="budget"
                name="budget"
                type="number"
                step="0.01"
                placeholder="5000.00"
                defaultValue={project.budget || ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="progress">Progress (%)</Label>
              <Input id="progress" name="progress" type="number" min="0" max="100" defaultValue={project.progress} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" rows={3} defaultValue={project.description || ""} />
          </div>

          {error && <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">{error}</p>}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Project"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
