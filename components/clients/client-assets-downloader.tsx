"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"
import JSZip from "jszip"
// import { saveAs } from "file-saver"
import { toast } from "sonner"

interface ClientAsset {
    file_url: string
    file_name: string
}

interface ClientAssetsDownloaderProps {
    clientId: string
    clientName: string
    buttonVariant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
    className?: string
}

export function ClientAssetsDownloader({
    clientId,
    clientName,
    buttonVariant = "outline",
    className
}: ClientAssetsDownloaderProps) {
    const [isDownloading, setIsDownloading] = useState(false)

    const handleDownload = async () => {
        setIsDownloading(true)
        const supabase = createClient()
        const zip = new JSZip()

        try {
            // 1. Fetch assets list
            const { data: assets, error } = await supabase
                .from("client_assets")
                .select("file_url, file_name")
                .eq("client_id", clientId)

            if (error) throw error
            if (!assets || assets.length === 0) {
                toast.error("No assets found for this client")
                setIsDownloading(false)
                return
            }

            // 2. Download each file
            const downloadPromises = assets.map(async (asset: ClientAsset) => {
                try {
                    // If URL is public/signed, fetch it. 
                    // Note: If CORS issues arise with public URLs, we might need to download via Supabase storage method if possible, 
                    // or ensure CORS headers are set on the bucket.
                    // Assuming public URL for now:
                    const response = await fetch(asset.file_url)
                    if (!response.ok) throw new Error(`Failed to fetch ${asset.file_name}`)
                    const blob = await response.blob()
                    zip.file(asset.file_name, blob)
                } catch (err) {
                    console.error(`Error downloading ${asset.file_name}:`, err)
                    // We continue even if one fails
                }
            })

            await Promise.all(downloadPromises)

            // 3. Generate Zip
            const content = await zip.generateAsync({ type: "blob" })

            // 4. Save
            const safeName = clientName.replace(/[^a-z0-9]/gi, '_').toLowerCase()
            // saveAs(content, `${safeName}_assets.zip`) --> Replaced with native helper
            downloadBlob(content, `${safeName}_assets.zip`)
            toast.success("Assets downloaded successfully")

        } catch (err: any) {
            console.error("Download error:", err)
            toast.error("Failed to download assets: " + err.message)
        } finally {
            setIsDownloading(false)
        }
    }

    return (
        <Button
            variant={buttonVariant}
            onClick={handleDownload}
            disabled={isDownloading}
            className={className}
        >
            {isDownloading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <Download className="mr-2 h-4 w-4" />
            )}
            {isDownloading ? "Zipping..." : "Download Assets"}
        </Button>
    )
}

// Helper function to replace file-saver
function downloadBlob(blob: Blob, fileName: string) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}
