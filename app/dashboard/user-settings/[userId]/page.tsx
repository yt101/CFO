import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DashboardLayout } from "@/components/dashboard-layout"
import { getCurrentUserCompanyContext } from "@/lib/auth/company-context"
import { UserSettingsClient } from "./user-settings-client"
import { 
  User, 
  Shield, 
  ArrowLeft,
  Mail,
  Calendar,
  Settings
} from "lucide-react"
import { redirect } from "next/navigation"
import Link from "next/link"

interface UserSettingsPageProps {
  params: Promise<{ userId: string }>
}

export default async function UserSettingsPage({ params }: UserSettingsPageProps) {
  const { userId } = await params
  
  // Get current user company context
  const userContext = await getCurrentUserCompanyContext()
  
  if (!userContext) {
    redirect('/auth/login')
  }

  // Check if user is admin (only admins can edit user settings)
  if (userContext.role !== 'admin') {
    redirect('/dashboard')
  }

  // Demo user data - in production, this would be fetched from database
  const demoUsers = {
      'demo-admin-id': {
        id: 'demo-admin-id',
        name: 'John Doe',
        email: 'admin@demo.com',
        role: 'admin',
        status: 'active',
        lastActive: 'Online now',
        joinedAt: 'Jan 2023',
        company_id: userContext.company_id,
        permissions: {
          all_modules: true,
          can_manage_users: true,
          can_edit_settings: true,
          can_configure_integrations: true,
          can_manage_company_settings: true,
          can_access_all_configurations: true,
          can_modify_permissions: true,
          can_access_admin_panel: true,
          can_manage_billing: true,
          can_export_data: true,
          can_import_data: true,
          can_manage_api_keys: true,
          can_configure_webhooks: true,
          can_manage_roles: true,
          can_audit_logs: true,
          super_user: true
        }
      },
    'demo-user-id': {
      id: 'demo-user-id',
      name: 'Jane Smith',
      email: 'user@demo.com',
      role: 'user',
      status: 'active',
      lastActive: '2 hours ago',
      joinedAt: 'Mar 2023',
      company_id: userContext.company_id,
      permissions: {
        cash_flow: true,
        finance: true,
        tax_optimization: false,
        analytics: true
      }
    }
  }

  const targetUser = demoUsers[userId as keyof typeof demoUsers]

  if (!targetUser) {
    redirect('/dashboard/team')
  }

  const roleDefinitions = {
    admin: {
      name: 'Administrator',
      description: 'Full system access, can manage all aspects',
      color: 'bg-purple-600',
      permissions: [
        'View all financial data',
        'Edit and delete data',
        'Manage integrations',
        'Manage team members',
        'Configure system settings',
        'Access sensitive data',
        'Create and run scenarios'
      ]
    },
    user: {
      name: 'User',
      description: 'Standard user access with configurable permissions',
      color: 'bg-blue-600',
      permissions: [
        'View assigned financial data',
        'Edit data (based on permissions)',
        'Generate reports',
        'Access enabled modules'
      ]
    },
    viewer: {
      name: 'Viewer',
      description: 'Read-only access for viewing data',
      color: 'bg-gray-600',
      permissions: [
        'View dashboards',
        'View basic reports',
        'Read-only access to data'
      ]
    }
  }

  const currentRole = roleDefinitions[targetUser.role as keyof typeof roleDefinitions]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/team">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Team
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">User Settings</h1>
              <p className="text-muted-foreground">
                Manage user permissions and access for {targetUser.name}
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-sm">
            {userContext.company_name}
          </Badge>
        </div>

        {/* User Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              User Information
            </CardTitle>
            <CardDescription>
              Basic information about the user
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Personal Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium">{targetUser.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {targetUser.email}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant={targetUser.status === 'active' ? 'default' : 'secondary'}>
                        {targetUser.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Active:</span>
                      <span>{targetUser.lastActive}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Role & Access</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Current Role:</span>
                      <Badge className={currentRole.color}>
                        {currentRole.name}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Joined:</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {targetUser.joinedAt}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">User ID:</span>
                      <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                        {targetUser.id}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Role Definition Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Current Role: {currentRole.name}
            </CardTitle>
            <CardDescription>
              {currentRole.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-3">Role Permissions</h4>
                <div className="grid gap-2 md:grid-cols-2">
                  {currentRole.permissions.map((permission, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      <span>{permission}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Settings Client Component */}
        <UserSettingsClient 
          targetUser={targetUser}
          userContext={userContext}
          roleDefinitions={roleDefinitions}
        />
      </div>
    </DashboardLayout>
  )
}





























