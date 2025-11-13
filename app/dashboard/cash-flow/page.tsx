import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, TrendingUp, DollarSign, Clock, BarChart3 } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { KPICard } from "@/components/kpi-card"
import { CashFlowForecast } from "@/components/cash-flow-forecast"
import { TrendsAnalysis } from "@/components/trends-analysis"
import { DashboardLayout } from "@/components/dashboard-layout"
import { CashOptimization } from "@/components/cash-optimization"
import { AIInsights } from "@/components/ai-insights"

import { isDemoMode } from "@/lib/utils/demo-mode"

export default async function CashFlowPage() {
  // Check if we're in demo mode
  const demoMode = isDemoMode()

  if (!demoMode) {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      redirect("/auth/login")
    }
  }

  // Use demo data or fetch from database
  let allMetrics = null
  if (!demoMode) {
    const supabase = await createClient()
    const { data } = await supabase
      .from("metrics")
      .select("*")
    allMetrics = data
  } else {
    // Demo data
    allMetrics = [
      { name: "Current Ratio", value: 2.1 },
      { name: "Quick Ratio", value: 1.8 },
      { name: "DSO", value: 32 },
      { name: "DPO", value: 28 },
      { name: "DIO", value: 45 },
      { name: "Cash Conversion Cycle", value: 49 }
    ]
  }

  // Calculate aggregated KPIs
  const currentRatio = allMetrics?.find(m => m.name === "Current Ratio")?.value || 0
  const quickRatio = allMetrics?.find(m => m.name === "Quick Ratio")?.value || 0
  const dso = allMetrics?.find(m => m.name === "DSO")?.value || 0
  const dpo = allMetrics?.find(m => m.name === "DPO")?.value || 0
  const dio = allMetrics?.find(m => m.name === "DIO")?.value || 0
  const ccc = allMetrics?.find(m => m.name === "Cash Conversion Cycle")?.value || 0

  return (
    <DashboardLayout 
      title="Cash Flow" 
      description="Comprehensive cash flow analysis and forecasting"
    >
      <div className="space-y-8">

              {/* Key Metrics Grid */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <KPICard
                  title="Cash Conversion Cycle"
                  value={ccc}
                  unit="days"
                  change={-10.9}
                  changeLabel="vs last period"
                  trend="down"
                  icon={<Clock className="h-4 w-4 text-muted-foreground" />}
                  description="Time to convert investments into cash"
                  target={58}
                  industry={70.7}
                />
                
                <KPICard
                  title="Days Sales Outstanding"
                  value={dso}
                  unit="days"
                  change={-6.8}
                  changeLabel="vs last period"
                  trend="down"
                  icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />}
                  description="Average collection period"
                  target={35}
                  industry={38.5}
                />
                
                <KPICard
                  title="Days Payable Outstanding"
                  value={dpo}
                  unit="days"
                  change={5.4}
                  changeLabel="vs last period"
                  trend="up"
                  icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
                  description="Average payment period"
                  target={32}
                  industry={30.1}
                />
                
                <KPICard
                  title="Days Inventory Outstanding"
                  value={dio}
                  unit="days"
                  change={-9.1}
                  changeLabel="vs last period"
                  trend="down"
                  icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />}
                  description="Inventory turnover period"
                  target={55}
                  industry={62.3}
                />
              </div>

              {/* Main Content Tabs */}
              <Tabs defaultValue="forecast" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="forecast">Cash Forecast</TabsTrigger>
                  <TabsTrigger value="optimization">Optimization</TabsTrigger>
                  <TabsTrigger value="trends">Trends</TabsTrigger>
                  <TabsTrigger value="insights">AI Insights</TabsTrigger>
                </TabsList>

                <TabsContent value="forecast" className="space-y-6">
                  <CashFlowForecast />
                </TabsContent>

                <TabsContent value="optimization" className="space-y-6">
                  <CashOptimization />
                </TabsContent>

                <TabsContent value="trends" className="space-y-6">
                  <TrendsAnalysis />
                </TabsContent>

                <TabsContent value="insights" className="space-y-6">
                  <AIInsights />
                </TabsContent>
              </Tabs>
      </div>
    </DashboardLayout>
  )
}
