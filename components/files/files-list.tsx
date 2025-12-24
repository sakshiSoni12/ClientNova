"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, FileText, ImageIcon, Video, Music, File, Trash2, Download, UploadCloud, Link as LinkIcon, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

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

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

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
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

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

  const uploadFile = async (file: File) => {
    // Validation
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: `File size must be less than 50MB. Your file is ${(file.size / (1024 * 1024)).toFixed(1)}MB.`,
        variant: "destructive"
      })
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("You must be logged in to upload files")
      }

      setUploadProgress(10) // Start progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => (prev >= 90 ? prev : prev + 10))
      }, 300)

      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      // 1. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('project-files')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      clearInterval(progressInterval)
      setUploadProgress(100)

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('project-files')
        .getPublicUrl(filePath)

      // 3. Save metadata to database
      const { error: insertError } = await supabase.from("files").insert({
        name: file.name,
        type: file.type,
        size: file.size,
        url: publicUrl,
        uploaded_by: user.id,
      })

      if (insertError) throw insertError

      toast({ title: "File uploaded", description: `${file.name} has been added successfully.` })
      fetchFiles()

    } catch (error: any) {
      console.error(error)
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload file. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) uploadFile(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) uploadFile(file)
  }

  const handleDeleteFile = async (fileId: string, fileUrl: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return

    const supabase = createClient()
    const { error } = await supabase.from("files").delete().eq("id", fileId)

    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" })
    } else {
      toast({ title: "File deleted", description: "The file has been removed." })
      // Optimistic update
      setFiles(prev => prev.filter(f => f.id !== fileId))
    }
  }

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      toast({ title: "Link copied", description: "File URL copied to clipboard." })
    } catch (err) {
      toast({ title: "Failed to copy", variant: "destructive" })
    }
  }

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "Unknown size"
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / 1048576).toFixed(1) + " MB"
  }

  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Project Files</h1>
          <p className="text-muted-foreground mt-1">Manage and organize your digital assets.</p>
        </div>
        <div>
          <Label htmlFor="file-upload">
            <Button disabled={isUploading} className="w-full md:w-auto cursor-pointer shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow">
              <Plus className="w-4 h-4 mr-2" />
              Upload New File
            </Button>
          </Label>
          <Input
            ref={fileInputRef}
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </div>
      </div>

      {/* Upload Area */}
      <motion.div
        layout
        className={cn(
          "relative border-2 border-dashed rounded-xl p-10 transition-all duration-300 flex flex-col items-center justify-center text-center overflow-hidden",
          isDragging ? "border-primary bg-primary/5 scale-[1.01] shadow-xl" : "border-border hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-slate-900/50",
          isUploading ? "pointer-events-none" : "cursor-pointer"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        whileHover={{ scale: 1.005 }}
        whileTap={{ scale: 0.995 }}
      >
        <AnimatePresence mode="wait">
          {isUploading ? (
            <motion.div
              key="uploading"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full max-w-sm space-y-6 relative z-10"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto ring-8 ring-primary/5">
                <UploadCloud className="w-8 h-8 text-primary animate-bounce" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Uploading your file...</h3>
                <Progress value={uploadProgress} className="h-2 w-full transition-all duration-300" />
                <p className="text-sm text-muted-foreground">{uploadProgress}% complete</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="space-y-4 relative z-10"
            >
              <div className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300",
                isDragging ? "bg-primary/20 scale-110" : "bg-secondary group-hover:scale-110"
              )}>
                <UploadCloud className={cn(
                  "w-8 h-8 transition-colors duration-300",
                  isDragging ? "text-primary" : "text-muted-foreground"
                )} />
              </div>
              <div>
                <h3 className="font-semibold text-xl mb-1">Drag & Drop files here</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  or click to browse from your computer
                </p>
              </div>
              <div className="pt-2 text-xs text-muted-foreground/60 flex items-center justify-center gap-4">
                <span className="flex items-center gap-1"><File className="w-3 h-3" /> max 50MB</span>
                <span className="flex items-center gap-1"><ImageIcon className="w-3 h-3" /> Images</span>
                <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> Docs</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Decorative background blurs */}
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-primary/5 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      </motion.div>

      {/* Files Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-xl bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : files.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 border rounded-xl bg-muted/10 border-dashed"
        >
          <AlertCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="font-medium text-lg">Your library is empty</h3>
          <p className="text-muted-foreground text-sm">Upload your first file to get started.</p>
        </motion.div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          <AnimatePresence>
            {files.map((file) => {
              const Icon = getFileIcon(file.type)
              return (
                <motion.div
                  layout
                  key={file.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="group relative overflow-hidden border-border/60 hover:border-primary/50 hover:shadow-lg transition-all duration-300 bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors duration-300">
                          <Icon className="w-6 h-6 text-primary group-hover:scale-110 transition-transform duration-300" />
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <p className="font-medium truncate pr-8 text-sm">{file.name}</p>
                          <div className="flex flex-col gap-0.5 mt-1">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{file.type?.split('/')[1] || 'FILE'}</span>
                            <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Hover Actions */}
                      <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 bg-background/80 sm:bg-transparent rounded-lg p-1 sm:p-0 backdrop-blur-sm sm:backdrop-blur-none shadow-sm sm:shadow-none border sm:border-none border-border/50">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-primary"
                          asChild
                          title="Download"
                        >
                          <a href={file.url} target="_blank" rel="noopener noreferrer">
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(file.url);
                          }}
                          title="Copy Link"
                        >
                          <LinkIcon className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFile(file.id, file.url);
                          }}
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}
