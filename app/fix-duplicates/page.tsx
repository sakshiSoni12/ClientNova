"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Trash2 } from "lucide-react"

export default function FixDuplicatesPage() {
    const [loading, setLoading] = useState(true)
    const [duplicates, setDuplicates] = useState<any[]>([])
    const [fixing, setFixing] = useState(false)
    const [message, setMessage] = useState("")
    const supabase = createClient()

    useEffect(() => {
        findDuplicates()
    }, [])

    const findDuplicates = async () => {
        setLoading(true)
        setMessage("")

        // Fetch all stories
        const { data: stories, error } = await supabase
            .from('stories')
            .select('id, title, created_at')
            .order('created_at', { ascending: true })

        if (error) {
            setMessage(`Error fetching stories: ${error.message}`)
            setLoading(false)
            return
        }

        // Group by title
        const groups: { [key: string]: any[] } = {}
        stories?.forEach(story => {
            if (!groups[story.title]) {
                groups[story.title] = []
            }
            groups[story.title].push(story)
        })

        // Identify duplicates (keep the first one, mark others for deletion)
        const duplicateIds: any[] = []
        Object.values(groups).forEach(group => {
            if (group.length > 1) {
                // Keep the first one (oldest), remove the rest
                const toRemove = group.slice(1)
                duplicateIds.push(...toRemove)
            }
        })

        setDuplicates(duplicateIds)
        setLoading(false)
    }

    const cleanUp = async () => {
        setFixing(true)
        const idsToDelete = duplicates.map(d => d.id)

        const { error } = await supabase
            .from('stories')
            .delete()
            .in('id', idsToDelete)

        if (error) {
            setMessage(`Error deleting duplicates: ${error.message}`)
        } else {
            setMessage(`Successfully removed ${idsToDelete.length} duplicates.`)
            setDuplicates([])
        }
        setFixing(false)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Fix Duplicate Stories</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {loading ? (
                        <div className="flex justify-center p-4">
                            <Loader2 className="animate-spin text-primary" />
                        </div>
                    ) : (
                        <>
                            <div className="bg-muted p-4 rounded-md text-sm">
                                {duplicates.length > 0 ? (
                                    <p>Found <span className="font-bold text-red-500">{duplicates.length}</span> duplicate stories.</p>
                                ) : (
                                    <p className="text-green-500 font-medium">No duplicates found. Your database is clean.</p>
                                )}
                            </div>

                            {duplicates.length > 0 && (
                                <div className="max-h-60 overflow-y-auto space-y-2 border rounded p-2">
                                    {duplicates.map(d => (
                                        <div key={d.id} className="text-xs flex justify-between items-center p-2 hover:bg-muted/50 rounded">
                                            <span>{d.title}</span>
                                            <span className="text-muted-foreground text-[10px]">{new Date(d.created_at).toLocaleDateString()}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {message && (
                                <p className="text-sm text-blue-500">{message}</p>
                            )}

                            <Button
                                onClick={cleanUp}
                                disabled={duplicates.length === 0 || fixing}
                                className="w-full gap-2"
                                variant="destructive"
                            >
                                {fixing ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                                Remove Duplicates
                            </Button>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
