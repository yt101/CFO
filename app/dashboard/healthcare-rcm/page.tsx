import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Heart, TrendingUp, DollarSign, Clock } from "lucide-react"

export default async function HealthcareRCMPage() {
  const isDemoMode = process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co' || 
                    process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_url_here'

  if (isDemoMode) {
    return (
      <DashboardLayout 
        title="Healthcare RCM" 
        description="Revenue Cycle Management for Healthcare Organizations"
      >
        <HealthcareContent />
      </DashboardLayout>
    )
  }

  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect("/auth/login")
  }

  return (
    <DashboardLayout 
      title="Healthcare RCM" 
      description="Revenue Cycle Management for Healthcare Organizations"
    >
      <HealthcareContent />
    </DashboardLayout>
  )
}

function HealthcareContent() {
  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Heart className="h-8 w-8 text-teal-600" />
            <div>
              <CardTitle className="text-2xl">Healthcare Revenue Cycle Management</CardTitle>
              <CardDescription>Specialized cash optimization for healthcare providers</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-sm text-muted-foreground mb-1">A/R Days Outstanding</div>
              <div className="text-2xl font-bold text-teal-600">42.5</div>
              <div className="text-xs text-green-600">-8% improvement</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-sm text-muted-foreground mb-1">Collection Rate</div>
              <div className="text-2xl font-bold text-blue-600">94.2%</div>
              <div className="text-xs text-green-600">+2.1% vs benchmark</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-sm text-muted-foreground mb-1">Denial Rate</div>
              <div className="text-2xl font-bold text-orange-600">8.3%</div>
              <div className="text-xs text-red-600">Target: &lt;6%</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-sm text-muted-foreground mb-1">Cash Impact</div>
              <div className="text-2xl font-bold text-green-600">$1.8M</div>
              <div className="text-xs text-muted-foreground">Optimization potential</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-teal-600" />
              Key Healthcare Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Days in A/R</span>
                <span className="font-bold">42.5 days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Net Collection Rate</span>
                <span className="font-bold">94.2%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">First Pass Resolution</span>
                <span className="font-bold">78.9%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Authorization Rate</span>
                <span className="font-bold">92.1%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Optimization Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="font-semibold text-blue-900 text-sm">Prior Authorization Automation</div>
                <div className="text-xs text-blue-700">Potential: $450K annual savings</div>
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="font-semibold text-green-900 text-sm">Denial Management AI</div>
                <div className="text-xs text-green-700">Potential: $620K revenue recovery</div>
              </div>
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="font-semibold text-purple-900 text-sm">Patient Payment Optimization</div>
                <div className="text-xs text-purple-700">Potential: $380K cash acceleration</div>
              </div>
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="font-semibold text-orange-900 text-sm">Payer Contract Analysis</div>
                <div className="text-xs text-orange-700">Potential: $420K rate improvements</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-purple-600" />
            Coming Soon: Advanced Healthcare RCM
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="max-w-2xl mx-auto">
              <p className="text-muted-foreground mb-4">
                We&apos;re developing comprehensive healthcare revenue cycle management features including:
              </p>
              <div className="grid gap-2 md:grid-cols-2 text-sm text-left">
                <div>• AI-powered denial prediction and prevention</div>
                <div>• Automated prior authorization workflows</div>
                <div>• Real-time eligibility verification</div>
                <div>• Payer performance analytics</div>
                <div>• Patient payment plan optimization</div>
                <div>• Compliance monitoring and reporting</div>
                <div>• Revenue integrity auditing</div>
                <div>• Charge capture optimization</div>
              </div>
              <div className="mt-6">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-teal-100 text-teal-800">
                  Expected Release: Q2 2024
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}































