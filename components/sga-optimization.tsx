"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  Briefcase, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Building, 
  Zap,
  ArrowRight,
  CheckCircle2
} from "lucide-react"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts"

interface SGACategory {
  category: string
  current: number
  target: number
  potential: number
  percentOfRevenue: number
  industryBenchmark: number
  initiatives: string[]
  priority: "high" | "medium" | "low"
}

const sgaData: SGACategory[] = [
  {
    category: "Sales & Marketing",
    current: 450000,
    target: 405000,
    potential: 45000,
    percentOfRevenue: 12.5,
    industryBenchmark: 11.2,
    initiatives: [
      "Shift to digital marketing channels (-$15K)",
      "Optimize sales territory coverage (-$18K)",
      "Renegotiate software subscriptions (-$12K)"
    ],
    priority: "high"
  },
  {
    category: "General & Administrative",
    current: 320000,
    target: 288000,
    potential: 32000,
    percentOfRevenue: 8.9,
    industryBenchmark: 8.0,
    initiatives: [
      "Automate AP/AR processes (-$12K)",
      "Reduce office space footprint (-$15K)",
      "Consolidate insurance policies (-$5K)"
    ],
    priority: "high"
  },
  {
    category: "Technology & IT",
    current: 180000,
    target: 165000,
    potential: 15000,
    percentOfRevenue: 5.0,
    industryBenchmark: 4.6,
    initiatives: [
      "Migrate to cloud infrastructure (-$8K)",
      "Consolidate SaaS applications (-$5K)",
      "Renegotiate telecom contracts (-$2K)"
    ],
    priority: "medium"
  },
  {
    category: "Professional Services",
    current: 150000,
    target: 135000,
    potential: 15000,
    percentOfRevenue: 4.2,
    industryBenchmark: 3.8,
    initiatives: [
      "Bring some functions in-house (-$10K)",
      "Negotiate retainer agreements (-$5K)"
    ],
    priority: "medium"
  },
  {
    category: "Facilities & Operations",
    current: 200000,
    target: 180000,
    potential: 20000,
    percentOfRevenue: 5.6,
    industryBenchmark: 5.0,
    initiatives: [
      "Implement energy efficiency measures (-$8K)",
      "Negotiate lease renewals (-$10K)",
      "Optimize maintenance contracts (-$2K)"
    ],
    priority: "low"
  }
]

const pieData = sgaData.map(item => ({
  name: item.category,
  value: item.current,
  potential: item.potential
}))

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444"]

export function SGAOptimization() {
  const totalCurrent = sgaData.reduce((sum, item) => sum + item.current, 0)
  const totalTarget = sgaData.reduce((sum, item) => sum + item.target, 0)
  const totalPotential = sgaData.reduce((sum, item) => sum + item.potential, 0)
  const avgPercentOfRevenue = sgaData.reduce((sum, item) => sum + item.percentOfRevenue, 0) / sgaData.length
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Briefcase className="h-8 w-8 text-indigo-600" />
            <div>
              <CardTitle className="text-2xl">SG&A Optimization</CardTitle>
              <CardDescription>Selling, General & Administrative expense analysis and optimization</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-sm text-muted-foreground mb-1">Current SG&A</div>
              <div className="text-2xl font-bold">${(totalCurrent / 1000).toFixed(0)}K</div>
              <div className="text-xs text-muted-foreground">{avgPercentOfRevenue.toFixed(1)}% of revenue</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-sm text-muted-foreground mb-1">Target SG&A</div>
              <div className="text-2xl font-bold text-blue-600">${(totalTarget / 1000).toFixed(0)}K</div>
              <div className="text-xs text-muted-foreground">Optimized target</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-sm text-muted-foreground mb-1">Savings Potential</div>
              <div className="text-2xl font-bold text-green-600">${(totalPotential / 1000).toFixed(0)}K</div>
              <div className="text-xs text-muted-foreground">{((totalPotential / totalCurrent) * 100).toFixed(1)}% reduction</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-sm text-muted-foreground mb-1">Implementation</div>
              <div className="text-2xl font-bold text-purple-600">60%</div>
              <div className="text-xs text-muted-foreground">Progress to target</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Current SG&A Distribution</CardTitle>
            <CardDescription>Breakdown by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `$${(value / 1000).toFixed(0)}K`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Optimization Potential</CardTitle>
            <CardDescription>Current vs. Target by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sgaData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="category" 
                    tick={{ fontSize: 11 }}
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis 
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                  />
                  <Tooltip 
                    formatter={(value: number) => `$${(value / 1000).toFixed(0)}K`}
                  />
                  <Legend />
                  <Bar dataKey="current" fill="#94a3b8" name="Current" />
                  <Bar dataKey="target" fill="#10b981" name="Target" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Category Cards */}
      <div className="space-y-4">
        {sgaData.map((category, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {category.category}
                    <Badge 
                      variant={category.priority === "high" ? "default" : category.priority === "medium" ? "secondary" : "outline"}
                      className={category.priority === "high" ? "bg-red-500" : ""}
                    >
                      {category.priority} priority
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {category.percentOfRevenue.toFixed(1)}% of revenue • Industry benchmark: {category.industryBenchmark.toFixed(1)}%
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Savings Potential</div>
                  <div className="text-2xl font-bold text-green-600">
                    ${(category.potential / 1000).toFixed(0)}K
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Progress Bar */}
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>Current: ${(category.current / 1000).toFixed(0)}K</span>
                    <span>Target: ${(category.target / 1000).toFixed(0)}K</span>
                  </div>
                  <Progress 
                    value={((category.current - category.target) / category.current) * 100}
                    className="h-3"
                  />
                </div>

                {/* Initiatives */}
                <div>
                  <h4 className="text-sm font-semibold mb-2">Optimization Initiatives:</h4>
                  <ul className="space-y-2">
                    {category.initiatives.map((initiative, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{initiative}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Benchmark Comparison */}
                <div className="pt-3 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-green-600" />
                      <span>
                        {category.percentOfRevenue > category.industryBenchmark ? (
                          <span className="text-orange-600">
                            {(category.percentOfRevenue - category.industryBenchmark).toFixed(1)}% above industry benchmark
                          </span>
                        ) : (
                          <span className="text-green-600">
                            {(category.industryBenchmark - category.percentOfRevenue).toFixed(1)}% below industry benchmark
                          </span>
                        )}
                      </span>
                    </div>
                    <Button size="sm">
                      View Details <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Card */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Zap className="h-6 w-6 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-green-900 mb-2">Quick Wins Available</h4>
              <p className="text-sm text-green-800 mb-3">
                Implementing high-priority initiatives could save <strong>${(totalPotential * 0.6 / 1000).toFixed(0)}K</strong> within 90 days.
                Focus on Sales & Marketing and G&A categories for maximum impact.
              </p>
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                Create Implementation Plan
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}































