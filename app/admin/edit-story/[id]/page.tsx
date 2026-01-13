"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { getStoryById, getStoryPages, getAllStoryAudio, updateStory, updateStoryPage, upsertStoryAudio, addStoryPage } from "@/lib/stories"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, Plus, Save, Trash2, ArrowLeft, Upload, Mic, Link as LinkIcon, CheckCircle, ChevronDown, ChevronRight } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AudioRecorder } from "@/components/stories/AudioRecorder"

export default function EditStoryPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState("")
    const router = useRouter()
    const { id } = useParams()
    const supabase = createClient()

    // Story State
    const [title, setTitle] = useState("")
    const [genre, setGenre] = useState("")
    const [synopsis, setSynopsis] = useState("")
    const [emotionalTone, setEmotionalTone] = useState("")
    const [readingTime, setReadingTime] = useState("")
    const [listeningTime, setListeningTime] = useState("")

    // Pages State
    const [pages, setPages] = useState<{ id?: string; page_number: number; content: string; chapterTitle: string }[]>([])

    // Audio State
    const [audioId, setAudioId] = useState<string | null>(null)
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

    useEffect(() => {
        if (!id) return;
        fetchStoryData(id as string);
    }, [id])

    const fetchStoryData = async (storyId: string) => {
        try {
            const story = await getStoryById(supabase, storyId)
            if (!story) throw new Error("Story not found")

            setTitle(story.title)
            setGenre(story.genre)
            setSynopsis(story.synopsis)
            setEmotionalTone(story.emotional_tone)
            setReadingTime(story.reading_time)
            setListeningTime(story.listening_time)

            const storyPages = await getStoryPages(supabase, storyId)
            const sortedPages = storyPages.sort((a, b) => a.page_number - b.page_number)
            setPages(sortedPages.map(p => ({
                id: p.id,
                page_number: p.page_number,
                content: p.content_text,
                chapterTitle: p.chapter_title || ""
            })))

            // Expand the first chapter by default
            if (sortedPages.length > 0) {
                setExpandedChapter(0)
            }

            const audioList = await getAllStoryAudio(supabase, storyId)
            const mainAudio = audioList.find(a => a.language === 'EN') || audioList[0]
            if (mainAudio) {
                setAudioId(mainAudio.id)
                setAudioUrl(mainAudio.audio_url)
                setAudioDuration(mainAudio.duration)
            }

        } catch (error: any) {
            setMessage(`Error loading story: ${error.message}`)
        } finally {
            setLoading(false)
        }
    }

    // Collapsible State for Chapters and Pages
    const [expandedChapter, setExpandedChapter] = useState<number | null>(0)
    const [expandedPage, setExpandedPage] = useState<number | null>(null)

    // Derived Grouped Pages
    const groupedPages = pages.reduce((acc, page, index) => {
        // Start a new group if it's the first page OR if the page has a distinct title that isn't just "Continuing..."
        const titleLower = (page.chapterTitle || "").toLowerCase();
        const isContinuing = titleLower.includes("continuing") || titleLower.trim() === "";
        const isNewChapter = index === 0 || !isContinuing;

        if (isNewChapter) {
            acc.push({
                title: page.chapterTitle || `Chapter ${acc.length + 1}`,
                startIndex: index,
                pages: [page]
            })
        } else {
            // Add to last group
            if (acc.length > 0) {
                acc[acc.length - 1].pages.push(page)
            } else {
                // Fallback for safety, though index 0 should catch this
                acc.push({ title: "Untitled", startIndex: index, pages: [page] })
            }
        }
        return acc
    }, [] as { title: string; startIndex: number; pages: typeof pages }[])



    const addChapter = () => {
        const newPageIndex = pages.length
        const chapterNumber = groupedPages.length + 1
        setPages([...pages, { page_number: newPageIndex + 1, content: "", chapterTitle: `Chapter ${chapterNumber}` }])
        setExpandedChapter(groupedPages.length) // Open the new chapter
        setExpandedPage(newPageIndex) // Open the page for editing
    }

    const addPageToChapter = () => {
        // Just adds a page to the end of the total list, effectively adding to the last chapter
        const newPageIndex = pages.length
        setPages([...pages, { page_number: newPageIndex + 1, content: "", chapterTitle: "Continuing..." }])
        // Keep current chapter expanded, expand new page
        setExpandedPage(newPageIndex)
    }

    const updatePage = (index: number, field: 'content' | 'chapterTitle', value: string) => {
        const newPages = [...pages]
        newPages[index] = { ...newPages[index], [field]: value }
        setPages(newPages)
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setMessage("")

        try {
            // 1. Update Story
            await updateStory(supabase, id as string, {
                title,
                genre,
                synopsis,
                emotional_tone: emotionalTone,
                reading_time: readingTime,
                listening_time: listeningTime
            })

            // 2. Update/Create Pages
            for (const page of pages) {
                if (page.id) {
                    await updateStoryPage(supabase, page.id, {
                        content_text: page.content,
                        chapter_title: page.chapterTitle || undefined
                    })
                } else {
                    await addStoryPage(supabase, {
                        story_id: id as string,
                        page_number: page.page_number,
                        content_text: page.content,
                        chapter_title: page.chapterTitle || undefined
                    })
                }
            }

            // 3. Upsert Audio
            if (audioUrl) {
                await upsertStoryAudio(supabase, {
                    id: audioId || undefined,
                    story_id: id as string,
                    language: 'EN',
                    audio_url: audioUrl,
                    duration: audioDuration
                })
            }

            setMessage("Story updated successfully!")

        } catch (error: any) {
            setMessage(`Error: ${error.message || "Something went wrong"}`)
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>

    return (
        <div className="min-h-screen bg-background p-6 md:p-12">
            <div className="max-w-3xl mx-auto space-y-8">
                <div className="flex items-center gap-4">
                    <Link href={`/stories/${id}`}>
                        <Button variant="ghost" size="icon"><ArrowLeft /></Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-serif font-bold">Edit Story</h1>
                        <p className="text-muted-foreground">Modify details, text, or attach audio.</p>
                    </div>
                </div>

                <form onSubmit={handleSave} className="space-y-8">
                    {/* Story Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Story Metadata</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Title</Label>
                                    <Input required value={title} onChange={e => setTitle(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Genre</Label>
                                    <Input required value={genre} onChange={e => setGenre(e.target.value)} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Synopsis</Label>
                                <Textarea required value={synopsis} onChange={e => setSynopsis(e.target.value)} />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Emotional Tone</Label>
                                    <Input required value={emotionalTone} onChange={e => setEmotionalTone(e.target.value)} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pages & Chapters */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-medium">Chapters</h2>
                            <div className="flex gap-2">
                                <Button type="button" size="sm" onClick={addPageToChapter} variant="outline" className="gap-2">
                                    <Plus size={16} /> Add Page
                                </Button>
                                <Button type="button" size="sm" onClick={addChapter} className="gap-2">
                                    <Plus size={16} /> New Chapter
                                </Button>
                            </div>
                        </div>

                        {groupedPages.map((group, groupIndex) => (
                            <div key={groupIndex} className="space-y-2">
                                {/* Chapter Header */}
                                <div
                                    className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                                    onClick={() => setExpandedChapter(expandedChapter === groupIndex ? null : groupIndex)}
                                >
                                    <div className={`p-1 transition-transform duration-200 ${expandedChapter === groupIndex ? 'rotate-90' : ''}`}>
                                        <ChevronRight size={16} />
                                    </div>
                                    <div className="font-semibold text-lg">{group.title}</div>
                                    <div className="text-xs text-muted-foreground ml-auto bg-background px-2 py-1 rounded-md border">
                                        {group.pages.length} Pages
                                    </div>
                                </div>

                                {/* Chapter Pages (Accordion Body) */}
                                {expandedChapter === groupIndex && (
                                    <div className="pl-4 border-l-2 border-muted space-y-3 ml-2 animate-in slide-in-from-top-1">
                                        {group.pages.map((page, subIndex) => {
                                            const realIndex = group.startIndex + subIndex
                                            return (
                                                <Card key={realIndex} className="overflow-hidden transition-all duration-200 border-dashed">
                                                    <CardHeader
                                                        className="py-3 px-4 cursor-pointer hover:bg-accent/50 flex flex-row items-center justify-between space-y-0"
                                                        onClick={() => setExpandedPage(expandedPage === realIndex ? null : realIndex)}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={`p-1 rounded-full bg-secondary/50 transition-transform duration-200 ${expandedPage === realIndex ? 'rotate-180' : ''}`}>
                                                                <ChevronDown size={14} />
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <CardTitle className="text-sm font-medium">Page {page.page_number}</CardTitle>
                                                                {/* Only show title info if it differs from the main chapter title or is interesting */}
                                                                {page.chapterTitle && page.chapterTitle !== group.title && <span className="text-xs text-muted-foreground">{page.chapterTitle}</span>}
                                                            </div>
                                                        </div>
                                                        {expandedPage !== realIndex && (
                                                            <p className="text-[10px] text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">
                                                                {page.content.length > 0 ? `${page.content.length} chars` : 'Empty'}
                                                            </p>
                                                        )}
                                                    </CardHeader>

                                                    {expandedPage === realIndex && (
                                                        <CardContent className="space-y-4 border-t pt-4 bg-background/50">
                                                            <div className="space-y-2">
                                                                <Label className="text-xs uppercase text-muted-foreground">Page Title / Sub-heading</Label>
                                                                <Input
                                                                    className="h-8"
                                                                    value={page.chapterTitle}
                                                                    onChange={e => updatePage(realIndex, 'chapterTitle', e.target.value)}
                                                                    placeholder="(Optional) e.g. Scene 2"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-xs uppercase text-muted-foreground">Content</Label>
                                                                <Textarea
                                                                    required
                                                                    className="min-h-[200px] font-mono text-sm leading-relaxed resize-y"
                                                                    value={page.content}
                                                                    onChange={e => updatePage(realIndex, 'content', e.target.value)}
                                                                    placeholder="Write..."
                                                                />
                                                            </div>
                                                        </CardContent>
                                                    )}
                                                </Card>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Audio */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Audio</CardTitle>
                            <CardDescription>Add or update audio for "Listen" mode.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Exclusive Audio Selection */}
                            {!audioUrl ? (
                                <Tabs defaultValue="upload" className="w-full">
                                    <TabsList className="grid w-full grid-cols-3 mb-4">
                                        <TabsTrigger value="upload" className="gap-2"><Upload size={16} /> Upload File</TabsTrigger>
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
                                                    <Upload size={24} />
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
                                                setAudioId(null) // Reset ID so we upsert a new one if needed, or handle deletion logic if we were fully rigorous
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
                    <div className="flex items-center gap-4 pt-4 sticky bottom-6 z-10 bg-background/95 backdrop-blur-md p-4 rounded-full border border-border shadow-2xl justify-end">
                        {message && (
                            <p className={message.startsWith("Error") ? "text-destructive mr-auto" : "text-primary mr-auto"}>
                                {message}
                            </p>
                        )}
                        <Button type="button" variant="ghost" onClick={() => router.push(`/stories/${id}`)}>Cancel</Button>
                        <Button type="submit" size="lg" disabled={saving} className="gap-2">
                            {saving ? <Loader2 className="animate-spin" /> : <Save size={16} />}
                            Save Changes
                        </Button>
                    </div>
                </form >
            </div >
        </div >
    )
}
