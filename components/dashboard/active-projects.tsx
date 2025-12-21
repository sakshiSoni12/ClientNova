import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { Plus } from "lucide-react"

export async function ActiveProjects() {
  const supabase = await createClient()

  const { data: projects } = await supabase
    .from("projects")
    .select("*, clients(name)")
    .in("status", ["in_progress", "planning"])
    .order("created_at", { ascending: false })
    .limit(5)

  return (
    <Card className="glass border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Active Projects</CardTitle>
            <CardDescription>Projects currently in progress</CardDescription>
          </div>
          <Link href="/dashboard/projects">
            <Button size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {!projects || projects.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="mb-4">No active projects</p>
            <Link href="/dashboard/projects">
              <Button>Create Your First Project</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {projects.map((project) => (
              <div key={project.id} className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{project.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{project.clients?.name || "No client"}</p>
                  </div>
                  <div
                    className={`px-2 py-1 rounded-full text-xs ml-2 ${
                      project.priority === "high"
                        ? "bg-red-500/10 text-red-600 dark:text-red-400"
                        : project.priority === "medium"
                          ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                          : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                    }`}
                  >
                    {project.priority}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span>{project.progress || 0}%</span>
                  </div>
                  <Progress value={project.progress || 0} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
