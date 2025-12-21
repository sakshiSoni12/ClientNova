import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import Link from "next/link"

export default function AuthCodeError() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-6">
            <Card className="max-w-md w-full glass border-destructive/20">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                            <AlertCircle className="w-8 h-8 text-destructive" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl text-destructive">Authentication Error</CardTitle>
                    <CardDescription>
                        We couldn't verify your request. This often happens if the link has expired or has already been used.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Link href="/auth/login" className="block">
                        <Button className="w-full" variant="default">
                            Back to Sign In
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
    )
}
