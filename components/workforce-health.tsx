"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  TrendingUp, 
  Heart, 
  Shield, 
  Users,
  DollarSign,
  Target,
  Activity,
  Brain
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
  RadialBarChart,
  RadialBar,
  PieChart,
  Pie,
  Cell
} from "recharts"

interface HealthMetric {
  category: string
  score: number
  target: number
  roiImpact: number
  initiatives: string[]
  status: "excellent" | "good" | "needs-attention"
}

const healthMetrics: HealthMetric[] = [
  {
    category: "Physical Wellness",
    score: 78,
    target: 85,
    roiImpact: 125000,
    initiatives: [
      "On-site fitness facility",
      "Health screenings program",
      "Ergonomic workplace setup"
    ],
    status: "good"
  },
  {
    category: "Mental Health",
    score: 82,
    target: 88,
    roiImpact: 185000,
    initiatives: [
      "Employee assistance program",
      "Stress management workshops",
      "Mindfulness training"
    ],
    status: "good"
  },
  {
    category: "Work-Life Balance",
    score: 85,
    target: 90,
    roiImpact: 165000,
    initiatives: [
      "Flexible working arrangements",
      "Unlimited PTO policy",
      "Remote work options"
    ],
    status: "excellent"
  },
  {
    category: "Career Development",
    score: 73,
    target: 85,
    roiImpact: 220000,
    initiatives: [
      "Skill development programs",
      "Leadership training",
      "Mentorship program"
    ],
    status: "needs-attention"
  },
  {
    category: "Compensation & Benefits",
    score: 88,
    target: 90,
    roiImpact: 95000,
    initiatives: [
      "Competitive salary benchmarking",
      "Comprehensive health insurance",
      "Retirement planning support"
    ],
    status: "excellent"
  }
]

const roiTrendData = [
  { year: "2020", investment: 450, return: 620 },
  { year: "2021", investment: 520, return: 780 },
  { year: "2022", investment: 580, return: 920 },
  { year: "2023", investment: 650, return: 1150 },
  { year: "2024", investment: 720, return: 1320 }
]

const healthScoreData = healthMetrics.map(metric => ({
  name: metric.category.split(' ')[0],
  score: metric.score,
  target: metric.target,
  fill: metric.status === "excellent" ? "#10b981" : 
        metric.status === "good" ? "#3b82f6" : "#f59e0b"
}))

const riskFactors = [
  { name: "Burnout Risk", value: 15, color: "#ef4444" },
  { name: "Low Engagement", value: 12, color: "#f59e0b" },
  { name: "Skills Gap", value: 18, color: "#8b5cf6" },
  { name: "Retention Risk", value: 8, color: "#06b6d4" }
]

export function WorkforceHealth() {
  const avgHealthScore = healthMetrics.reduce((sum, metric) => sum + metric.score, 0) / healthMetrics.length
  const totalROI = healthMetrics.reduce((sum, metric) => sum + metric.roiImpact, 0)
  const currentInvestment = roiTrendData[roiTrendData.length - 1].investment
  const currentReturn = roiTrendData[roiTrendData.length - 1].return
  const roiMultiplier = currentReturn / currentInvestment

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-green-50 to-teal-50 border-green-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Heart className="h-8 w-8 text-green-600" />
            <div>
              <CardTitle className="text-2xl">Long-Term Workforce Health & ROI</CardTitle>
              <CardDescription>Sustainable workforce strategies with measurable returns</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-sm text-muted-foreground mb-1">Health Score</div>
              <div className="text-2xl font-bold text-green-600">{avgHealthScore.toFixed(0)}/100</div>
              <div className="text-xs text-muted-foreground">Workforce wellness index</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-sm text-muted-foreground mb-1">ROI Multiple</div>
              <div className="text-2xl font-bold text-blue-600">{roiMultiplier.toFixed(1)}x</div>
              <div className="text-xs text-green-600">Return on investment</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-sm text-muted-foreground mb-1">Annual ROI</div>
              <div className="text-2xl font-bold text-purple-600">${(totalROI / 1000).toFixed(0)}K</div>
              <div className="text-xs text-muted-foreground">Productivity gains</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-sm text-muted-foreground mb-1">Risk Level</div>
              <div className="text-2xl font-bold text-orange-600">Low</div>
              <div className="text-xs text-muted-foreground">Workforce stability</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* ROI Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Workforce Investment ROI</CardTitle>
            <CardDescription>Investment vs. returns over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={roiTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis tickFormatter={(value) => `$${value}K`} />
                  <Tooltip formatter={(value: number) => [`$${value}K`, ""]} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="investment" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    name="Investment"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="return" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    name="Returns"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Health Scores */}
        <Card>
          <CardHeader>
            <CardTitle>Workforce Health Scores</CardTitle>
            <CardDescription>Current vs. target health metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={healthScoreData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="score" name="Current Score" radius={[4, 4, 0, 0]}>
                    {healthScoreData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                  <Bar dataKey="target" fill="#e5e7eb" name="Target" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Health Metrics Detail */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Health & ROI Analysis by Category</h3>
        {healthMetrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {metric.category}
                    <Badge 
                      variant={metric.status === "excellent" ? "default" : metric.status === "good" ? "secondary" : "destructive"}
                      className={metric.status === "excellent" ? "bg-green-500" : ""}
                    >
                      {metric.status.replace("-", " ")}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Score: {metric.score}/100 • Target: {metric.target}/100
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Annual ROI Impact</div>
                  <div className="text-2xl font-bold text-green-600">
                    ${(metric.roiImpact / 1000).toFixed(0)}K
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Progress to Target */}
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>Progress to Target</span>
                    <span className="font-medium">{((metric.score / metric.target) * 100).toFixed(0)}%</span>
                  </div>
                  <Progress 
                    value={(metric.score / metric.target) * 100}
                    className="h-3"
                  />
                </div>

                {/* Initiatives */}
                <div>
                  <h4 className="text-sm font-semibold mb-2">Active Initiatives:</h4>
                  <ul className="space-y-1">
                    {metric.initiatives.map((initiative, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <div className="h-2 w-2 bg-blue-500 rounded-full" />
                        <span>{initiative}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* ROI Breakdown */}
                <div className="pt-3 border-t">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Productivity Gain</div>
                      <div className="font-bold text-green-600">
                        ${(metric.roiImpact * 0.6 / 1000).toFixed(0)}K
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Retention Savings</div>
                      <div className="font-bold text-blue-600">
                        ${(metric.roiImpact * 0.25 / 1000).toFixed(0)}K
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Healthcare Savings</div>
                      <div className="font-bold text-purple-600">
                        ${(metric.roiImpact * 0.15 / 1000).toFixed(0)}K
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Risk Assessment */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Workforce Risk Factors</CardTitle>
            <CardDescription>Percentage of workforce at risk by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskFactors}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {riskFactors.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Long-term Health Projections</CardTitle>
            <CardDescription>5-year workforce wellness outlook</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-5 w-5 text-green-600" />
                <h4 className="font-semibold text-green-900">2025 Projections</h4>
              </div>
              <ul className="space-y-1 text-sm text-green-800">
                <li>• Health Score: 88/100 (+8 points)</li>
                <li>• ROI Multiple: 2.1x (+0.2x improvement)</li>
                <li>• Risk Reduction: 25% overall decrease</li>
              </ul>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-5 w-5 text-blue-600" />
                <h4 className="font-semibold text-blue-900">Strategic Focus Areas</h4>
              </div>
              <ul className="space-y-1 text-sm text-blue-800">
                <li>• Career Development (+12 point target)</li>
                <li>• Physical Wellness (+7 point target)</li>
                <li>• Skills Gap Mitigation (-10% risk)</li>
              </ul>
            </div>

            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-purple-600" />
                <h4 className="font-semibold text-purple-900">Investment Strategy</h4>
              </div>
              <ul className="space-y-1 text-sm text-purple-800">
                <li>• Maintain 15% annual investment growth</li>
                <li>• Focus on high-ROI wellness programs</li>
                <li>• Target 2.5x ROI by 2027</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="h-6 w-6 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">Workforce Health Strategy</h4>
              <p className="text-sm text-blue-800 mb-3">
                Your workforce health initiatives are generating a strong <strong>{roiMultiplier.toFixed(1)}x ROI</strong> 
                with total annual returns of <strong>${(totalROI / 1000).toFixed(0)}K</strong>. 
                Current health score of <strong>{avgHealthScore.toFixed(0)}/100</strong> is above industry benchmarks.
                Focus on Career Development programs for maximum impact on long-term retention and productivity.
              </p>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                Develop 5-Year Health Strategy
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}






























