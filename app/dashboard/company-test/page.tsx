import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DashboardLayout } from "@/components/dashboard-layout"
import { getCurrentUserCompanyContext, getCompanySettings, getCompanyUsers } from "@/lib/auth/company-context"
import { redirect } from "next/navigation"
import { Users, Building2, Shield, Eye, EyeOff } from "lucide-react"

export default async function CompanyTestPage() {
  // Get current user company context
  const userContext = await getCurrentUserCompanyContext()
  
  if (!userContext) {
    redirect('/auth/login')
  }

  // Get company settings and users
  const companySettings = await getCompanySettings(userContext.company_id)
  const companyUsers = await getCompanyUsers()

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Company Isolation Test</h1>
          <p className="text-muted-foreground">
            This page demonstrates data confidentiality and company-level access control
          </p>
        </div>

        {/* Company Context Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Your Company Context
            </CardTitle>
            <CardDescription>
              Information about your current company and access level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Company Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Company Name:</span>
                      <span className="font-medium">{userContext.company_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Company ID:</span>
                      <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                        {userContext.company_id}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Your Role:</span>
                      <Badge variant={userContext.role === 'admin' ? 'default' : 'secondary'}>
                        {userContext.role.charAt(0).toUpperCase() + userContext.role.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Access Control</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Data Isolation:</span>
                      <span className="text-green-600 flex items-center gap-1">
                        <Shield className="h-4 w-4" />
                        Enabled
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Module Access:</span>
                      <span>{companySettings?.modules ? 
                        `${Object.values(companySettings.modules).filter(Boolean).length} enabled` :
                        'Loading...'
                      }</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Company Users:</span>
                      <span>{companyUsers.length} users</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Module Access Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Module Access Status
            </CardTitle>
            <CardDescription>
              Which modules are enabled for your company
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {companySettings?.modules && Object.entries(companySettings.modules).map(([module, enabled]) => (
                <div key={module} className={`p-4 border rounded-lg ${enabled ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {enabled ? (
                      <Eye className="h-4 w-4 text-green-600" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    )}
                    <span className={`font-medium text-sm ${enabled ? 'text-green-800' : 'text-gray-600'}`}>
                      {module.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                  <div className={`text-xs ${enabled ? 'text-green-600' : 'text-gray-500'}`}>
                    {enabled ? 'Access Granted' : 'Access Restricted'}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Company Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Company Users
            </CardTitle>
            <CardDescription>
              Users who have access to your company's data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {companyUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        {user.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-sm">{user.email}</div>
                      <div className="text-xs text-muted-foreground">
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)} • Same Company
                      </div>
                    </div>
                  </div>
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                    {user.role}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Data Isolation Explanation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Data Isolation & Security
            </CardTitle>
            <CardDescription>
              How your data is protected and isolated from other companies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">What's Protected</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-600" />
                    Tax returns and financial data
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-600" />
                    Chat conversations and AI insights
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-600" />
                    User profiles and permissions
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-600" />
                    Company settings and configurations
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-3">How It Works</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Every database record is tagged with your company ID</li>
                  <li>• Row Level Security (RLS) enforces company isolation</li>
                  <li>• Users can only access data from their company</li>
                  <li>• Module access is controlled per company</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}





























