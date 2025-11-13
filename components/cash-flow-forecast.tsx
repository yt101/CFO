"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, DollarSign, Calendar, Target } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts"

const mockCashFlowData = [
  { week: "W1", projected: 2.8, actual: 2.9, target: 3.0 },
  { week: "W2", projected: 3.1, actual: 3.0, target: 3.2 },
  { week: "W3", projected: 3.3, actual: 3.2, target: 3.4 },
  { week: "W4", projected: 3.2, actual: 3.1, target: 3.3 },
  { week: "W5", projected: 3.4, actual: 3.3, target: 3.5 },
  { week: "W6", projected: 3.6, actual: 3.5, target: 3.7 },
  { week: "W7", projected: 3.5, actual: 3.4, target: 3.6 },
  { week: "W8", projected: 3.7, actual: 3.6, target: 3.8 },
  { week: "W9", projected: 3.9, actual: 3.8, target: 4.0 },
  { week: "W10", projected: 3.8, actual: 3.7, target: 3.9 },
  { week: "W11", projected: 4.0, actual: 3.9, target: 4.1 },
  { week: "W12", projected: 4.2, actual: 4.1, target: 4.3 },
  { week: "W13", projected: 4.4, actual: 4.3, target: 4.5 },
]

const mockInflowOutflowData = [
  { category: "Total Inflow", amount: 5.78, color: "#10b981" },
  { category: "Total Outflow", amount: 4.50, color: "#ef4444" },
  { category: "Net Cash Flow", amount: 1.28, color: "#3b82f6" },
]

export function CashFlowForecast() {
  const currentWeek = mockCashFlowData[mockCashFlowData.length - 1]
  const projectedCash = currentWeek.projected
  const totalInflow = 5.78
  const totalOutflow = 4.50
  const netFlow = totalInflow - totalOutflow

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projected Cash (W13)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${projectedCash.toFixed(2)}M</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="mr-1 h-3 w-3" />
              +12.5% vs target
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inflow (13W)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+${totalInflow.toFixed(2)}M</div>
            <p className="text-xs text-muted-foreground">Expected receipts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Outflow (13W)</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">-${totalOutflow.toFixed(2)}M</div>
            <p className="text-xs text-muted-foreground">Expected payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Cash Flow</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">+${netFlow.toFixed(2)}M</div>
            <p className="text-xs text-muted-foreground">13-week projection</p>
          </CardContent>
        </Card>
      </div>

      {/* Cash Flow Chart */}
      <Card>
        <CardHeader>
          <CardTitle>13-Week Cash Flow Projection</CardTitle>
          <CardDescription>AI-powered forecasting with confidence intervals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockCashFlowData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [`$${value}M`, name]}
                  labelFormatter={(label) => `Week ${label}`}
                />
                <Area 
                  type="monotone" 
                  dataKey="target" 
                  stackId="1" 
                  stroke="#e5e7eb" 
                  fill="#f3f4f6" 
                  name="Target"
                />
                <Area 
                  type="monotone" 
                  dataKey="projected" 
                  stackId="2" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.6}
                  name="Projected"
                />
                <Line 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  name="Actual"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Inflow/Outflow Breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Cash Flow Breakdown</CardTitle>
            <CardDescription>13-week inflow and outflow analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockInflowOutflowData.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{item.category}</span>
                    <span className="font-bold" style={{ color: item.color }}>
                      ${item.amount.toFixed(2)}M
                    </span>
                  </div>
                  <Progress 
                    value={(item.amount / Math.max(...mockInflowOutflowData.map(d => d.amount))) * 100} 
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Insights</CardTitle>
            <CardDescription>Key observations and recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-900">Positive Trend</p>
                    <p className="text-xs text-green-800">
                      Cash flow is trending upward with 94% confidence. Projected to exceed target by Q2.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Peak Season</p>
                    <p className="text-xs text-blue-800">
                      Weeks 8-12 show highest cash generation. Consider accelerating collections during this period.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Target className="h-4 w-4 text-orange-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-orange-900">Optimization</p>
                    <p className="text-xs text-orange-800">
                      Implementing receivables optimization could increase projected cash by $420K.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

