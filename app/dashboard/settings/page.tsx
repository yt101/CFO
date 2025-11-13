import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getCurrentUserCompanyContext, getCompanySettings } from "@/lib/auth/company-context"
import { SettingsClient } from "./settings-client"
import { Sidebar } from "@/components/sidebar"
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Receipt, 
  Truck, 
  BarChart3, 
  Building2,
  Shield
} from "lucide-react"
import { redirect } from "next/navigation"
import { isDemoMode } from "@/lib/utils/demo-mode"

interface UserAccessSettings {
  cashFlow: boolean
  finance: boolean
  humanResource: boolean
  taxOptimization: boolean
  supplyChain: boolean
  analytics: boolean
  industrySpecific: boolean
}

export default async function SettingsPage() {
  const demoMode = isDemoMode()
  // Get current user company context
  const userContext = await getCurrentUserCompanyContext()
  
  // Only redirect if not in demo mode and no user context
  if (!demoMode && !userContext) {
    redirect('/auth/login')
  }
  
  // Check if user is admin
  if (userContext && userContext.role !== 'admin') {
    redirect('/dashboard')
  }

  // In demo mode, if userContext is null, use default admin context
  const effectiveUserContext = userContext || (demoMode ? {
    id: 'demo-admin-id',
    email: 'admin@demo.com',
    role: 'admin' as const,
    company_id: '550e8400-e29b-41d4-a716-446655440001',
    company_name: 'Acme Corporation',
    permissions: { all_modules: true, super_user: true }
  } : null)

  if (!effectiveUserContext) {
    redirect('/auth/login')
  }

  // Get company settings for module access
  const companySettings = await getCompanySettings(effectiveUserContext.company_id)

  const accessModules = [
    {
      key: 'cashFlow' as keyof UserAccessSettings,
      title: 'Cash Flow',
      description: 'Access to cash flow forecasting, optimization, and management tools',
      iconName: 'DollarSign',
      color: 'text-green-600'
    },
    {
      key: 'finance' as keyof UserAccessSettings,
      title: 'Finance',
      description: 'Comprehensive financial analysis, reporting, and planning capabilities',
      iconName: 'TrendingUp',
      color: 'text-blue-600'
    },
    {
      key: 'humanResource' as keyof UserAccessSettings,
      title: 'Human Resource',
      description: 'Workforce analytics, talent retention, and HR optimization tools',
      iconName: 'Users',
      color: 'text-purple-600'
    },
    {
      key: 'taxOptimization' as keyof UserAccessSettings,
      title: 'Tax Optimization',
      description: 'Advanced tax planning, optimization strategies, and compliance tools',
      iconName: 'Receipt',
      color: 'text-red-600'
    },
    {
      key: 'supplyChain' as keyof UserAccessSettings,
      title: 'Supply Chain',
      description: 'Supply chain optimization, logistics, and procurement analytics',
      iconName: 'Truck',
      color: 'text-orange-600'
    },
    {
      key: 'analytics' as keyof UserAccessSettings,
      title: 'Analytics',
      description: 'Advanced data analytics, reporting, and business intelligence',
      iconName: 'BarChart3',
      color: 'text-indigo-600'
    },
    {
      key: 'industrySpecific' as keyof UserAccessSettings,
      title: 'Industry Specific',
      description: 'Specialized tools and insights tailored to your specific industry',
      iconName: 'Building2',
      color: 'text-teal-600'
    }
  ]

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto bg-gray-50/50">
          <div className="p-6 space-y-6">
        <div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
              <p className="text-muted-foreground">
                Manage your company settings and user access permissions
              </p>
            </div>
            <div className="text-right">
              <Badge variant="outline" className="text-sm">
                {effectiveUserContext.company_name}
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">
                Admin Access
              </p>
            </div>
          </div>
        </div>

        <SettingsClient 
          userContext={effectiveUserContext}
          companySettings={companySettings}
          accessModules={accessModules}
        />
          </div>
        </div>
      </div>
    </div>
  )
}
