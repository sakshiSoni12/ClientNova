import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

export async function RecentClients() {
  const supabase = await createClient()

  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5)

  return (
    <Card className="glass border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Clients</CardTitle>
            <CardDescription>Your most recently added clients</CardDescription>
          </div>
          <Link href="/dashboard/clients">
            <Button size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Client
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {!clients || clients.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="mb-4">No clients yet</p>
            <Link href="/dashboard/clients">
              <Button>Add Your First Client</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {clients.map((client) => (
              <div
                key={client.id}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <Avatar>
                  <AvatarFallback className="bg-primary/10 text-primary">{client.name[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{client.name}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {client.company || client.email || "No company"}
                  </p>
                </div>
                <div
                  className={`px-2 py-1 rounded-full text-xs ${
                    client.status === "active"
                      ? "bg-green-500/10 text-green-600 dark:text-green-400"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {client.status}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
