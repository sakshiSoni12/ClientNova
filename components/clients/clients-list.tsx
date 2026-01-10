"use client"

import { useState, useEffect, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { useSearchParams } from "next/navigation"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Plus, Mail, Phone, ExternalLink, Pencil, Trash2 } from "lucide-react"
import { AddClientDialog } from "./add-client-dialog"
import { EditClientDialog } from "./edit-client-dialog"

interface Client {
  id: string
  name: string
  email: string | null
  phone: string | null
  company: string | null
  industry: string | null
  website: string | null
  status: string
  subscription_plan: string
  notes: string | null
  created_at: string
}

const getSubscriptionBadge = (plan: string) => {
  const plans = {
    basic: { label: "Basic", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" },
    pro: { label: "Pro", color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20" },
    premium: {
      label: "Premium",
      color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    },
  }
  return plans[plan as keyof typeof plans] || plans.basic
}

import { usePermissions } from "@/hooks/use-permissions"
import { useToast } from "@/components/ui/use-toast"

export function ClientsList() {
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)

  const searchParams = useSearchParams()
  const searchQuery = searchParams.get("search") || ""

  const { canCreate, canEdit, canDelete, canRequestDelete } = usePermissions()
  const { toast } = useToast()

  const fetchClients = async () => {
    const supabase = createClient()
    const { data } = await supabase.from("clients").select("*").order("created_at", { ascending: false })

    if (data) {
      setClients(data)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchClients()
  }, [])

  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return clients

    const lowerQuery = searchQuery.toLowerCase()
    return clients.filter((client) => {
      return (
        client.name.toLowerCase().includes(lowerQuery) ||
        (client.company && client.company.toLowerCase().includes(lowerQuery)) ||
        (client.email && client.email.toLowerCase().includes(lowerQuery)) ||
        (client.phone && client.phone.includes(lowerQuery)) ||
        (client.industry && client.industry.toLowerCase().includes(lowerQuery))
      )
    })
  }, [clients, searchQuery])

  const handleClientAdded = () => {
    fetchClients()
    setIsDialogOpen(false)
  }

  const handleClientUpdated = () => {
    fetchClients()
    setIsEditDialogOpen(false)
    setSelectedClient(null)
  }

  const handleDeleteClient = async (clientId: string) => {
    const supabase = createClient()

    if (canDelete) {
      if (!confirm("Are you sure you want to delete this client?")) return
      const { error } = await supabase.from("clients").delete().eq("id", clientId)
      if (!error) {
        fetchClients()
        toast({ title: "Client deleted", description: "The client has been permanently removed." })
      } else {
        toast({ title: "Error", description: error.message, variant: "destructive" })
      }
    } else if (canRequestDelete) {
      if (!confirm("Request admin approval to delete this client?")) return

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase.from("approval_requests").insert({
        request_type: "DELETE_CLIENT",
        entity_id: clientId,
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
    return <div className="text-center py-8">Loading clients...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Clients</h1>
          <p className="text-muted-foreground mt-1">Manage your client relationships</p>
        </div>
        {canCreate && (
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Client
          </Button>
        )}
      </div>

      {filteredClients.length === 0 ? (
        <Card className="glass border-border/50">
          <CardContent className="text-center py-16">
            <p className="text-muted-foreground mb-4">
              {searchQuery ? "No clients found matching your search" : "No clients yet"}
            </p>
            {canCreate && !searchQuery && (
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Client
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredClients.map((client) => {
            const subscriptionBadge = getSubscriptionBadge(client.subscription_plan || "basic")
            return (
              <Card key={client.id} className="glass border-border/50 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {client.name[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{client.name}</CardTitle>
                        {client.company && <CardDescription>{client.company}</CardDescription>}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                      <div
                        className={`px-2 py-1 rounded-full text-xs ${client.status === "active"
                          ? "bg-green-500/10 text-green-600 dark:text-green-400"
                          : "bg-muted text-muted-foreground"
                          }`}
                      >
                        {client.status}
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs border ${subscriptionBadge.color}`}>
                        {subscriptionBadge.label}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {client.email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{client.email}</span>
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  {client.website && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <ExternalLink className="w-4 h-4" />
                      <a
                        href={client.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="truncate hover:text-primary"
                      >
                        {client.website}
                      </a>
                    </div>
                  )}
                  {client.industry && (
                    <div className="pt-2 border-t border-border">
                      <span className="text-xs text-muted-foreground">Industry: </span>
                      <span className="text-xs font-medium">{client.industry}</span>
                    </div>
                  )}
                  <div className="flex gap-2 pt-2 border-t border-border">
                    {canEdit && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-transparent"
                        onClick={() => {
                          setSelectedClient(client)
                          setIsEditDialogOpen(true)
                        }}
                      >
                        <Pencil className="w-3 h-3 mr-2" />
                        Edit
                      </Button>
                    )}
                    {(canDelete || canRequestDelete) && (
                      <Button variant="outline" size="sm" onClick={() => handleDeleteClient(client.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <AddClientDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} onClientAdded={handleClientAdded} />
      {selectedClient && (
        <EditClientDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onClientUpdated={handleClientUpdated}
          client={selectedClient}
        />
      )}
    </div>
  )
}

