"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface SocialAccount {
  id: string
  client_id: string | null
  platform: string
  username: string | null
  url: string | null
  followers: number
  status: string
}

interface EditSocialDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAccountUpdated: () => void
  account: SocialAccount
}

export function EditSocialDialog({ open, onOpenChange, onAccountUpdated, account }: EditSocialDialogProps) {
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
      .from("social_accounts")
      .update({
        client_id: (formData.get("client_id") as string) || null,
        platform: formData.get("platform") as string,
        username: (formData.get("username") as string) || null,
        url: (formData.get("url") as string) || null,
        followers: Number.parseInt(formData.get("followers") as string) || 0,
        status: formData.get("status") as string,
        updated_at: new Date().toISOString(),
      })
      .eq("id", account.id)

    if (updateError) {
      setError(updateError.message)
      setIsLoading(false)
      return
    }

    setIsLoading(false)
    onAccountUpdated()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Social Account</DialogTitle>
          <DialogDescription>Update the social media account information</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="client_id">Client</Label>
            <Select name="client_id" defaultValue={account.client_id || undefined}>
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
            <Label htmlFor="platform">Platform *</Label>
            <Select name="platform" required defaultValue={account.platform}>
              <SelectTrigger id="platform">
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="twitter">Twitter</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="youtube">YouTube</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" name="username" placeholder="@username" defaultValue={account.username || ""} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">Profile URL</Label>
            <Input id="url" name="url" type="url" placeholder="https://" defaultValue={account.url || ""} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="followers">Followers</Label>
            <Input id="followers" name="followers" type="number" defaultValue={account.followers} min="0" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select name="status" defaultValue={account.status}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">{error}</p>}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Account"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
