import { Card, CardContent } from "@/components/ui/card"
import { Users, FolderKanban, TrendingUp } from "lucide-react"

interface StatsOverviewProps {
  clientsCount: number
  projectsCount: number
  activeProjectsCount: number
}

export function StatsOverview({ clientsCount, projectsCount, activeProjectsCount }: StatsOverviewProps) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card className="glass border-border/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Clients</p>
              <p className="text-3xl font-bold">{clientsCount}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass border-border/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Projects</p>
              <p className="text-3xl font-bold">{projectsCount}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <FolderKanban className="w-6 h-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass border-border/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Active Projects</p>
              <p className="text-3xl font-bold">{activeProjectsCount}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
