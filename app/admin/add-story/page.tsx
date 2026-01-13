"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { createStory, addStoryPage, addStoryAudio } from "@/lib/stories"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, Plus, UploadCloud, Mic, Link as LinkIcon, CheckCircle, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AudioRecorder } from "@/components/stories/AudioRecorder"

export default function AddStoryPage() {
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState("")
    const router = useRouter()
    const supabase = createClient()

    // Story State
    const [title, setTitle] = useState("")
    const [genre, setGenre] = useState("Mystery")
    const [synopsis, setSynopsis] = useState("")
    const [emotionalTone, setEmotionalTone] = useState("")
    const [readingTime, setReadingTime] = useState("5 min")
    const [listeningTime, setListeningTime] = useState("7 min")

    // Pages State
    const [pages, setPages] = useState<{ id: number; content: string; chapterTitle: string }[]>([
        { id: 1, content: "", chapterTitle: "" }
    ])

    // Audio State
    const [audioUrl, setAudioUrl] = useState("")
    const [audioDuration, setAudioDuration] = useState(300)
    const [uploading, setUploading] = useState(false)

    const handleFileUpload = async (file: File) => {
        setUploading(true)
        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
            const filePath = `${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('story-audio')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    contentType: file.type,
                    upsert: false
                })

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('story-audio')
                .getPublicUrl(filePath)

            setAudioUrl(publicUrl)

            // Try to detect duration
            const audio = new Audio(publicUrl)
            audio.onloadedmetadata = () => {
                setAudioDuration(Math.floor(audio.duration))
            }

        } catch (error: any) {
            setMessage(`Upload failed: ${error.message}`)
        } finally {
            setUploading(false)
        }
    }

    const addPage = () => {
        setPages([...pages, { id: pages.length + 1, content: "", chapterTitle: "" }])
    }

    const removePage = (index: number) => {
        const newPages = [...pages]
        newPages.splice(index, 1)
        // Re-index remaining pages
        setPages(newPages.map((p, i) => ({ ...p, id: i + 1 })))
    }

    const updatePage = (index: number, field: 'content' | 'chapterTitle', value: string) => {
        const newPages = [...pages]
        newPages[index] = { ...newPages[index], [field]: value }
        setPages(newPages)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage("")

        try {
            // 1. Create Story
            const story = await createStory(supabase, {
                title,
                genre,
                synopsis,
                emotional_tone: emotionalTone,
                reading_time: readingTime,
                listening_time: listeningTime,
                language_available: ['EN']
            })

            if (!story) throw new Error("Failed to create story")

            // 2. Add Pages
            for (const page of pages) {
                await addStoryPage(supabase, {
                    story_id: story.id,
                    page_number: page.id,
                    content_text: page.content,
                    chapter_title: page.chapterTitle || undefined
                })
            }

            // 3. Add Audio (if provided)
            if (audioUrl) {
                await addStoryAudio(supabase, {
                    story_id: story.id,
                    language: 'EN',
                    audio_url: audioUrl,
                    duration: audioDuration
                })
            }

            setMessage("Story created successfully!")
            router.push(`/stories/${story.id}`)

        } catch (error: any) {
            setMessage(`Error: ${error.message || "Something went wrong"}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background p-6 md:p-12">
            <div className="max-w-3xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-serif font-bold">Add New Story</h1>
                    <p className="text-muted-foreground">Populate your library with new content.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Story Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Story Metadata</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Title</Label>
                                    <Input required value={title} onChange={e => setTitle(e.target.value)} placeholder="The Lost City" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Genre</Label>
                                    <Input required value={genre} onChange={e => setGenre(e.target.value)} placeholder="Mystery" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Synopsis</Label>
                                <Textarea required value={synopsis} onChange={e => setSynopsis(e.target.value)} placeholder="A brief summary..." />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Emotional Tone</Label>
                                    <Input required value={emotionalTone} onChange={e => setEmotionalTone(e.target.value)} placeholder="Dark, Mysterious" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Reading Time</Label>
                                    <Input required value={readingTime} onChange={e => setReadingTime(e.target.value)} placeholder="5 min" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Listening Time</Label>
                                    <Input required value={listeningTime} onChange={e => setListeningTime(e.target.value)} placeholder="7 min" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pages */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-medium">Pages</h2>
                            <Button type="button" size="sm" onClick={addPage} variant="outline" className="gap-2">
                                <Plus size={16} /> Add Page
                            </Button>
                        </div>

                        {pages.map((page, index) => (
                            <Card key={index}>
                                <CardHeader className="py-4 flex flex-row items-center justify-between space-y-0">
                                    <CardTitle className="text-base">Page {page.id}</CardTitle>
                                    {pages.length > 1 && (
                                        <Button type="button" variant="ghost" size="sm" onClick={() => removePage(index)} className="text-destructive h-8 px-2">
                                            <Trash2 size={16} />
                                        </Button>
                                    )}
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Chapter Title (Optional)</Label>
                                        <Input
                                            value={page.chapterTitle}
                                            onChange={e => updatePage(index, 'chapterTitle', e.target.value)}
                                            placeholder="Chapter 1: The Beginning"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Content</Label>
                                        <Textarea
                                            required
                                            className="min-h-[200px] font-mono text-sm leading-relaxed"
                                            value={page.content}
                                            onChange={e => updatePage(index, 'content', e.target.value)}
                                            placeholder="Write the story content here..."
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Audio */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Audio (Optional)</CardTitle>
                            <CardDescription>Add audio for the "Listen" mode.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Exclusive Audio Selection */}
                            {!audioUrl ? (
                                <Tabs defaultValue="upload" className="w-full">
                                    <TabsList className="grid w-full grid-cols-3 mb-4">
                                        <TabsTrigger value="upload" className="gap-2"><UploadCloud size={16} /> Upload File</TabsTrigger>
                                        <TabsTrigger value="record" className="gap-2"><Mic size={16} /> Record Voice</TabsTrigger>
                                        <TabsTrigger value="url" className="gap-2"><LinkIcon size={16} /> External URL</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="upload" className="space-y-4">
                                        <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-10 hover:bg-accent/50 transition-colors cursor-pointer relative">
                                            <Input
                                                type="file"
                                                accept="audio/*"
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                onChange={e => {
                                                    const file = e.target.files?.[0]
                                                    if (file) handleFileUpload(file)
                                                }}
                                            />
                                            <div className="text-center space-y-2">
                                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary">
                                                    <UploadCloud size={24} />
                                                </div>
                                                <p className="font-medium">Click to upload or drag & drop</p>
                                                <p className="text-xs text-muted-foreground">MP3, WAV, M4A (Max 10MB)</p>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="record">
                                        <AudioRecorder onRecordingComplete={handleFileUpload} />
                                    </TabsContent>

                                    <TabsContent value="url">
                                        <div className="space-y-2">
                                            <Label>Audio URL</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    placeholder="https://example.com/audio.mp3"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault()
                                                            setAudioUrl(e.currentTarget.value)
                                                        }
                                                    }}
                                                    onBlur={(e) => setAudioUrl(e.target.value)}
                                                />
                                            </div>
                                            <p className="text-xs text-muted-foreground">Press Enter or click away to save URL.</p>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 bg-green-500/10 text-green-600 p-4 rounded-xl border border-green-500/20">
                                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                                            <CheckCircle size={20} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-sm">Audio Added Successfully</p>
                                            <p className="text-xs opacity-80 truncate">{audioUrl}</p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => {
                                                setAudioUrl("")
                                                setAudioDuration(300)
                                            }}
                                            className="gap-2"
                                        >
                                            <Trash2 size={16} /> Remove
                                        </Button>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Duration (seconds)</Label>
                                        <Input type="number" value={audioDuration} onChange={e => setAudioDuration(Number(e.target.value))} />
                                    </div>
                                </div>
                            )}

                            {/* Upload Progress */}
                            {uploading && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-xs">
                                        <span>Uploading...</span>
                                        <span>100%</span>
                                    </div>
                                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                        <div className="h-full bg-primary w-full animate-progress-indeterminate" />
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex items-center gap-4 pt-4">
                        <Button type="submit" size="lg" disabled={loading} className="gap-2 w-full md:w-auto">
                            {loading && <Loader2 className="animate-spin" />}
                            Create Story
                        </Button>
                        {message && (
                            <p className={message.startsWith("Error") ? "text-destructive" : "text-primary"}>
                                {message}
                            </p>
                        )}
                    </div>
                </form>
            </div>
        </div>
    )
}
