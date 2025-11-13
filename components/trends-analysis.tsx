"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, TrendingDown, BarChart3, Target, Lightbulb } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"

const mockTrendData = [
  { period: "Q1 2023", dso: 45, dpo: 32, dio: 55, ccc: 68 },
  { period: "Q2 2023", dso: 42, dpo: 35, dio: 52, ccc: 59 },
  { period: "Q3 2023", dso: 38, dpo: 38, dio: 48, ccc: 48 },
  { period: "Q4 2023", dso: 35, dpo: 40, dio: 45, ccc: 40 },
  { period: "Q1 2024", dso: 32, dpo: 42, dio: 42, ccc: 32 },
]

const mockBenchmarkData = [
  { metric: "DSO", current: 32, target: 30, industry: 35 },
  { metric: "DPO", current: 42, target: 45, industry: 38 },
  { metric: "DIO", current: 42, target: 40, industry: 45 },
  { metric: "CCC", current: 32, target: 35, industry: 42 },
]

const mockAIInsights = [
  {
    title: "Collections Efficiency Improving",
    confidence: 94,
    impact: "$2.3M",
    status: "on-track",
    description: "Automated follow-up sequences and customer segmentation reduced DSO by 2.8 days over 13 weeks. AI predicts continued improvement to 35-day target by Q2.",
    recommendation: "Expand automated collections to mid-tier customers"
  },
  {
    title: "Inventory Optimization Opportunity",
    confidence: 87,
    impact: "$420K",
    status: "opportunity",
    description: "Current DIO of 42 days exceeds industry average. Implementing just-in-time inventory could reduce holding costs by 15%.",
    recommendation: "Implement demand forecasting system"
  },
  {
    title: "Payment Terms Negotiation",
    confidence: 76,
    impact: "$180K",
    status: "opportunity",
    description: "Current DPO of 42 days is below target. Negotiating extended payment terms with key suppliers could improve cash flow.",
    recommendation: "Renegotiate payment terms with top 5 suppliers"
  }
]

export function TrendsAnalysis() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="trends" className="space-y-6">
        <TabsList>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>DSO Trend Analysis</CardTitle>
              <CardDescription>Historical performance with forecasting and target benchmarks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="dso" stroke="#8884d8" strokeWidth={2} name="DSO" />
                    <Line type="monotone" dataKey="dpo" stroke="#82ca9d" strokeWidth={2} name="DPO" />
                    <Line type="monotone" dataKey="dio" stroke="#ffc658" strokeWidth={2} name="DIO" />
                    <Line type="monotone" dataKey="ccc" stroke="#ff7300" strokeWidth={2} name="CCC" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benchmarks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Benchmarks</CardTitle>
              <CardDescription>Compare your metrics against targets and industry standards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockBenchmarkData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="metric" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="current" fill="#8884d8" name="Current" />
                    <Bar dataKey="target" fill="#82ca9d" name="Target" />
                    <Bar dataKey="industry" fill="#ffc658" name="Industry" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI-Generated Insights</CardTitle>
              <CardDescription>Intelligent analysis and recommendations for the selected metric</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAIInsights.map((insight, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4 className="font-semibold">{insight.title}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant={insight.status === "on-track" ? "default" : "secondary"}>
                            {insight.confidence}% confidence
                          </Badge>
                          <Badge variant="outline">
                            {insight.impact} impact
                          </Badge>
                          <Badge variant={insight.status === "on-track" ? "default" : "secondary"}>
                            {insight.status}
                          </Badge>
                        </div>
                      </div>
                      <Lightbulb className="h-5 w-5 text-yellow-500" />
                    </div>
                    
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <Target className="h-4 w-4 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-blue-900">AI Recommendation:</p>
                          <p className="text-sm text-blue-800">{insight.recommendation}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                      <Button size="sm">
                        Implement
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

