"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { CompanyUser } from "@/lib/auth/company-context"
import { 
  Settings, 
  Save,
  RefreshCw,
  DollarSign, 
  TrendingUp, 
  Users, 
  Receipt, 
  Truck, 
  BarChart3, 
  Building2,
  AlertTriangle
} from "lucide-react"

interface TargetUser {
  id: string
  name: string
  email: string
  role: string
  status: string
  lastActive: string
  joinedAt: string
  company_id: string
  permissions: Record<string, any>
}

interface RoleDefinition {
  name: string
  description: string
  color: string
  permissions: string[]
}

interface UserSettingsClientProps {
  targetUser: TargetUser
  userContext: CompanyUser
  roleDefinitions: Record<string, RoleDefinition>
}

interface ModulePermissions {
  cashFlow: boolean
  finance: boolean
  humanResource: boolean
  taxOptimization: boolean
  supplyChain: boolean
  analytics: boolean
  industrySpecific: boolean
}

export function UserSettingsClient({ targetUser, userContext, roleDefinitions }: UserSettingsClientProps) {
  const [userRole, setUserRole] = useState(targetUser.role)
  const [modulePermissions, setModulePermissions] = useState<ModulePermissions>({
    cashFlow: targetUser.permissions.cash_flow || false,
    finance: targetUser.permissions.finance || false,
    humanResource: targetUser.permissions.human_resource || false,
    taxOptimization: targetUser.permissions.tax_optimization || false,
    supplyChain: targetUser.permissions.supply_chain || false,
    analytics: targetUser.permissions.analytics || false,
    industrySpecific: targetUser.permissions.industry_specific || false
  })
  const [isSaving, setIsSaving] = useState(false)

  const accessModules = [
    {
      key: 'cashFlow' as keyof ModulePermissions,
      title: 'Cash Flow',
      description: 'Access to cash flow forecasting and optimization tools',
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      key: 'finance' as keyof ModulePermissions,
      title: 'Finance',
      description: 'Comprehensive financial analysis and reporting capabilities',
      icon: TrendingUp,
      color: 'text-blue-600'
    },
    {
      key: 'humanResource' as keyof ModulePermissions,
      title: 'Human Resource',
      description: 'Workforce analytics and HR optimization tools',
      icon: Users,
      color: 'text-purple-600'
    },
    {
      key: 'taxOptimization' as keyof ModulePermissions,
      title: 'Tax Optimization',
      description: 'Advanced tax planning and optimization strategies',
      icon: Receipt,
      color: 'text-red-600'
    },
    {
      key: 'supplyChain' as keyof ModulePermissions,
      title: 'Supply Chain',
      description: 'Supply chain optimization and procurement analytics',
      icon: Truck,
      color: 'text-orange-600'
    },
    {
      key: 'analytics' as keyof ModulePermissions,
      title: 'Analytics',
      description: 'Advanced data analytics and business intelligence',
      icon: BarChart3,
      color: 'text-indigo-600'
    },
    {
      key: 'industrySpecific' as keyof ModulePermissions,
      title: 'Industry Specific',
      description: 'Specialized tools tailored to specific industries',
      icon: Building2,
      color: 'text-teal-600'
    }
  ]

  const handleRoleChange = (newRole: string) => {
    setUserRole(newRole)
    
    // Auto-set permissions based on role
    const roleDef = roleDefinitions[newRole]
    if (roleDef) {
      // Admin gets all permissions
      if (newRole === 'admin') {
        setModulePermissions({
          cashFlow: true,
          finance: true,
          humanResource: true,
          taxOptimization: true,
          supplyChain: true,
          analytics: true,
          industrySpecific: true
        })
      }
      // User gets basic permissions
      else if (newRole === 'user') {
        setModulePermissions({
          cashFlow: true,
          finance: true,
          humanResource: false,
          taxOptimization: false,
          supplyChain: false,
          analytics: true,
          industrySpecific: false
        })
      }
      // Viewer gets minimal permissions
      else if (newRole === 'viewer') {
        setModulePermissions({
          cashFlow: false,
          finance: false,
          humanResource: false,
          taxOptimization: false,
          supplyChain: false,
          analytics: false,
          industrySpecific: false
        })
      }
    }
  }

  const handleModuleToggle = (key: keyof ModulePermissions) => {
    setModulePermissions(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
    // Here you would typically save to your backend
    console.log('User settings saved:', { 
      userId: targetUser.id, 
      role: userRole, 
      permissions: modulePermissions 
    })
  }

  const handleReset = () => {
    setUserRole(targetUser.role)
    setModulePermissions({
      cashFlow: targetUser.permissions.cash_flow || false,
      finance: targetUser.permissions.finance || false,
      humanResource: targetUser.permissions.human_resource || false,
      taxOptimization: targetUser.permissions.tax_optimization || false,
      supplyChain: targetUser.permissions.supply_chain || false,
      analytics: targetUser.permissions.analytics || false,
      industrySpecific: targetUser.permissions.industry_specific || false
    })
  }

  const isRoleChanged = userRole !== targetUser.role
  const arePermissionsChanged = JSON.stringify(modulePermissions) !== JSON.stringify({
    cashFlow: targetUser.permissions.cash_flow || false,
    finance: targetUser.permissions.finance || false,
    humanResource: targetUser.permissions.human_resource || false,
    taxOptimization: targetUser.permissions.tax_optimization || false,
    supplyChain: targetUser.permissions.supply_chain || false,
    analytics: targetUser.permissions.analytics || false,
    industrySpecific: targetUser.permissions.industry_specific || false
  })

  const hasChanges = isRoleChanged || arePermissionsChanged

  return (
    <>
      {/* Role Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Role & Permissions Management
          </CardTitle>
          <CardDescription>
            Change user role and configure module-specific permissions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="user-role">User Role</Label>
              <Select value={userRole} onValueChange={handleRoleChange}>
                <SelectTrigger id="user-role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(roleDefinitions).map(([key, role]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <Badge className={role.color}>{role.name}</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Changing role will automatically adjust module permissions
              </p>
            </div>
            <div className="space-y-2">
              <Label>Current Role Info</Label>
              <div className="p-3 border rounded-lg bg-gray-50">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className={roleDefinitions[userRole]?.color}>
                    {roleDefinitions[userRole]?.name}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {roleDefinitions[userRole]?.description}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-3">Module Access Permissions</h4>
              <div className="grid gap-4">
                {accessModules.map((module) => {
                  const Icon = module.icon
                  const moduleKey = module.key
                  const isEnabled = modulePermissions[moduleKey]
                  const isDisabled = userRole === 'viewer' && !['analytics'].includes(moduleKey)

                  return (
                    <div key={module.key} className={`flex items-center justify-between p-4 border rounded-lg ${isDisabled ? 'opacity-50' : ''}`}>
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg bg-gray-50 ${module.color}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium">{module.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {module.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor={module.key} className="text-sm">
                          {isEnabled ? 'Enabled' : 'Disabled'}
                        </Label>
                        <Switch
                          id={module.key}
                          checked={isEnabled}
                          onCheckedChange={() => handleModuleToggle(moduleKey)}
                          disabled={isDisabled}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {userRole === 'viewer' && (
              <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="font-medium text-yellow-800">Viewer Role Limitation</span>
                </div>
                <p className="text-sm text-yellow-700">
                  Viewer role has limited access. Most modules are disabled for security reasons.
                </p>
              </div>
            )}

            <Separator />

            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {hasChanges ? 'You have unsaved changes' : 'All changes saved'}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleReset} disabled={isSaving || !hasChanges}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset Changes
                </Button>
                <Button onClick={handleSave} disabled={isSaving || !hasChanges}>
                  {isSaving ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Permission Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Permission Summary</CardTitle>
          <CardDescription>
            Overview of user's current access permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {accessModules
              .filter(module => modulePermissions[module.key])
              .map((module) => {
                const Icon = module.icon
                return (
                  <div key={module.key} className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className={`p-1 rounded ${module.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium">{module.title}</span>
                  </div>
                )
              })}
          </div>
          {accessModules.filter(module => modulePermissions[module.key]).length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No modules are currently enabled for this user
            </p>
          )}
        </CardContent>
      </Card>
    </>
  )
}





























