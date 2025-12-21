"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Users, Pencil, Trash2, Instagram, Twitter, Facebook, Linkedin, Youtube, Share2 } from "lucide-react"
import { AddSocialDialog } from "./add-social-dialog"
import { EditSocialDialog } from "./edit-social-dialog"

interface SocialAccount {
  id: string
  client_id: string | null
  platform: string
  username: string | null
  url: string | null
  followers: number
  status: string
  created_at: string
  clients?: { name: string }
}

const platformIcons: Record<string, any> = {
  instagram: Instagram,
  twitter: Twitter,
  facebook: Facebook,
  linkedin: Linkedin,
  youtube: Youtube,
}

export function SocialMediaList() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<SocialAccount | null>(null)

  const fetchAccounts = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from("social_accounts")
      .select("*, clients(name)")
      .order("created_at", { ascending: false })

    if (data) setAccounts(data)
    setIsLoading(false)
  }

  useEffect(() => {
    fetchAccounts()
  }, [])

  const handleAccountAdded = () => {
    fetchAccounts()
    setIsDialogOpen(false)
  }

  const handleAccountUpdated = () => {
    fetchAccounts()
    setIsEditDialogOpen(false)
    setSelectedAccount(null)
  }

  const handleDeleteAccount = async (accountId: string) => {
    if (!confirm("Are you sure you want to delete this social account?")) return

    const supabase = createClient()
    const { error } = await supabase.from("social_accounts").delete().eq("id", accountId)

    if (!error) {
      fetchAccounts()
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading social accounts...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Social Media</h1>
          <p className="text-muted-foreground mt-1">Manage client social media accounts</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Account
        </Button>
      </div>

      {accounts.length === 0 ? (
        <Card className="glass border-border/50">
          <CardContent className="text-center py-16">
            <p className="text-muted-foreground mb-4">No social accounts yet</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Account
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => {
            const Icon = platformIcons[account.platform.toLowerCase()] || Share2
            return (
              <Card key={account.id} className="glass border-border/50 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg capitalize">{account.platform}</CardTitle>
                        {account.clients && <CardDescription>{account.clients.name}</CardDescription>}
                      </div>
                    </div>
                    <div
                      className={`px-2 py-1 rounded-full text-xs ${
                        account.status === "active"
                          ? "bg-green-500/10 text-green-600 dark:text-green-400"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {account.status}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {account.username && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Username: </span>
                      <span className="font-medium">@{account.username}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{account.followers.toLocaleString()}</span>
                    <span className="text-muted-foreground">followers</span>
                  </div>
                  {account.url && (
                    <a
                      href={account.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline truncate block"
                    >
                      View Profile
                    </a>
                  )}
                  <div className="flex gap-2 pt-2 border-t border-border">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent"
                      onClick={() => {
                        setSelectedAccount(account)
                        setIsEditDialogOpen(true)
                      }}
                    >
                      <Pencil className="w-3 h-3 mr-2" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteAccount(account.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <AddSocialDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} onAccountAdded={handleAccountAdded} />
      {selectedAccount && (
        <EditSocialDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onAccountUpdated={handleAccountUpdated}
          account={selectedAccount}
        />
      )}
    </div>
  )
}
