import { ReportsView } from "@/components/reports/reports-view"

export default function ReportsPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                    Reports Analytics
                </h1>
                <p className="text-muted-foreground text-lg">
                    Comprehensive overview of your project performance and financial insights.
                </p>
            </div>
            <ReportsView />
        </div>
    )
}
