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

interface AddClientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onClientAdded: () => void
}

export function AddClientDialog({ open, onOpenChange, onClientAdded }: AddClientDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedStudio, setSelectedStudio] = useState<string>("")
  const [uploadingImage, setUploadingImage] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setUploadingImage(true)

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError("You must be logged in")
      setIsLoading(false)
      setUploadingImage(false)
      return
    }

    // 1. Create Client First
    const payload = {
      name: formData.get("name") as string,
      email: (formData.get("email") as string) || null,
      phone: (formData.get("phone") as string) || null,
      company: (formData.get("company") as string) || null,
      industry: (formData.get("industry") as string) || null,
      website: (formData.get("website") as string) || null,
      status: formData.get("status") as string,
      subscription_plan: formData.get("subscription_plan") as string,
      notes: (formData.get("notes") as string) || null,
      studio: (formData.get("studio") as string) || null,
      affiliates: (formData.get("affiliates") as string) || null,
      created_by: user.id,
    }

    const { data: newClient, error: insertError } = await supabase
      .from("clients")
      .insert(payload)
      .select()
      .single()

    if (insertError) {
      setError(insertError.message)
      setIsLoading(false)
      setUploadingImage(false)
      return
    }

    // 2. Handle Multiple File Uploads (Client Assets)
    const files = formData.getAll("client_assets") as File[] // Get all selected files
    const validFiles = files.filter(f => f.size > 0)

    if (validFiles.length > 0) {
      const uploadPromises = validFiles.map(async (file) => {
        const fileName = `${newClient.id}/${Math.random().toString(36).substring(2)}_${file.name}`
        const filePath = `client-assets/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('clients')
          .upload(filePath, file)

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('clients')
            .getPublicUrl(filePath)

          // Insert into client_assets table
          await supabase.from("client_assets").insert({
            client_id: newClient.id,
            file_url: publicUrl,
            file_name: file.name,
            file_type: file.type,
            file_size: file.size,
            uploaded_by: user.id
          })
        } else {
          console.error("Upload error for file " + file.name, uploadError)
          // Alert the user about the failure
          setError(`Failed to upload ${file.name}: ${uploadError.message}`)
        }
      })

      await Promise.all(uploadPromises)
    }

    setUploadingImage(false)
    setIsLoading(false)
    onClientAdded()
  }

  // File preview logic
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[90vw] sm:w-full">
        <DialogHeader>
          <DialogTitle>Add New Client</DialogTitle>
          <DialogDescription>Create a new client profile with their information</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" name="name" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input id="company" name="company" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" type="tel" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="studio">Studio</Label>
              <Select name="studio" onValueChange={setSelectedStudio}>
                <SelectTrigger id="studio">
                  <SelectValue placeholder="Select Studio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SIN Mixed Reality Studio">SIN Mixed Reality Studio</SelectItem>
                  <SelectItem value="SIN AI Studio">SIN AI Studio</SelectItem>
                  <SelectItem value="SIN Data Studio">SIN Data Studio</SelectItem>
                  <SelectItem value="SIN Brand Studio">SIN Brand Studio</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subscription_plan">Subscription Plan</Label>
              <Select name="subscription_plan" defaultValue="basic">
                <SelectTrigger id="subscription_plan">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {selectedStudio === "SIN Brand Studio" ? (
                    <>
                      <SelectItem value="basic">Basic - ₹8,000/mo</SelectItem>
                      <SelectItem value="pro">Pro - ₹15,000/mo</SelectItem>
                      <SelectItem value="premium">Premium - ₹25,000/mo</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="basic">Basic - ₹8,000/mo</SelectItem>
                      <SelectItem value="pro">Pro - ₹15,000/mo</SelectItem>
                      <SelectItem value="premium">Premium - ₹25,000/mo</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="affiliates">Affiliates</Label>
              <Select name="affiliates">
                <SelectTrigger id="affiliates">
                  <SelectValue placeholder="Select Affiliate" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SIN School of AI">SIN School of AI</SelectItem>
                  <SelectItem value="SIN Exploration">SIN Exploration</SelectItem>
                  <SelectItem value="SIN School and College Partners">SIN School and College Partners</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input id="industry" name="industry" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue="active">
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
              <Label htmlFor="website">Website</Label>
              <Input id="website" name="website" type="url" placeholder="https://" />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="client_assets" className="text-base font-semibold text-primary">Visiting Card & Assets</Label>
              <div className="border-2 border-dashed border-input rounded-lg p-6 flex flex-col items-center justify-center gap-2 hover:bg-muted/50 transition-colors cursor-pointer relative">
                <Input
                  id="client_assets"
                  name="client_assets"
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="text-center text-sm text-muted-foreground">
                  <span className="font-semibold text-primary">Click to upload Visiting Card</span> or drag and drop
                  <br />
                  <span className="text-xs">Images, PDFs, Docs allowed</span>
                </div>
              </div>

              {/* File Previews */}
              {selectedFiles.length > 0 && (
                <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {selectedFiles.map((file, idx) => (
                    <div key={idx} className="text-xs p-2 border rounded bg-background flex flex-col items-center gap-1 overflow-hidden relative">
                      {file.type.startsWith('image/') ? (
                        <img
                          src={URL.createObjectURL(file)}
                          alt="Preview"
                          className="w-full h-16 object-cover rounded"
                          onLoad={(e) => URL.revokeObjectURL(e.currentTarget.src)}
                        />
                      ) : (
                        <div className="w-full h-16 bg-muted flex items-center justify-center rounded">
                          <span className="text-[10px] text-muted-foreground">File</span>
                        </div>
                      )}
                      <span className="truncate w-full text-center">{file.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" rows={3} />
          </div>

          {error && <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">{error}</p>}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || uploadingImage}>
              {uploadingImage ? "Uploading Assets..." : isLoading ? "Adding Client..." : "Add Client"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
