"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Users, 
  UserPlus, 
  Shield, 
  Mail,
  CheckCircle,
  Clock,
  Settings,
  Eye,
  Edit,
  Trash2
} from "lucide-react"
import Link from "next/link"

export default function TeamPage() {
  const [showInviteForm, setShowInviteForm] = useState(false)

  const teamMembers = [
    {
      id: "demo-admin-id",
      name: "John Doe",
      email: "admin@demo.com",
      role: "Founder",
      status: "active",
      lastActive: "Online now",
      joinedAt: "Jan 2023"
    },
    {
      id: "demo-user-id",
      name: "Jane Smith",
      email: "user@demo.com",
      role: "CFO",
      status: "active",
      lastActive: "2 hours ago",
      joinedAt: "Mar 2023"
    },
    {
      id: "demo-accountant-id",
      name: "Bob Johnson",
      email: "accountant@demo.com",
      role: "Accountant",
      status: "active",
      lastActive: "1 day ago",
      joinedAt: "Jun 2023"
    },
    {
      id: "demo-analyst-id",
      name: "Alice Williams",
      email: "analyst@demo.com",
      role: "Analyst",
      status: "active",
      lastActive: "3 days ago",
      joinedAt: "Aug 2023"
    },
    {
      id: "demo-viewer-id",
      name: "Charlie Brown",
      email: "viewer@demo.com",
      role: "Viewer",
      status: "invited",
      lastActive: "Never",
      joinedAt: "Pending"
    }
  ]

  const roleDefinitions = [
    {
      role: "Founder",
      description: "Full system access, can manage all aspects",
      permissions: [
        "View all financial data",
        "Edit and delete data",
        "Manage integrations",
        "Manage team members",
        "Configure system settings",
        "Access sensitive data",
        "Create and run scenarios"
      ],
      userCount: 1
    },
    {
      role: "CFO",
      description: "Financial management and reporting access",
      permissions: [
        "View all financial data",
        "Edit financial data",
        "Manage integrations",
        "View team members",
        "Generate reports",
        "Access sensitive data",
        "Create and run scenarios"
      ],
      userCount: 1
    },
    {
      role: "Accountant",
      description: "Data entry and basic reporting",
      permissions: [
        "View financial data",
        "Edit financial data",
        "Upload documents",
        "View basic reports",
        "Manage transactions"
      ],
      userCount: 1
    },
    {
      role: "Analyst",
      description: "Read-only access for analysis",
      permissions: [
        "View financial data",
        "Generate reports",
        "View dashboards",
        "Run scenarios (read-only)"
      ],
      userCount: 1
    },
    {
      role: "Viewer",
      description: "Basic read-only access",
      permissions: [
        "View dashboards",
        "View basic reports"
      ],
      userCount: 1
    }
  ]

  const pendingInvites = [
    {
      id: "1",
      email: "newcfo@example.com",
      role: "CFO",
      invitedBy: "John Doe",
      invitedAt: "2 days ago",
      expiresAt: "5 days"
    },
    {
      id: "2",
      email: "analyst2@example.com",
      role: "Analyst",
      invitedBy: "Jane Smith",
      invitedAt: "5 days ago",
      expiresAt: "2 days"
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default" className="flex items-center gap-1"><CheckCircle className="h-3 w-3" />Active</Badge>
      case "invited":
        return <Badge variant="secondary" className="flex items-center gap-1"><Clock className="h-3 w-3" />Invited</Badge>
      case "inactive":
        return <Badge variant="outline">Inactive</Badge>
      default:
        return <Badge>Unknown</Badge>
    }
  }

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      "Founder": "bg-purple-600",
      "CFO": "bg-blue-600",
      "Accountant": "bg-green-600",
      "Analyst": "bg-yellow-600",
      "Viewer": "bg-gray-600"
    }
    return <Badge className={colors[role] || ""}>{role}</Badge>
  }

  return (
    <DashboardLayout
      title="Team & Permissions"
      description="Manage team members and role-based access control"
    >
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teamMembers.filter(m => m.status === 'active').length}</div>
              <p className="text-xs text-muted-foreground">
                {teamMembers.length} total (including invited)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Invites</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingInvites.length}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting acceptance
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Role Types</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{roleDefinitions.length}</div>
              <p className="text-xs text-muted-foreground">
                Permission levels
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Today</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-muted-foreground">
                Members online
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="members" className="space-y-6">
          <TabsList>
            <TabsTrigger value="members">Team Members</TabsTrigger>
            <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
            <TabsTrigger value="invites">Pending Invites</TabsTrigger>
            <TabsTrigger value="audit">Audit Log</TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Team Members</CardTitle>
                    <CardDescription>
                      Manage users and their roles
                    </CardDescription>
                  </div>
                  <Button onClick={() => setShowInviteForm(!showInviteForm)}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Invite Member
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {showInviteForm && (
                  <div className="mb-6 p-4 border rounded-lg bg-accent/50">
                    <h4 className="font-medium mb-4">Invite New Team Member</h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="invite-email">Email Address</Label>
                        <Input id="invite-email" type="email" placeholder="user@example.com" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="invite-role">Role</Label>
                        <Select defaultValue="viewer">
                          <SelectTrigger id="invite-role">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="founder">Founder</SelectItem>
                            <SelectItem value="cfo">CFO</SelectItem>
                            <SelectItem value="accountant">Accountant</SelectItem>
                            <SelectItem value="analyst">Analyst</SelectItem>
                            <SelectItem value="viewer">Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button onClick={() => {
                        alert("Invitation sent! (Demo mode)")
                        setShowInviteForm(false)
                      }}>
                        Send Invitation
                      </Button>
                      <Button variant="outline" onClick={() => setShowInviteForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{member.name}</span>
                            {getRoleBadge(member.role)}
                            {getStatusBadge(member.status)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {member.email} • Joined {member.joinedAt} • {member.lastActive}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link href={`/dashboard/user-settings/${member.id}`}>
                          <Button size="sm" variant="ghost" title="Edit user settings">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        {member.role !== "Founder" && (
                          <Button size="sm" variant="ghost" title="Remove user">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roles" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Roles & Permissions</CardTitle>
                <CardDescription>
                  Permission levels and access control
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {roleDefinitions.map((roleDef) => (
                    <div key={roleDef.role} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-lg">{roleDef.role}</span>
                            {getRoleBadge(roleDef.role)}
                            <Badge variant="outline">{roleDef.userCount} {roleDef.userCount === 1 ? 'user' : 'users'}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{roleDef.description}</p>
                        </div>
                        <Link href={`/dashboard/user-settings/${teamMembers.find(m => m.role === roleDef.role)?.id || 'demo-admin-id'}`}>
                          <Button size="sm" variant="ghost" title="Edit role permissions">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium">Permissions:</h5>
                        <div className="grid gap-2 md:grid-cols-2">
                          {roleDef.permissions.map((permission, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span>{permission}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invites" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Invitations</CardTitle>
                <CardDescription>
                  Invitations waiting for acceptance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingInvites.map((invite) => (
                    <div key={invite.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Mail className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{invite.email}</span>
                            {getRoleBadge(invite.role)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Invited by {invite.invitedBy} • {invite.invitedAt} • Expires in {invite.expiresAt}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          Resend
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {pendingInvites.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Mail className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No pending invitations</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Audit Log</CardTitle>
                <CardDescription>
                  Track all team and permission changes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { action: "User invited", user: "John Doe", target: "analyst@demo.com", time: "2 hours ago" },
                    { action: "Role changed", user: "Jane Smith", target: "Bob Johnson: Accountant → CFO", time: "1 day ago" },
                    { action: "User activated", user: "System", target: "Alice Williams", time: "3 days ago" },
                    { action: "Permission updated", user: "John Doe", target: "Analyst role permissions", time: "5 days ago" }
                  ].map((log, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 border-l-4 border-primary/20 bg-accent/50">
                      <Shield className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="font-medium">{log.action}</div>
                        <div className="text-sm text-muted-foreground">
                          {log.user} • {log.target}
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">{log.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}




