"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Client {
  id: string
  name: string
  email: string | null
  phone: string | null
  company: string | null
  industry: string | null
  website: string | null
  status: string
  subscription_plan?: string
  notes: string | null
}

interface EditClientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onClientUpdated: () => void
  client: Client
}

export function EditClientDialog({ open, onOpenChange, onClientUpdated, client }: EditClientDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()

    const { error: updateError } = await supabase
      .from("clients")
      .update({
        name: formData.get("name") as string,
        email: (formData.get("email") as string) || null,
        phone: (formData.get("phone") as string) || null,
        company: (formData.get("company") as string) || null,
        industry: (formData.get("industry") as string) || null,
        website: (formData.get("website") as string) || null,
        status: formData.get("status") as string,
        subscription_plan: formData.get("subscription_plan") as string,
        notes: (formData.get("notes") as string) || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", client.id)

    if (updateError) {
      setError(updateError.message)
      setIsLoading(false)
      return
    }

    setIsLoading(false)
    onClientUpdated()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Client</DialogTitle>
          <DialogDescription>Update the client information</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" name="name" required defaultValue={client.name} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input id="company" name="company" defaultValue={client.company || ""} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" defaultValue={client.email || ""} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" type="tel" defaultValue={client.phone || ""} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input id="industry" name="industry" defaultValue={client.industry || ""} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                name="website"
                type="url"
                placeholder="https://"
                defaultValue={client.website || ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue={client.status}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="prospect">Prospect</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subscription_plan">Subscription Plan</Label>
              <Select name="subscription_plan" defaultValue={client.subscription_plan || "basic"}>
                <SelectTrigger id="subscription_plan">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic - ₹8,000/mo</SelectItem>
                  <SelectItem value="pro">Pro - ₹15,000/mo</SelectItem>
                  <SelectItem value="premium">Premium - ₹25,000/mo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" rows={3} defaultValue={client.notes || ""} />
          </div>

          {error && <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">{error}</p>}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Client"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
