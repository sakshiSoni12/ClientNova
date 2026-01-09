"use client"
import Image from "next/image"
import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogTitle,
} from "@/components/ui/dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { cn } from "@/lib/utils"

interface InteractiveLogoProps {
    className?: string
    width?: number
    height?: number
    containerClassName?: string
}

export function InteractiveLogo({
    className,
    width = 40,
    height = 40,
    containerClassName
}: InteractiveLogoProps) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <div
                    className={cn(
                        "rounded-xl overflow-hidden shadow-lg shadow-primary/25 cursor-pointer hover:scale-105 transition-transform bg-background",
                        containerClassName
                    )}
                    style={{ width: width, height: height }}
                >
                    <Image
                        src="/nova-logo.jpg"
                        alt="ClientNova Logo"
                        width={width}
                        height={height}
                        className={cn("w-full h-full object-cover", className)}
                    />
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-transparent border-none shadow-none z-50">
                <VisuallyHidden>
                    <DialogTitle>ClientNova Logo</DialogTitle>
                </VisuallyHidden>
                <div className="relative w-full aspect-square max-w-[500px] mx-auto">
                    <Image
                        src="/nova-logo.jpg"
                        alt="ClientNova Logo Full"
                        fill
                        className="object-contain drop-shadow-2xl"
                    />
                </div>
            </DialogContent>
        </Dialog>
    )
}
