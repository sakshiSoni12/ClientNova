"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, FileText, Filter, Loader2, Sparkles } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

interface Client {
    id: string
    name: string
    email: string | null
    phone: string | null
    company: string | null
    industry: string | null
    status: string
}

interface Project {
    id: string
    name: string
    client_id: string
    status: string
    priority: string
    budget: number | null
    start_date: string | null
    end_date: string | null
    created_at: string
    clients: { name: string } | null
}

export function ReportsView() {
    const [clients, setClients] = useState<Client[]>([])
    const [projects, setProjects] = useState<Project[]>([])
    const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
    const [selectedClient, setSelectedClient] = useState<string>("all")
    const [timeframe, setTimeframe] = useState<string>("all_time")
    const [isLoading, setIsLoading] = useState(true)
    const [isGenerating, setIsGenerating] = useState(false)
    const { toast } = useToast()

    const fetchData = async () => {
        const supabase = createClient()

        // Fetch clients
        const { data: clientsData } = await supabase.from("clients").select("*")
        if (clientsData) setClients(clientsData)

        // Fetch projects with client details
        const { data: projectsData } = await supabase
            .from("projects")
            .select("*, clients(name)")
            .order("created_at", { ascending: false })

        if (projectsData) {
            // safe cast or handling for clients array/object if needed, 
            // though Supabase single relation usually returns an object
            const formattedProjects = projectsData.map((p: any) => ({
                ...p,
                // Helper to ensure we access the joined name correctly
                clients: Array.isArray(p.clients) ? p.clients[0] : p.clients
            }))
            setProjects(formattedProjects)
        }

        setIsLoading(false)
    }

    useEffect(() => {
        fetchData()
    }, [])

    useEffect(() => {
        let result = projects

        // Filter by Client
        if (selectedClient !== "all") {
            result = result.filter(p => p.client_id === selectedClient)
        }

        // Filter by Timeframe
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        const thisYearStart = new Date(now.getFullYear(), 0, 1)

        if (timeframe === "today") {
            result = result.filter(p => {
                const date = new Date(p.created_at)
                return date >= today
            })
        } else if (timeframe === "this_month") {
            result = result.filter(p => {
                const date = new Date(p.created_at)
                return date >= thisMonthStart
            })
        } else if (timeframe === "this_year") {
            result = result.filter(p => {
                const date = new Date(p.created_at)
                return date >= thisYearStart
            })
        }

        setFilteredProjects(result)
    }, [projects, selectedClient, timeframe])

    const getBase64ImageFromUrl = async (imageUrl: string): Promise<string | null> => {
        try {
            const res = await fetch(imageUrl)
            const blob = await res.blob()
            return new Promise((resolve, reject) => {
                const reader = new FileReader()
                reader.onloadend = () => resolve(reader.result as string)
                reader.onerror = reject
                reader.readAsDataURL(blob)
            })
        } catch (error) {
            console.error("Error loading image:", error)
            return null
        }
    }

    const handleExportPDF = async () => {
        setIsGenerating(true)
        toast({ title: "Generating Report", description: "Fetching AI insights and preparing PDF..." })
        console.log("Starting PDF Generation...")

        const doc = new jsPDF()
        const logoUrl = "/sin-logo.jpg"
        const logoBase64 = await getBase64ImageFromUrl(logoUrl)

        const novaLogoUrl = "/nova-logo-v3.png"
        const novaLogoBase64 = await getBase64ImageFromUrl(novaLogoUrl)

        // --- AI INSIGHTS GENERATION ---
        let aiInsights = null
        if (selectedClient !== "all") {
            const client = clients.find(c => c.id === selectedClient)
            if (client) {
                try {
                    console.log("Contacting AI service...")
                    const res = await fetch('/api/generate-report-insights', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            client,
                            projects: filteredProjects
                        })
                    })

                    if (!res.ok) {
                        const errData = await res.json().catch(() => ({}))
                        console.error("AI API Error:", res.status, errData)
                        throw new Error(`API Error ${res.status}: ${errData.error || 'Unknown'}`)
                    } else {
                        aiInsights = await res.json()

                    }
                } catch (error) {
                    console.error("Report Insight Error:", error)
                }
            }
        }

        // --- DRAWING HELPERS ---
        const drawHeader = (doc: jsPDF) => {
            // Logo (Top Left)
            if (logoBase64) {
                try {
                    // JPEG format assumption, simple 50x15 sizing
                    doc.addImage(logoBase64, 'JPEG', 14, 10, 50, 15)
                } catch (e) {
                    console.error("Logo draw error", e)
                }
            } else {
                // Fallback text if logo fails
                doc.setFontSize(14)
                doc.setTextColor(0, 0, 0)
                doc.text("SIN TECHNOLOGIES", 14, 20)
            }

            // Nova Logo (Top Right)
            if (novaLogoBase64) {
                try {
                    const pageWidth = doc.internal.pageSize.width || 210
                    const imgProps = doc.getImageProperties(novaLogoBase64)
                    const logoHeight = 15
                    const logoWidth = (imgProps.width / imgProps.height) * logoHeight

                    const logoX = pageWidth - 14 - logoWidth // Symmetric margin (14mm)
                    const logoY = 10 // Symmetric Y (10mm)

                    doc.addImage(novaLogoBase64, 'PNG', logoX, logoY, logoWidth, logoHeight)
                } catch (e) {
                    console.error("Nova Logo draw error", e)
                }
            }
        }

        const drawFooter = (doc: jsPDF, pageNumber: number) => {
            const pageHeight = doc.internal.pageSize.height || 297
            doc.setFontSize(8)
            doc.setTextColor(150, 150, 150)
            doc.text("Powered by SIN Technologies Pvt Ltd", 105, pageHeight - 10, { align: "center" })
        }

        // --- CONTENT GENERATION ---

        let startY = 40 // Initial position

        // 1. Report Title Section (Page 1)
        doc.setFont("helvetica", "bold")
        doc.setFontSize(18)
        doc.setTextColor(50, 50, 50)
        doc.text("Client Report", 14, startY)

        // Metadata
        doc.setFont("helvetica", "normal")
        doc.setFontSize(10)
        doc.setTextColor(100, 100, 100)
        const dateStr = new Date().toLocaleDateString()
        doc.text(`Generated on: ${dateStr}`, 14, startY + 6)

        startY += 20

        // 2. Client Details Section (Page 1, if specific client selected)
        if (selectedClient !== "all") {
            const client = clients.find(c => c.id === selectedClient)
            if (client) {
                doc.setFontSize(12)
                doc.setTextColor(0, 0, 0)
                doc.setFont("helvetica", "bold")
                doc.text("Client Details", 14, startY)

                startY += 8
                doc.setFontSize(10)

                // Safe access to properties
                // @ts-ignore
                const details = [
                    { label: "Client Name", value: client.name },
                    { label: "Company", value: (client as any).company || "N/A" },
                    { label: "Email", value: (client as any).email || "N/A" },
                    { label: "Phone", value: (client as any).phone || "N/A" },
                    { label: "Status", value: (client as any).status || "Active" }
                ]

                details.forEach((item) => {
                    doc.setFont("helvetica", "bold")
                    doc.text(`${item.label}:`, 14, startY)
                    doc.setFont("helvetica", "normal")
                    doc.text(item.value, 50, startY)
                    startY += 6
                })

                startY += 12 // Spacing
            }
        }

        // 3. AI Executive Summary & Insights (New Section)
        if (aiInsights) {
            // Executive Summary
            doc.setFontSize(12)
            doc.setTextColor(0, 0, 0)
            doc.setFont("helvetica", "bold")
            doc.text("Client Summary", 14, startY)
            startY += 6

            doc.setFont("helvetica", "normal")
            doc.setFontSize(10)
            doc.setTextColor(60, 60, 60)

            // Text reflow for summary
            const summaryLines = doc.splitTextToSize(aiInsights.summary, 180)
            doc.text(summaryLines, 14, startY)
            startY += (summaryLines.length * 5) + 8

            // Insights & Recommendations
            doc.setFontSize(12)
            doc.setTextColor(0, 0, 0)
            doc.setFont("helvetica", "bold")
            doc.text("Insights & Recommendations", 14, startY)
            startY += 6

            doc.setFont("helvetica", "normal")
            doc.setFontSize(10)
            doc.setTextColor(60, 60, 60)

            aiInsights.recommendations.forEach((rec: string) => {
                const recLines = doc.splitTextToSize(`• ${rec}`, 180)
                doc.text(recLines, 14, startY)
                startY += (recLines.length * 5) + 2
            })

            startY += 10
        }

        // 4. Project Table
        const tableColumn = ["Project Name", "Client", "Status", "Priority", "Budget", "Created"]
        const tableRows = filteredProjects.map(p => [
            p.name,
            p.clients?.name || "N/A",
            p.status,
            p.priority,
            p.budget ? `Rs. ${p.budget.toLocaleString()}` : "Rs. 0",
            new Date(p.created_at).toLocaleDateString()
        ])

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: startY,
            theme: 'grid',
            headStyles: {
                fillColor: [50, 50, 50],
                textColor: 255,
                fontStyle: 'bold'
            },
            alternateRowStyles: {
                fillColor: [248, 248, 248]
            },
            styles: {
                fontSize: 9,
                cellPadding: 4,
                textColor: [50, 50, 50],
                lineColor: [230, 230, 230],
                lineWidth: 0.1
            },
            margin: { top: 30 },
            didDrawPage: (data) => {
                drawHeader(doc)
                drawFooter(doc, data.pageNumber)
            }
        })

        doc.save(`clientnova_report_${selectedClient !== 'all' ? selectedClient : timeframe}.pdf`)
        setIsGenerating(false)
    }

    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground">Loading reports data...</div>
    }

    const totalBudget = filteredProjects.reduce((acc, curr) => acc + (curr.budget || 0), 0)

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Filters and Actions */}
            <div className="flex flex-col md:flex-row gap-6 items-end md:items-center justify-between bg-card/30 p-6 rounded-2xl border border-border/50 backdrop-blur-sm">
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <div className="space-y-2 w-full sm:w-48">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <Filter className="w-3 h-3" /> Timeframe
                        </label>
                        <Select value={timeframe} onValueChange={setTimeframe}>
                            <SelectTrigger className="bg-background/50 border-primary/20 hover:border-primary/50 transition-colors">
                                <SelectValue placeholder="Select timeframe" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all_time">All Time</SelectItem>
                                <SelectItem value="today">Today</SelectItem>
                                <SelectItem value="this_month">This Month</SelectItem>
                                <SelectItem value="this_year">This Year</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2 w-full sm:w-48">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <FileText className="w-3 h-3" /> Client
                        </label>
                        <Select value={selectedClient} onValueChange={setSelectedClient}>
                            <SelectTrigger className="bg-background/50 border-primary/20 hover:border-primary/50 transition-colors">
                                <SelectValue placeholder="Select client" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Clients</SelectItem>
                                {clients.map(client => (
                                    <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <Button
                    onClick={handleExportPDF}
                    disabled={isGenerating}
                    className="w-full md:w-auto shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:scale-105"
                >
                    {isGenerating ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            {selectedClient !== 'all' ? <Sparkles className="w-4 h-4 mr-2 text-yellow-400" /> : <Download className="w-4 h-4 mr-2" />}
                            {selectedClient !== 'all' ? 'AI Report' : 'Export PDF'}
                        </>
                    )}
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="glass border-border/50 overflow-hidden relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <CardHeader className="pb-2 relative z-10">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <FileText className="w-4 h-4 text-primary" />
                            Total Projects
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                            {filteredProjects.length}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Based on current filters</p>
                    </CardContent>
                </Card>

                <Card className="glass border-border/50 overflow-hidden relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <CardHeader className="pb-2 relative z-10">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <span className="text-green-500">₹</span>
                            Total Budget Estimate
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                            ₹{totalBudget.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Accumulated value</p>
                    </CardContent>
                </Card>

                <Card className="glass border-border/50 overflow-hidden relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <CardHeader className="pb-2 relative z-10">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                            Active Projects
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                            {filteredProjects.filter(p => p.status === 'in_progress').length}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Currently in progress</p>
                    </CardContent>
                </Card>
            </div>

            {/* Data Table */}
            <Card className="glass border-border/50 overflow-hidden">
                <CardHeader className="border-b border-border/50 bg-muted/20">
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        Project Details
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-muted/50 border-border/50">
                                <TableHead className="py-4 pl-6">Project Name</TableHead>
                                <TableHead className="py-4">Client</TableHead>
                                <TableHead className="py-4">Status</TableHead>
                                <TableHead className="py-4 text-right">Budget</TableHead>
                                <TableHead className="py-4 pr-6 text-right">Created At</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredProjects.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-16 text-muted-foreground">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                                                <FileText className="w-6 h-6 opacity-50" />
                                            </div>
                                            <p>No projects found for the selected filters.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredProjects.map((project) => (
                                    <TableRow key={project.id} className="hover:bg-muted/30 border-border/50 transition-colors">
                                        <TableCell className="font-medium pl-6">
                                            <div className="py-1">{project.name}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                                    {project.clients?.name?.[0]?.toUpperCase() || "?"}
                                                </div>
                                                {project.clients?.name || "Unknown"}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${project.status === 'completed'
                                                ? 'bg-green-500/10 text-green-600 border-green-500/20'
                                                : project.status === 'in_progress'
                                                    ? 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                                                    : 'bg-muted text-muted-foreground border-border'
                                                }`}>
                                                {project.status.replace('_', ' ')}
                                            </span>
                                        </TableCell>
                                        <TableCell className="font-mono text-xs text-right">
                                            ₹{project.budget?.toLocaleString() || "0"}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-xs text-right pr-6">
                                            {new Date(project.created_at).toLocaleDateString()}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
