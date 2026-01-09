"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { ClientAssetsDownloader } from "./client-assets-downloader"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, FileIcon, FileText } from "lucide-react"
import { jsPDF } from "jspdf"
import { toast } from "sonner"

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
  studio?: string | null
  affiliates?: string | null
}

interface ClientAsset {
  id: string
  file_name: string
  file_url: string
  file_type?: string
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
  const [selectedStudio, setSelectedStudio] = useState<string>(client.studio || "")
  const [uploadingImage, setUploadingImage] = useState(false)
  const [assets, setAssets] = useState<ClientAsset[]>([])
  const [generatingPdf, setGeneratingPdf] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    if (open && client.id) {
      fetchAssets()
    }
  }, [open, client.id])

  const fetchAssets = async () => {
    try {
      const { data, error } = await supabase
        .from("client_assets")
        .select("*")
        .eq("client_id", client.id)
        .order("uploaded_at", { ascending: false })

      if (error) {
        console.error("Error fetching assets:", error)
      }
      if (data) setAssets(data)
    } catch (e) {
      console.error("Exception fetching assets", e)
    }
  }

  const handleDeleteAsset = async (assetId: string) => {
    const { error } = await supabase
      .from("client_assets")
      .delete()
      .eq("id", assetId)

    if (!error) {
      setAssets(assets.filter(a => a.id !== assetId))
      toast.success("Asset deleted")
    } else {
      toast.error("Failed to delete asset")
    }
  }

  const handleDownloadPdf = async () => {
    setGeneratingPdf(true)
    // Toast to let user know it started
    const toastId = toast.loading("Generating PDF...")

    try {
      // Filter for images
      const imageAssets = assets.filter(a => a.file_type && a.file_type.startsWith('image/'))

      // If no explicit mime type in DB (legacy uploads), check extension
      const potentialImages = assets.filter(a => {
        const isImageMime = a.file_type && a.file_type.startsWith('image/')
        const isImageExt = a.file_name.match(/\.(jpeg|jpg|png|gif|webp)$/i)
        return isImageMime || isImageExt
      })

      if (potentialImages.length === 0) {
        toast.dismiss(toastId)
        toast.error("No image assets found to generate PDF")
        setGeneratingPdf(false)
        return
      }

      const doc = new jsPDF()
      let yOffset = 10

      // Title
      doc.setFontSize(16)
      doc.text(`Client Assets: ${client.name}`, 10, yOffset)
      yOffset += 20

      let imagesAdded = 0

      for (const asset of potentialImages) {
        try {
          // Use our own proxy to avoid CORS issues with Supabase Storage
          const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(asset.file_url)}`

          const response = await fetch(proxyUrl)
          if (!response.ok) throw new Error(`Failed to fetch ${asset.file_name}`)

          const blob = await response.blob()

          // Determine format
          let format = 'JPEG'
          if (asset.file_name.toLowerCase().endsWith('.png') || blob.type === 'image/png') format = 'PNG'

          // Convert to base64
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });

          // Add to PDF
          const imgProps = doc.getImageProperties(base64)
          const pdfWidth = doc.internal.pageSize.getWidth() - 20
          const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width

          // Check page break
          if (yOffset + pdfHeight > doc.internal.pageSize.getHeight() - 10) {
            doc.addPage()
            yOffset = 10
          }

          doc.setFontSize(10)
          doc.text(asset.file_name, 10, yOffset - 5)
          doc.addImage(base64, format, 10, yOffset, pdfWidth, pdfHeight)
          yOffset += pdfHeight + 20
          imagesAdded++

        } catch (err) {
          console.error("Error processing image for PDF", err)
          // Don't fail the whole PDF for one bad image, just log it
        }
      }

      if (imagesAdded === 0) {
        toast.dismiss(toastId)
        toast.error("Could not load any images for the PDF.")
      } else {
        const safeName = client.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()
        doc.save(`${safeName}_cards.pdf`)
        toast.dismiss(toastId)
        toast.success("PDF generated successfully")
      }

    } catch (err: any) {
      console.error("PDF Generation Error", err)
      toast.dismiss(toastId)
      toast.error("Failed to generate PDF: " + err.message)
    } finally {
      setGeneratingPdf(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setUploadingImage(true)

    try {
      const formData = new FormData(e.currentTarget)
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("You must be logged in")
      }

      // 1. Update Client Details
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
        updated_at: new Date().toISOString(),
      }

      const { error: updateError } = await supabase
        .from("clients")
        .update(payload)
        .eq("id", client.id)

      if (updateError) throw updateError

      // 2. Handle New Assets Upload
      const files = formData.getAll("new_assets") as File[]
      const validFiles = files.filter(f => f.size > 0)

      if (validFiles.length > 0) {
        const uploadPromises = validFiles.map(async (file) => {
          const fileName = `${client.id}/${Math.random().toString(36).substring(2)}_${file.name}`
          const filePath = `client-assets/${fileName}`

          const { error: uploadError } = await supabase.storage
            .from('clients')
            .upload(filePath, file)

          if (uploadError) throw new Error(`Upload failed for ${file.name}: ${uploadError.message}`)

          const { data: { publicUrl } } = supabase.storage
            .from('clients')
            .getPublicUrl(filePath)

          const { error: insertError } = await supabase.from("client_assets").insert({
            client_id: client.id,
            file_url: publicUrl,
            file_name: file.name,
            file_type: file.type,
            file_size: file.size,
            uploaded_by: user.id
          })

          if (insertError) throw new Error(`DB Insert failed for ${file.name}: ${insertError.message}`)
        })

        await Promise.all(uploadPromises)
        toast.success("Client and assets updated successfully")
      } else {
        toast.success("Client updated successfully")
      }

      onClientUpdated()

    } catch (err: any) {
      console.error("Submit Error:", err)
      setError(err.message || "An unexpected error occurred")
    } finally {
      setIsLoading(false)
      setUploadingImage(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto w-[90vw] sm:w-full">
        <DialogHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <DialogTitle>Edit Client</DialogTitle>
              <DialogDescription>Update info and manage assets</DialogDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleDownloadPdf} disabled={generatingPdf}>
                {generatingPdf ? (
                  <FileIcon className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="mr-2 h-4 w-4 text-red-600" />
                )}
                PDF
              </Button>
              <ClientAssetsDownloader
                clientId={client.id}
                clientName={client.name}
              />
            </div>
          </div>
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
              <Label htmlFor="studio">Studio</Label>
              <Select name="studio" defaultValue={client.studio || ""} onValueChange={setSelectedStudio}>
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
              <Select name="subscription_plan" defaultValue={client.subscription_plan || "basic"}>
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
              <Select name="affiliates" defaultValue={client.affiliates || ""}>
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
              <Input id="industry" name="industry" defaultValue={client.industry || ""} />
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
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                name="website"
                type="url"
                placeholder="https://"
                defaultValue={client.website || ""}
              />
            </div>
          </div>

          {/* Asset Management Section */}
          <div className="space-y-2 border rounded-lg p-4 bg-muted/20">
            <Label className="font-semibold text-base mb-2">Client Assets & Visit Cards</Label>

            {/* Existing Assets List */}
            {assets.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {assets.map((asset) => (
                  <div key={asset.id} className="relative group border rounded-lg overflow-hidden bg-background">
                    {/* Thumbnail preview */}
                    <div className="aspect-video bg-muted flex items-center justify-center">
                      {asset.file_type?.startsWith('image/') || asset.file_name.match(/\.(jpeg|jpg|png|gif|webp)$/i) ? (
                        <img src={asset.file_url} alt={asset.file_name} className="w-full h-full object-cover" />
                      ) : (
                        <FileIcon className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="p-2 flex items-center justify-between text-xs bg-card">
                      <a href={asset.file_url} target="_blank" rel="noopener noreferrer" className="truncate hover:underline max-w-[80%] block" title={asset.file_name}>
                        {asset.file_name}
                      </a>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteAsset(asset.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-4 text-muted-foreground text-sm border border-dashed rounded-lg mb-4">
                No assets uploaded yet.
              </div>
            )}

            {/* Upload New Assets */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="new_assets" className="text-xs font-semibold">Upload New Files</Label>
              <Input id="new_assets" name="new_assets" type="file" multiple className="cursor-pointer" />
              <p className="text-[10px] text-muted-foreground">* Select files and click "Update Client" to upload.</p>
            </div>
          </div>


          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" rows={3} defaultValue={client.notes || ""} />
          </div>

          {error && <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">{error}</p>}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || uploadingImage}>
              {uploadingImage ? "Uploading & Saving..." : isLoading ? "Updating..." : "Update Client"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
