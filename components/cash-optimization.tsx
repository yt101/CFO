"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, DollarSign, Target, ArrowUpRight, CheckCircle2, AlertCircle } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"

interface OptimizationOpportunity {
  category: string
  potential: number
  confidence: number
  status: "opportunity" | "in-progress" | "completed"
  impact: "high" | "medium" | "low"
  recommendations: string[]
  timeframe: string
}

const mockOptimizations: OptimizationOpportunity[] = [
  {
    category: "Receivables Optimization",
    potential: 420000,
    confidence: 94,
    status: "opportunity",
    impact: "high",
    recommendations: [
      "Implement automated follow-up sequences for overdue invoices",
      "Offer early payment discounts (2/10 net 30)",
      "Segment customers by payment behavior for targeted collections"
    ],
    timeframe: "30-60 days"
  },
  {
    category: "Payables Extension",
    potential: 280000,
    confidence: 88,
    status: "in-progress",
    impact: "medium",
    recommendations: [
      "Negotiate extended payment terms with top suppliers",
      "Optimize payment timing to match cash flow cycles",
      "Implement dynamic discounting programs"
    ],
    timeframe: "60-90 days"
  },
  {
    category: "Inventory Reduction",
    potential: 350000,
    confidence: 91,
    status: "opportunity",
    impact: "high",
    recommendations: [
      "Implement just-in-time inventory management",
      "Reduce slow-moving inventory by 40%",
      "Optimize reorder points based on demand forecasting"
    ],
    timeframe: "90-120 days"
  }
]

const chartData = mockOptimizations.map(opt => ({
  name: opt.category.replace(" ", "\n"),
  value: opt.potential / 1000,
  confidence: opt.confidence,
  color: opt.impact === "high" ? "#10b981" : opt.impact === "medium" ? "#f59e0b" : "#6b7280"
}))

export function CashOptimization() {
  const totalPotential = mockOptimizations.reduce((sum, opt) => sum + opt.potential, 0)
  const avgConfidence = mockOptimizations.reduce((sum, opt) => sum + opt.confidence, 0) / mockOptimizations.length

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Cash Release Potential</CardTitle>
              <CardDescription>Optimization opportunities by working capital component</CardDescription>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-blue-600">
                ${(totalPotential / 1000).toFixed(0)}K
              </div>
              <div className="text-sm text-muted-foreground">Total Potential</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {mockOptimizations.map((opt, index) => (
              <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{opt.category}</span>
                  <Badge 
                    variant={opt.impact === "high" ? "default" : "secondary"}
                    className={opt.impact === "high" ? "bg-green-500" : ""}
                  >
                    {opt.impact}
                  </Badge>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  +${(opt.potential / 1000).toFixed(0)}K
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Progress value={opt.confidence} className="h-2 flex-1" />
                  <span className="text-xs text-muted-foreground">{opt.confidence}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Optimization Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Cash Release Opportunities</CardTitle>
          <CardDescription>Potential cash impact by optimization category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  interval={0}
                  angle={0}
                />
                <YAxis 
                  label={{ value: 'Potential ($K)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  formatter={(value, name) => [
                    name === "value" ? `$${value}K` : `${value}%`,
                    name === "value" ? "Potential" : "Confidence"
                  ]}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Opportunities */}
      <div className="grid gap-6 md:grid-cols-1">
        {mockOptimizations.map((opt, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {opt.category}
                    {opt.status === "completed" && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                    {opt.status === "in-progress" && <AlertCircle className="h-5 w-5 text-orange-500" />}
                  </CardTitle>
                  <CardDescription>
                    {opt.confidence}% confidence • {opt.timeframe} implementation
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    +${(opt.potential / 1000).toFixed(0)}K
                  </div>
                  <Badge 
                    variant={opt.status === "completed" ? "default" : opt.status === "in-progress" ? "secondary" : "outline"}
                  >
                    {opt.status.replace("-", " ")}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold mb-2">AI Recommendations:</h4>
                  <ul className="space-y-2">
                    {opt.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <ArrowUpRight className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1">
                    View Details
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    Implement
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}































