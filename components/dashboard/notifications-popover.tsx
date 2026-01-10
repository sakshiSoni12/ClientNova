"use client"

import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"

export function NotificationsPopover() {
    const notifications: any[] = [] // Empty for now to show "No Notification" state

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="w-5 h-5" />
                    {/* Only show dot if there are notifications */}
                    {notifications.length > 0 && (
                        <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="p-4 border-b border-border">
                    <h4 className="font-semibold leading-none">Notifications</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                        You have {notifications.length} unread messages.
                    </p>
                </div>
                <ScrollArea className="h-[300px]">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[200px] p-4 text-center">
                            <Bell className="w-8 h-8 text-muted-foreground/30 mb-2" />
                            <p className="text-sm text-muted-foreground">No Notification For Today</p>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {/* Notification items would go here */}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    )
}
