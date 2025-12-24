"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Check, X, ShieldAlert, Archive } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

type ApprovalRequest = {
    id: string
    request_type: string
    entity_id: string
    requested_by: string
    status: string
    created_at: string
    requester?: { full_name: string }
}

export default function ApprovalsPage() {
    const [requests, setRequests] = useState<ApprovalRequest[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [processingId, setProcessingId] = useState<string | null>(null)
    const supabase = createClient()
    const { toast } = useToast()

    const fetchRequests = async () => {
        setIsLoading(true)
        const { data, error } = await supabase
            .from("approval_requests")
            .select(`
        *,
        requester:profiles!requested_by(full_name)
      `)
            .eq("status", "pending")
            .order("created_at", { ascending: false })

        if (error) {
            toast({
                title: "Error fetching requests",
                description: error.message,
                variant: "destructive",
            })
        } else {
            setRequests(data as any)
        }
        setIsLoading(false)
    }

    useEffect(() => {
        fetchRequests()
    }, [])

    const handleApprove = async (request: ApprovalRequest) => {
        setProcessingId(request.id)
        try {
            // 1. Perform the actual deletion
            if (request.request_type === 'DELETE_CLIENT') {
                const { error: deleteError } = await supabase.from('clients').delete().eq('id', request.entity_id)
                if (deleteError) throw deleteError
            } else if (request.request_type === 'DELETE_PROJECT') {
                const { error: deleteError } = await supabase.from('projects').delete().eq('id', request.entity_id)
                if (deleteError) throw deleteError
            }

            // 2. Update request status
            const { error: updateError } = await supabase
                .from('approval_requests')
                .update({ status: 'approved' })
                .eq('id', request.id)

            if (updateError) throw updateError

            toast({ title: "Approved", description: "Deletion confirmed and executed." })
            setRequests(prev => prev.filter(r => r.id !== request.id))

        } catch (error: any) {
            toast({
                title: "Operation failed",
                description: error.message,
                variant: "destructive",
            })
        } finally {
            setProcessingId(null)
        }
    }

    const handleReject = async (requestId: string) => {
        setProcessingId(requestId)
        const { error } = await supabase
            .from('approval_requests')
            .update({ status: 'rejected' })
            .eq('id', requestId)

        if (error) {
            toast({
                title: "Failed to reject",
                description: error.message,
                variant: "destructive",
            })
        } else {
            toast({ title: "Rejected", description: "Request has been denied." })
            setRequests(prev => prev.filter(r => r.id !== requestId))
        }
        setProcessingId(null)
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Approval Center</h2>
                <p className="text-muted-foreground">Review pending deletion requests from team members.</p>
            </div>

            <div className="grid gap-4">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center p-12 space-y-4">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">Loading specific requests...</p>
                    </div>
                ) : requests.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center p-12 text-muted-foreground">
                            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                                <Archive className="w-8 h-8 opacity-40" />
                            </div>
                            <h3 className="text-lg font-medium mb-1">No pending approvals</h3>
                            <p className="text-sm text-center max-w-sm">
                                Good news! There are no pending deletion requests requiring your attention right now.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    requests.map((request) => (
                        <Card key={request.id} className="overflow-hidden transition-all hover:shadow-md">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 bg-muted/30">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="bg-background">
                                            {request.request_type === 'DELETE_CLIENT' ? 'Client' : 'Project'}
                                        </Badge>
                                        <CardTitle className="text-base font-medium">
                                            Deletion Request
                                        </CardTitle>
                                    </div>
                                </div>
                                <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20">
                                    Needs Review
                                </Badge>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="text-sm space-y-1">
                                        <p className="text-muted-foreground">
                                            Requested by <span className="font-semibold text-foreground">{request.requester?.full_name || 'Unknown'}</span>
                                        </p>
                                        <p className="text-xs text-muted-foreground font-mono">
                                            ID: {request.entity_id} • {new Date(request.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="flex gap-3">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleReject(request.id)}
                                            disabled={processingId === request.id}
                                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                        >
                                            {processingId === request.id ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <X className="w-4 h-4 mr-2" />}
                                            Reject
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() => handleApprove(request)}
                                            disabled={processingId === request.id}
                                            className="bg-primary hover:bg-primary/90"
                                        >
                                            {processingId === request.id ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                                            Approve Deletion
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
