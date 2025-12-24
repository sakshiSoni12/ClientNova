"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { AddProjectDialog } from "./add-project-dialog"
import { EditProjectDialog } from "./edit-project-dialog"

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
  created_at: string
  clients?: { name: string }
}

import { usePermissions } from "@/hooks/use-permissions"
import { useToast } from "@/components/ui/use-toast"

export function ProjectsList() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  const { canCreate, canEdit, canDelete, canRequestDelete } = usePermissions()
  const { toast } = useToast()

  const fetchProjects = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from("projects")
      .select("*, clients(name)")
      .order("created_at", { ascending: false })

    if (data) setProjects(data)
    setIsLoading(false)
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const handleProjectAdded = () => {
    fetchProjects()
    setIsDialogOpen(false)
  }

  const handleProjectUpdated = () => {
    fetchProjects()
    setIsEditDialogOpen(false)
    setSelectedProject(null)
  }

  const handleDeleteProject = async (projectId: string) => {
    const supabase = createClient()

    if (canDelete) {
      if (!confirm("Are you sure you want to delete this project?")) return
      const { error } = await supabase.from("projects").delete().eq("id", projectId)
      if (!error) {
        fetchProjects()
        toast({ title: "Project deleted", description: "The project has been permanently removed." })
      } else {
        toast({ title: "Error", description: error.message, variant: "destructive" })
      }
    } else if (canRequestDelete) {
      if (!confirm("Request admin approval to delete this project?")) return

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase.from("approval_requests").insert({
        request_type: "DELETE_PROJECT",
        entity_id: projectId,
        requested_by: user.id,
        status: "pending"
      })

      if (!error) {
        toast({ title: "Request Sent", description: "Admin approval requested for deletion." })
      } else {
        toast({ title: "Error", description: error.message, variant: "destructive" })
      }
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading projects...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground mt-1">Manage your client projects</p>
        </div>
        {canCreate && (
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Project
          </Button>
        )}
      </div>

      {projects.length === 0 ? (
        <Card className="glass border-border/50">
          <CardContent className="text-center py-16">
            <p className="text-muted-foreground mb-4">No projects yet</p>
            {canCreate && (
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Project
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id} className="glass border-border/50 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{project.name}</CardTitle>
                    {project.clients && <CardDescription>{project.clients.name}</CardDescription>}
                  </div>
                  <div
                    className={`px-2 py-1 rounded-full text-xs ml-2 ${project.priority === "high"
                      ? "bg-red-500/10 text-red-600 dark:text-red-400"
                      : project.priority === "medium"
                        ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                        : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                      }`}
                  >
                    {project.priority}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {project.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
                )}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Status</span>
                    <span
                      className={`px-2 py-1 rounded-full ${project.status === "completed"
                        ? "bg-green-500/10 text-green-600 dark:text-green-400"
                        : project.status === "in_progress"
                          ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                          : "bg-muted text-muted-foreground"
                        }`}
                    >
                      {project.status.replace("_", " ")}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Progress</span>
                      <span>{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>
                  {project.budget && (
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-border">
                      <span className="text-muted-foreground">Budget</span>
                      <span className="font-medium">${project.budget.toLocaleString()}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 pt-2 border-t border-border">
                  {canEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent"
                      onClick={() => {
                        setSelectedProject(project)
                        setIsEditDialogOpen(true)
                      }}
                    >
                      <Pencil className="w-3 h-3 mr-2" />
                      Edit
                    </Button>
                  )}
                  {(canDelete || canRequestDelete) && (
                    <Button variant="outline" size="sm" onClick={() => handleDeleteProject(project.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddProjectDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} onProjectAdded={handleProjectAdded} />
      {selectedProject && (
        <EditProjectDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onProjectUpdated={handleProjectUpdated}
          project={selectedProject}
        />
      )}
    </div>
  )
}
