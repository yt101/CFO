"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Target, 
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  RefreshCw,
  Download
} from "lucide-react"

export default function CashManagementPage() {
  const [activeTab, setActiveTab] = useState("runway")
  const [runwayData, setRunwayData] = useState({
    weeks: 18,
    current_cash: 1200000,
    monthly_burn: 150000,
    assumptions: [
      "Current burn rate maintained",
      "No new funding rounds",
      "Revenue growth at 15% monthly"
    ]
  })

  const [optimizationRecommendations, setOptimizationRecommendations] = useState([
    {
      action: "Accelerate AR Collection",
      expected_impact: 180000,
      effort: "Medium",
      timeline: "30 days",
      description: "Implement automated AR follow-up and early payment discounts"
    },
    {
      action: "Extend AP Terms",
      expected_impact: 75000,
      effort: "Low",
      timeline: "14 days", 
      description: "Negotiate extended payment terms with key suppliers"
    },
    {
      action: "Reduce Inventory Levels",
      expected_impact: 120000,
      effort: "High",
      timeline: "60 days",
      description: "Implement just-in-time inventory management"
    }
  ])

  const [cashFlowData, setCashFlowData] = useState([
    { period: "Jan 2025", cash_in: 850000, cash_out: 720000, net_cash: 130000, balance: 1200000 },
    { period: "Feb 2025", cash_in: 920000, cash_out: 780000, net_cash: 140000, balance: 1340000 },
    { period: "Mar 2025", cash_in: 980000, cash_out: 820000, net_cash: 160000, balance: 1500000 },
    { period: "Apr 2025", cash_in: 1050000, cash_out: 880000, net_cash: 170000, balance: 1670000 }
  ])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getRunwayColor = (weeks: number) => {
    if (weeks < 12) return "text-red-600"
    if (weeks < 24) return "text-yellow-600"
    return "text-green-600"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cash Management</h1>
          <p className="text-muted-foreground">
            AI-powered cash flow optimization and runway analysis
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash Runway</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getRunwayColor(runwayData.weeks)}`}>
              {runwayData.weeks} weeks
            </div>
            <p className="text-xs text-muted-foreground">
              Based on current burn rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Cash</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(runwayData.current_cash)}
            </div>
            <p className="text-xs text-muted-foreground">
              Available liquidity
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Burn</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(runwayData.monthly_burn)}
            </div>
            <p className="text-xs text-muted-foreground">
              Average monthly outflow
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="runway">Runway Analysis</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
          <TabsTrigger value="forecast">Cash Flow Forecast</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="runway" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Runway Assumptions</CardTitle>
                <CardDescription>
                  Key assumptions used in runway calculation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {runwayData.assumptions.map((assumption, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{assumption}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Runway Scenarios</CardTitle>
                <CardDescription>
                  How different scenarios affect cash runway
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">Current Scenario</div>
                      <div className="text-sm text-muted-foreground">No changes</div>
                    </div>
                    <Badge variant="outline" className={getRunwayColor(runwayData.weeks)}>
                      {runwayData.weeks} weeks
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">Optimistic</div>
                      <div className="text-sm text-muted-foreground">+20% revenue growth</div>
                    </div>
                    <Badge variant="outline" className="text-green-600">
                      24 weeks
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">Conservative</div>
                      <div className="text-sm text-muted-foreground">-10% revenue decline</div>
                    </div>
                    <Badge variant="outline" className="text-red-600">
                      12 weeks
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Working Capital Optimization</CardTitle>
              <CardDescription>
                AI-generated recommendations to improve cash position
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {optimizationRecommendations.map((rec, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{rec.action}</h4>
                        <p className="text-sm text-muted-foreground">{rec.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-green-600">
                          +{formatCurrency(rec.expected_impact)}
                        </div>
                        <div className="text-xs text-muted-foreground">Expected Impact</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Target className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Effort: {rec.effort}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Timeline: {rec.timeline}</span>
                        </div>
                      </div>
                      <Button size="sm">
                        Implement
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecast" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cash Flow Forecast</CardTitle>
              <CardDescription>
                Monthly cash flow projections based on current trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Period</th>
                      <th className="text-right py-2">Cash In</th>
                      <th className="text-right py-2">Cash Out</th>
                      <th className="text-right py-2">Net Cash</th>
                      <th className="text-right py-2">Ending Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cashFlowData.map((period, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2 font-medium">{period.period}</td>
                        <td className="text-right py-2 text-green-600">
                          {formatCurrency(period.cash_in)}
                        </td>
                        <td className="text-right py-2 text-red-600">
                          {formatCurrency(period.cash_out)}
                        </td>
                        <td className={`text-right py-2 font-semibold ${
                          period.net_cash > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(period.net_cash)}
                        </td>
                        <td className="text-right py-2 font-semibold">
                          {formatCurrency(period.balance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Cash Flow Trends</CardTitle>
                <CardDescription>
                  AI analysis of cash flow patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Revenue growth accelerating (+15% MoM)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-red-500" />
                    <span className="text-sm">Operating expenses increasing (+8% MoM)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">AR collection improving (+12% efficiency)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Alerts</CardTitle>
                <CardDescription>
                  Potential cash flow risks identified by AI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium">Seasonal Revenue Dip</div>
                      <div className="text-xs text-muted-foreground">
                        Q2 typically shows 20% revenue decline
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium">Large Customer Dependency</div>
                      <div className="text-xs text-muted-foreground">
                        40% of revenue from top 3 customers
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}













