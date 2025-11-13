"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Receipt, 
  Truck, 
  BarChart3, 
  Building2,
  Save,
  RotateCcw,
  CheckCircle,
  AlertCircle
} from "lucide-react"

// Icon mapping function
const getIconComponent = (iconName: string) => {
  const icons = {
    DollarSign,
    TrendingUp,
    Users,
    Receipt,
    Truck,
    BarChart3,
    Building2,
  }
  return icons[iconName as keyof typeof icons] || BarChart3
}

interface UserAccessSettings {
  cashFlow: boolean
  finance: boolean
  humanResource: boolean
  taxOptimization: boolean
  supplyChain: boolean
  analytics: boolean
  industrySpecific: boolean
}

interface AccessModule {
  key: keyof UserAccessSettings
  title: string
  description: string
  iconName: string
  color: string
}

interface SettingsClientProps {
  userContext: any
  companySettings: any
  accessModules: AccessModule[]
}

export function SettingsClient({ userContext, companySettings, accessModules }: SettingsClientProps) {
  const [settings, setSettings] = useState<UserAccessSettings>({
    cashFlow: companySettings?.modules?.cash_flow || false,
    finance: companySettings?.modules?.finance || false,
    humanResource: companySettings?.modules?.human_resource || false,
    taxOptimization: companySettings?.modules?.tax_optimization || false,
    supplyChain: companySettings?.modules?.supply_chain || false,
    analytics: companySettings?.modules?.analytics || false,
    industrySpecific: companySettings?.modules?.industry_specific || false,
  })

  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleToggle = (key: keyof UserAccessSettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
    setHasChanges(true)
    setSaveStatus('idle')
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setHasChanges(false)
      setSaveStatus('success')
      
      // Reset success status after 3 seconds
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (error) {
      setSaveStatus('error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setSettings({
      cashFlow: companySettings?.modules?.cash_flow || false,
      finance: companySettings?.modules?.finance || false,
      humanResource: companySettings?.modules?.human_resource || false,
      taxOptimization: companySettings?.modules?.tax_optimization || false,
      supplyChain: companySettings?.modules?.supply_chain || false,
      analytics: companySettings?.modules?.analytics || false,
      industrySpecific: companySettings?.modules?.industry_specific || false,
    })
    setHasChanges(false)
    setSaveStatus('idle')
  }

  const getEnabledCount = () => {
    return Object.values(settings).filter(Boolean).length
  }

  return (
    <div className="space-y-6">
      {/* User Access Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Access Control
              </CardTitle>
              <CardDescription>
                Configure which modules your team members can access
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {saveStatus === 'success' && (
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Saved</span>
                </div>
              )}
              {saveStatus === 'error' && (
                <div className="flex items-center gap-1 text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">Error</span>
                </div>
              )}
              <Badge variant="outline">
                {getEnabledCount()} of {accessModules.length} enabled
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {accessModules.map((module) => {
              const IconComponent = getIconComponent(module.iconName)
              return (
                <div
                  key={module.key}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`p-2 rounded-lg bg-gray-100`}>
                      <IconComponent className={`h-5 w-5 ${module.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{module.title}</h3>
                      <p className="text-xs text-muted-foreground">
                        {module.description}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={settings[module.key]}
                    onCheckedChange={() => handleToggle(module.key)}
                    className="ml-4"
                  />
                </div>
              )
            })}
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Changes will apply to all team members immediately
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={!hasChanges || isSaving}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Information */}
      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
          <CardDescription>
            Basic information about your company
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Company Name</label>
              <p className="text-sm text-muted-foreground mt-1">
                {userContext.company_name}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Your Role</label>
              <p className="text-sm text-muted-foreground mt-1">
                {userContext.role.charAt(0).toUpperCase() + userContext.role.slice(1)}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <p className="text-sm text-muted-foreground mt-1">
                {userContext.email}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Company ID</label>
              <p className="text-sm text-muted-foreground mt-1 font-mono">
                {userContext.company_id}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}