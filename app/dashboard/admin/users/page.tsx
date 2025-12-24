"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Loader2, Search, UserCog } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"

type Profile = {
    id: string
    full_name: string
    email: string
    role: "admin" | "team_member" | "viewer"
    created_at: string
}

export default function UserManagementPage() {
    const [users, setUsers] = useState<Profile[]>([])
    const [filteredUsers, setFilteredUsers] = useState<Profile[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [processingId, setProcessingId] = useState<string | null>(null)
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)
    const supabase = createClient()
    const { toast } = useToast()

    const fetchData = async () => {
        setIsLoading(true)

        // Fetch current user
        const { data: { user } } = await supabase.auth.getUser()
        if (user) setCurrentUserId(user.id)

        // Fetch profiles
        const { data: profiles, error } = await supabase
            .from("profiles")
            .select("*")
            .order("created_at", { ascending: false })

        if (error) {
            toast({
                title: "Error fetching users",
                description: error.message,
                variant: "destructive",
            })
        } else {
            const typedProfiles = profiles as Profile[]
            setUsers(typedProfiles)
            setFilteredUsers(typedProfiles)
        }
        setIsLoading(false)
    }

    useEffect(() => {
        fetchData()
    }, [])

    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredUsers(users)
        } else {
            const query = searchQuery.toLowerCase()
            setFilteredUsers(users.filter(user =>
                user.full_name?.toLowerCase().includes(query) ||
                user.email?.toLowerCase().includes(query)
            ))
        }
    }, [searchQuery, users])

    const handleRoleChange = async (userId: string, newRole: string) => {
        if (userId === currentUserId && newRole !== 'admin') {
            toast({
                title: "Action prevented",
                description: "You cannot demote yourself from admin status. Ask another admin to do this.",
                variant: "destructive"
            })
            return
        }

        setProcessingId(userId)
        const { error } = await supabase
            .from("profiles")
            .update({ role: newRole })
            .eq("id", userId)

        if (error) {
            toast({
                title: "Failed to update role",
                description: error.message,
                variant: "destructive",
            })
        } else {
            toast({
                title: "Role updated",
                description: "User permissions have been updated successfully.",
            })
            setUsers(users.map(user => user.id === userId ? { ...user, role: newRole as any } : user))
        }
        setProcessingId(null)
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
                    <p className="text-muted-foreground">Manage user roles and permissions.</p>
                </div>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
                    <div>
                        <CardTitle>Users</CardTitle>
                        <CardDescription>A list of all registered users and their current roles.</CardDescription>
                    </div>
                    <div className="w-[250px] relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search users..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center p-8 space-y-4">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            <p className="text-sm text-muted-foreground">Loading users...</p>
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No users found matching "{searchQuery}"
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Joined</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9">
                                                    <AvatarFallback className="bg-primary/10 text-primary">
                                                        {user.full_name?.substring(0, 2).toUpperCase() || 'U'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="font-medium flex items-center gap-2">
                                                        {user.full_name}
                                                        {user.id === currentUserId && <Badge variant="secondary" className="text-[10px] h-5 px-1.5">You</Badge>}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">{user.email || 'No email'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {processingId === user.id && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                                                    <Select
                                                        defaultValue={user.role}
                                                        onValueChange={(value) => handleRoleChange(user.id, value)}
                                                        disabled={processingId === user.id}
                                                    >
                                                        <SelectTrigger className="w-[140px]">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="viewer">
                                                                <div className="flex flex-col">
                                                                    <span>Viewer</span>
                                                                    <span className="text-xs text-muted-foreground">Read-only access</span>
                                                                </div>
                                                            </SelectItem>
                                                            <SelectItem value="team_member">
                                                                <div className="flex flex-col">
                                                                    <span>Team Member</span>
                                                                    <span className="text-xs text-muted-foreground">Can create/edit</span>
                                                                </div>
                                                            </SelectItem>
                                                            <SelectItem value="admin">
                                                                <div className="flex flex-col">
                                                                    <span>Admin</span>
                                                                    <span className="text-xs text-muted-foreground">Full access</span>
                                                                </div>
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
