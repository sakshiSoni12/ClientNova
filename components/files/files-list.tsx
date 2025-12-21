"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { put } from "@vercel/blob"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, FileText, ImageIcon, Video, Music, File, Trash2, Download } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface FileItem {
  id: string
  client_id: string | null
  project_id: string | null
  name: string
  type: string | null
  size: number | null
  url: string
  created_at: string
  clients?: { name: string }
  projects?: { name: string }
}

const getFileIcon = (type: string | null) => {
  if (!type) return File
  if (type.startsWith("image/")) return ImageIcon
  if (type.startsWith("video/")) return Video
  if (type.startsWith("audio/")) return Music
  return FileText
}

export function FilesList() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const fetchFiles = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from("files")
      .select("*, clients(name), projects(name)")
      .order("created_at", { ascending: false })

    if (data) setFiles(data)
    setIsLoading(false)
  }

  useEffect(() => {
    fetchFiles()
  }, [])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadError(null)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setUploadError("You must be logged in")
        setIsUploading(false)
        return
      }

      // Upload to Vercel Blob
      const blob = await put(file.name, file, {
        access: "public",
      })

      // Save to database
      const { error: insertError } = await supabase.from("files").insert({
        name: file.name,
        type: file.type,
        size: file.size,
        url: blob.url,
        uploaded_by: user.id,
      })

      if (insertError) throw insertError

      fetchFiles()
      e.target.value = ""
    } catch (error: any) {
      setUploadError(error.message || "Failed to upload file")
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteFile = async (fileId: string, fileUrl: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return

    const supabase = createClient()
    const { error } = await supabase.from("files").delete().eq("id", fileId)

    if (!error) {
      // Note: Vercel Blob deletion would need separate API call
      fetchFiles()
    }
  }

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "Unknown size"
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / 1048576).toFixed(1) + " MB"
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading files...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Files</h1>
          <p className="text-muted-foreground mt-1">Upload and manage project files</p>
        </div>
        <div>
          <Input type="file" id="file-upload" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
          <Label htmlFor="file-upload">
            <Button asChild disabled={isUploading}>
              <span className="cursor-pointer">
                <Plus className="w-4 h-4 mr-2" />
                {isUploading ? "Uploading..." : "Upload File"}
              </span>
            </Button>
          </Label>
        </div>
      </div>

      {uploadError && <div className="p-4 bg-destructive/10 text-destructive rounded-lg text-sm">{uploadError}</div>}

      {files.length === 0 ? (
        <Card className="glass border-border/50">
          <CardContent className="text-center py-16">
            <p className="text-muted-foreground mb-4">No files uploaded yet</p>
            <Label htmlFor="file-upload">
              <Button asChild>
                <span className="cursor-pointer">
                  <Plus className="w-4 h-4 mr-2" />
                  Upload Your First File
                </span>
              </Button>
            </Label>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {files.map((file) => {
            const Icon = getFileIcon(file.type)
            return (
              <Card key={file.id} className="glass border-border/50 hover:border-primary/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                      {file.clients && <p className="text-xs text-muted-foreground mt-1">{file.clients.name}</p>}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent" asChild>
                      <a href={file.url} target="_blank" rel="noopener noreferrer">
                        <Download className="w-3 h-3 mr-2" />
                        Download
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteFile(file.id, file.url)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
