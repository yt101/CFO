"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  Users, 
  TrendingUp, 
  Award, 
  Heart,
  Target,
  AlertTriangle,
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
  LineChart,
  Line,
  Legend,
  PieChart,
  Pie,
  Cell
} from "recharts"

interface TalentMetric {
  name: string
  current: number
  target: number
  benchmark: number
  unit: string
  trend: "up" | "down" | "stable"
}

const talentMetrics: TalentMetric[] = [
  {
    name: "Employee Retention Rate",
    current: 87.5,
    target: 90,
    benchmark: 85,
    unit: "%",
    trend: "up"
  },
  {
    name: "Employee Satisfaction",
    current: 8.2,
    target: 8.5,
    benchmark: 7.8,
    unit: "/10",
    trend: "up"
  },
  {
    name: "Time to Fill Positions",
    current: 28,
    target: 21,
    benchmark: 35,
    unit: "days",
    trend: "down"
  },
  {
    name: "Training Hours per Employee",
    current: 32,
    target: 40,
    benchmark: 25,
    unit: "hours",
    trend: "up"
  },
  {
    name: "Internal Promotion Rate",
    current: 68,
    target: 75,
    benchmark: 60,
    unit: "%",
    trend: "up"
  }
]

const productivityData = [
  { month: "Jan", productivity: 82, engagement: 78 },
  { month: "Feb", productivity: 84, engagement: 80 },
  { month: "Mar", productivity: 86, engagement: 82 },
  { month: "Apr", productivity: 88, engagement: 84 },
  { month: "May", productivity: 90, engagement: 86 },
  { month: "Jun", productivity: 92, engagement: 88 }
]

const retentionByDepartment = [
  { name: "Engineering", retention: 92, color: "#3b82f6" },
  { name: "Sales", retention: 85, color: "#10b981" },
  { name: "Marketing", retention: 88, color: "#f59e0b" },
  { name: "Operations", retention: 90, color: "#8b5cf6" },
  { name: "Finance", retention: 94, color: "#ef4444" }
]

export function TalentRetention() {
  const avgRetention = retentionByDepartment.reduce((sum, dept) => sum + dept.retention, 0) / retentionByDepartment.length
  const avgProductivity = productivityData[productivityData.length - 1].productivity
  const avgEngagement = productivityData[productivityData.length - 1].engagement

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-purple-600" />
            <div>
              <CardTitle className="text-2xl">Talent, Retention & Productivity</CardTitle>
              <CardDescription>Optimize workforce performance and employee satisfaction</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-sm text-muted-foreground mb-1">Retention Rate</div>
              <div className="text-2xl font-bold text-green-600">{avgRetention.toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground">Above industry benchmark</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-sm text-muted-foreground mb-1">Productivity Index</div>
              <div className="text-2xl font-bold text-blue-600">{avgProductivity}</div>
              <div className="text-xs text-green-600">+12% vs last year</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-sm text-muted-foreground mb-1">Engagement Score</div>
              <div className="text-2xl font-bold text-purple-600">{avgEngagement}</div>
              <div className="text-xs text-green-600">+8% improvement</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-sm text-muted-foreground mb-1">Cost Savings</div>
              <div className="text-2xl font-bold text-orange-600">$285K</div>
              <div className="text-xs text-muted-foreground">From retention improvements</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Productivity Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Productivity & Engagement Trends</CardTitle>
            <CardDescription>Monthly performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={productivityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="productivity" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    name="Productivity Index"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="engagement" 
                    stroke="#8b5cf6" 
                    strokeWidth={3}
                    name="Engagement Score"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Retention by Department */}
        <Card>
          <CardHeader>
            <CardTitle>Retention by Department</CardTitle>
            <CardDescription>Current retention rates across teams</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={retentionByDepartment}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[80, 100]} />
                  <Tooltip formatter={(value: number) => [`${value}%`, "Retention Rate"]} />
                  <Bar dataKey="retention" radius={[4, 4, 0, 0]}>
                    {retentionByDepartment.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {talentMetrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                {metric.name}
                {metric.trend === "up" ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : metric.trend === "down" ? (
                  <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />
                ) : (
                  <div className="h-4 w-4 bg-gray-400 rounded-full" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-end gap-2">
                  <div className="text-2xl font-bold">
                    {metric.current}{metric.unit}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Target: {metric.target}{metric.unit}
                  </div>
                </div>
                
                <Progress 
                  value={(metric.current / metric.target) * 100}
                  className="h-2"
                />
                
                <div className="text-sm">
                  <span className="text-muted-foreground">Industry: </span>
                  <span className="font-medium">{metric.benchmark}{metric.unit}</span>
                  {metric.current > metric.benchmark ? (
                    <Badge variant="default" className="ml-2 bg-green-500">Above</Badge>
                  ) : (
                    <Badge variant="secondary" className="ml-2">Below</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Initiatives */}
      <Card>
        <CardHeader>
          <CardTitle>Active Talent Initiatives</CardTitle>
          <CardDescription>Programs to improve retention and productivity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold flex items-center gap-2">
                    Professional Development Program
                    <Badge className="bg-blue-500">In Progress</Badge>
                  </h4>
                  <p className="text-sm text-muted-foreground">Comprehensive skill development and career pathing</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Expected Impact</div>
                  <div className="font-bold text-green-600">+5% retention</div>
                </div>
              </div>
              <Progress value={75} className="h-2 mb-2" />
              <div className="text-sm text-muted-foreground">75% implementation complete</div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold flex items-center gap-2">
                    Employee Wellness Initiative
                    <Badge className="bg-green-500">Completed</Badge>
                  </h4>
                  <p className="text-sm text-muted-foreground">Mental health support and work-life balance programs</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Achieved Impact</div>
                  <div className="font-bold text-green-600">+12% satisfaction</div>
                </div>
              </div>
              <Progress value={100} className="h-2 mb-2" />
              <div className="text-sm text-green-600 flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" />
                Successfully launched organization-wide
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold flex items-center gap-2">
                    Recognition & Rewards Platform
                    <Badge variant="outline">Planned</Badge>
                  </h4>
                  <p className="text-sm text-muted-foreground">Peer recognition system with performance bonuses</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Expected Impact</div>
                  <div className="font-bold text-purple-600">+8% engagement</div>
                </div>
              </div>
              <Progress value={25} className="h-2 mb-2" />
              <div className="text-sm text-muted-foreground">Planning phase - launch Q3</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Card */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Heart className="h-6 w-6 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-green-900 mb-2">Talent Success Summary</h4>
              <p className="text-sm text-green-800 mb-3">
                Your organization maintains <strong>{avgRetention.toFixed(1)}% retention</strong> (above industry benchmark) 
                with strong productivity growth of <strong>+12% year-over-year</strong>. 
                Current initiatives are projected to save <strong>$285K annually</strong> through reduced turnover costs.
                Focus on completing the Professional Development Program for maximum impact.
              </p>
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                View Detailed Analytics
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}






























