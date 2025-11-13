"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Target, TrendingUp, TrendingDown, Award } from "lucide-react"
import { 
  RadarChart, 
  Radar, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from "recharts"

interface BenchmarkMetric {
  name: string
  yourValue: number
  industryMedian: number
  topQuartile: number
  target: number
  unit: string
  trend: "positive" | "negative"
  performance: "excellent" | "good" | "average" | "below-average"
}

const benchmarkData: BenchmarkMetric[] = [
  {
    name: "Days Sales Outstanding",
    yourValue: 32,
    industryMedian: 38.5,
    topQuartile: 28,
    target: 35,
    unit: "days",
    trend: "negative",
    performance: "good"
  },
  {
    name: "Days Payable Outstanding",
    yourValue: 28,
    industryMedian: 30.1,
    topQuartile: 35,
    target: 32,
    unit: "days",
    trend: "positive",
    performance: "average"
  },
  {
    name: "Days Inventory Outstanding",
    yourValue: 45,
    industryMedian: 62.3,
    topQuartile: 48,
    target: 55,
    unit: "days",
    trend: "negative",
    performance: "excellent"
  },
  {
    name: "Cash Conversion Cycle",
    yourValue: 49,
    industryMedian: 70.7,
    topQuartile: 41,
    target: 58,
    unit: "days",
    trend: "negative",
    performance: "good"
  },
  {
    name: "Current Ratio",
    yourValue: 2.1,
    industryMedian: 1.8,
    topQuartile: 2.5,
    target: 2.0,
    unit: "ratio",
    trend: "positive",
    performance: "good"
  },
  {
    name: "Quick Ratio",
    yourValue: 1.8,
    industryMedian: 1.4,
    topQuartile: 2.0,
    target: 1.5,
    unit: "ratio",
    trend: "positive",
    performance: "excellent"
  }
]

const radarData = benchmarkData.map(metric => ({
  metric: metric.name.replace(" ", "\n"),
  you: (metric.yourValue / metric.industryMedian) * 100,
  industry: 100,
  topQuartile: (metric.topQuartile / metric.industryMedian) * 100
}))

const getPerformanceColor = (performance: BenchmarkMetric["performance"]) => {
  switch (performance) {
    case "excellent":
      return "#10b981"
    case "good":
      return "#3b82f6"
    case "average":
      return "#f59e0b"
    case "below-average":
      return "#ef4444"
  }
}

const getPerformanceLabel = (performance: BenchmarkMetric["performance"]) => {
  switch (performance) {
    case "excellent":
      return "Top Quartile"
    case "good":
      return "Above Average"
    case "average":
      return "Average"
    case "below-average":
      return "Below Average"
  }
}

export function Benchmarking() {
  const excellentCount = benchmarkData.filter(m => m.performance === "excellent").length
  const goodCount = benchmarkData.filter(m => m.performance === "good").length
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Award className="h-8 w-8 text-amber-600" />
            <div>
              <CardTitle className="text-2xl">Industry Benchmarking</CardTitle>
              <CardDescription>Compare your performance against industry standards</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-sm text-muted-foreground mb-1">Overall Score</div>
              <div className="text-2xl font-bold text-green-600">87/100</div>
              <Badge variant="default" className="mt-2 bg-green-500">Excellent</Badge>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-sm text-muted-foreground mb-1">Top Quartile</div>
              <div className="text-2xl font-bold">{excellentCount}/{benchmarkData.length}</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-sm text-muted-foreground mb-1">Above Average</div>
              <div className="text-2xl font-bold text-blue-600">{goodCount}/{benchmarkData.length}</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-sm text-muted-foreground mb-1">Industry Rank</div>
              <div className="text-2xl font-bold text-amber-600">Top 15%</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Radar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Radar</CardTitle>
          <CardDescription>Your metrics vs. industry benchmarks (indexed to 100)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis 
                  dataKey="metric" 
                  tick={{ fontSize: 11 }}
                />
                <PolarRadiusAxis angle={90} domain={[0, 150]} />
                <Radar 
                  name="Your Performance" 
                  dataKey="you" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.6} 
                />
                <Radar 
                  name="Industry Median" 
                  dataKey="industry" 
                  stroke="#94a3b8" 
                  fill="#94a3b8" 
                  fillOpacity={0.3} 
                />
                <Radar 
                  name="Top Quartile" 
                  dataKey="topQuartile" 
                  stroke="#10b981" 
                  fill="#10b981" 
                  fillOpacity={0.3} 
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Metrics */}
      <div className="grid gap-6 md:grid-cols-2">
        {benchmarkData.map((metric, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{metric.name}</CardTitle>
                  <CardDescription>
                    {metric.trend === "negative" ? "Lower is better" : "Higher is better"}
                  </CardDescription>
                </div>
                <Badge 
                  style={{ backgroundColor: getPerformanceColor(metric.performance) }}
                  className="text-white"
                >
                  {getPerformanceLabel(metric.performance)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Your Value */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Your Value</span>
                    <span className="text-lg font-bold" style={{ color: getPerformanceColor(metric.performance) }}>
                      {metric.yourValue} {metric.unit}
                    </span>
                  </div>
                </div>

                {/* Comparison Bars */}
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Target</span>
                      <span className="font-medium">{metric.target} {metric.unit}</span>
                    </div>
                    <Progress 
                      value={metric.trend === "negative" 
                        ? Math.max(0, 100 - ((metric.yourValue - metric.target) / metric.target * 100))
                        : Math.min(100, (metric.yourValue / metric.target) * 100)
                      }
                      className="h-2"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Industry Median</span>
                      <span className="font-medium">{metric.industryMedian} {metric.unit}</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-2 bg-gray-400 rounded-full"
                        style={{ width: "100%" }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Top Quartile</span>
                      <span className="font-medium">{metric.topQuartile} {metric.unit}</span>
                    </div>
                    <div className="h-2 bg-green-200 rounded-full">
                      <div 
                        className="h-2 bg-green-500 rounded-full"
                        style={{ width: "100%" }}
                      />
                    </div>
                  </div>
                </div>

                {/* Gap Analysis */}
                <div className="pt-2 border-t">
                  <div className="flex items-center gap-2 text-sm">
                    {metric.performance === "excellent" || metric.performance === "good" ? (
                      <>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-green-600">
                          {Math.abs(Math.round(((metric.yourValue - metric.industryMedian) / metric.industryMedian) * 100))}% 
                          {metric.trend === "negative" ? " better" : " higher"} than industry
                        </span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="h-4 w-4 text-orange-600" />
                        <span className="text-orange-600">
                          {Math.abs(Math.round(((metric.yourValue - metric.target) / metric.target) * 100))}% 
                          {metric.trend === "negative" ? " above" : " below"} target
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}































