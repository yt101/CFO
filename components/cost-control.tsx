"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  Calculator, 
  TrendingDown, 
  DollarSign, 
  Target,
  CheckCircle2,
  AlertCircle,
  Clock
} from "lucide-react"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from "recharts"

interface CostControlItem {
  category: string
  currentCost: number
  targetCost: number
  savings: number
  status: "implemented" | "in-progress" | "identified"
  processes: string[]
  priority: "high" | "medium" | "low"
}

const costControlData: CostControlItem[] = [
  {
    category: "Process Automation",
    currentCost: 125000,
    targetCost: 87500,
    savings: 37500,
    status: "in-progress",
    processes: [
      "Automated invoice processing",
      "Digital workflow management",
      "Self-service HR portal"
    ],
    priority: "high"
  },
  {
    category: "Vendor Management",
    currentCost: 89000,
    targetCost: 71200,
    savings: 17800,
    status: "identified",
    processes: [
      "Vendor consolidation",
      "Contract renegotiation",
      "Performance-based contracts"
    ],
    priority: "high"
  },
  {
    category: "Operational Efficiency",
    currentCost: 156000,
    targetCost: 132600,
    savings: 23400,
    status: "in-progress",
    processes: [
      "Lean process implementation",
      "Cross-training initiatives",
      "Performance metrics optimization"
    ],
    priority: "medium"
  },
  {
    category: "Technology Optimization",
    currentCost: 78000,
    targetCost: 66300,
    savings: 11700,
    status: "implemented",
    processes: [
      "Cloud migration completed",
      "Software license optimization",
      "IT infrastructure consolidation"
    ],
    priority: "medium"
  }
]

const trendData = [
  { month: "Jan", current: 448, target: 357 },
  { month: "Feb", current: 442, target: 357 },
  { month: "Mar", current: 435, target: 357 },
  { month: "Apr", current: 428, target: 357 },
  { month: "May", current: 420, target: 357 },
  { month: "Jun", current: 412, target: 357 }
]

export function CostControl() {
  const totalCurrentCost = costControlData.reduce((sum, item) => sum + item.currentCost, 0)
  const totalTargetCost = costControlData.reduce((sum, item) => sum + item.targetCost, 0)
  const totalSavings = costControlData.reduce((sum, item) => sum + item.savings, 0)
  const savingsPercentage = (totalSavings / totalCurrentCost) * 100

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Calculator className="h-8 w-8 text-blue-600" />
            <div>
              <CardTitle className="text-2xl">Cost Control & Process Optimization</CardTitle>
              <CardDescription>Optimize costs through process improvements and automation</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-sm text-muted-foreground mb-1">Current Annual Cost</div>
              <div className="text-2xl font-bold">${(totalCurrentCost / 1000).toFixed(0)}K</div>
              <div className="text-xs text-muted-foreground">Operational expenses</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-sm text-muted-foreground mb-1">Target Cost</div>
              <div className="text-2xl font-bold text-blue-600">${(totalTargetCost / 1000).toFixed(0)}K</div>
              <div className="text-xs text-muted-foreground">Optimized target</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-sm text-muted-foreground mb-1">Savings Potential</div>
              <div className="text-2xl font-bold text-green-600">${(totalSavings / 1000).toFixed(0)}K</div>
              <div className="text-xs text-muted-foreground">{savingsPercentage.toFixed(1)}% reduction</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-sm text-muted-foreground mb-1">Progress</div>
              <div className="text-2xl font-bold text-purple-600">65%</div>
              <div className="text-xs text-muted-foreground">Implementation complete</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Reduction Trends</CardTitle>
          <CardDescription>Monthly cost optimization progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `$${value}K`} />
                <Tooltip formatter={(value: number) => [`$${value}K`, ""]} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="current" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  name="Current Cost"
                />
                <Line 
                  type="monotone" 
                  dataKey="target" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Target Cost"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Cost Control Categories */}
      <div className="space-y-4">
        {costControlData.map((item, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {item.category}
                    <Badge 
                      variant={item.status === "implemented" ? "default" : item.status === "in-progress" ? "secondary" : "outline"}
                      className={item.status === "implemented" ? "bg-green-500" : ""}
                    >
                      {item.status.replace("-", " ")}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Priority: {item.priority} • Annual Impact: ${(item.savings / 1000).toFixed(0)}K
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Potential Savings</div>
                  <div className="text-2xl font-bold text-green-600">
                    ${(item.savings / 1000).toFixed(0)}K
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Cost Comparison */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Current Cost</div>
                    <div className="text-lg font-bold">${(item.currentCost / 1000).toFixed(0)}K</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Target Cost</div>
                    <div className="text-lg font-bold text-blue-600">${(item.targetCost / 1000).toFixed(0)}K</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>Cost Reduction Progress</span>
                    <span className="font-medium">
                      {item.status === "implemented" ? "100%" : 
                       item.status === "in-progress" ? "60%" : "10%"}
                    </span>
                  </div>
                  <Progress 
                    value={
                      item.status === "implemented" ? 100 : 
                      item.status === "in-progress" ? 60 : 10
                    }
                    className="h-2"
                  />
                </div>

                {/* Process List */}
                <div>
                  <h4 className="text-sm font-semibold mb-2">Key Processes:</h4>
                  <ul className="space-y-2">
                    {item.processes.map((process, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        {item.status === "implemented" ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        ) : item.status === "in-progress" ? (
                          <Clock className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        )}
                        <span>{process}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    View Details
                  </Button>
                  {item.status !== "implemented" && (
                    <Button size="sm" className="flex-1">
                      {item.status === "in-progress" ? "Continue Implementation" : "Start Implementation"}
                    </Button>
                  )}
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
            <Target className="h-6 w-6 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-green-900 mb-2">Optimization Summary</h4>
              <p className="text-sm text-green-800 mb-3">
                Through process optimization and automation, you can achieve <strong>${(totalSavings / 1000).toFixed(0)}K</strong> in annual savings.
                Focus on completing high-priority initiatives: Process Automation and Vendor Management for maximum impact.
                Current implementation is 65% complete with strong momentum.
              </p>
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                Create Implementation Roadmap
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}






























