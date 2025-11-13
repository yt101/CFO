"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  AlertCircle, 
  CheckCircle2, 
  Clock,
  Lightbulb,
  Brain
} from "lucide-react"

interface AIInsight {
  id: string
  title: string
  description: string
  confidence: number
  impact: number
  status: "on-track" | "at-risk" | "opportunity" | "completed"
  category: "collections" | "payables" | "inventory" | "forecast" | "optimization"
  recommendation: string
  action: string
  timeframe: string
}

const mockInsights: AIInsight[] = [
  {
    id: "1",
    title: "Collections Efficiency Improving",
    description: "Automated follow-up sequences and customer segmentation reduced DSO by 2.8 days over 13 weeks. AI predicts continued improvement to 35-day target by Q2.",
    confidence: 94,
    impact: 2300000,
    status: "on-track",
    category: "collections",
    recommendation: "Expand automated collections to mid-tier customers",
    action: "Implement Collection Workflow",
    timeframe: "30 days"
  },
  {
    id: "2",
    title: "Payables Extension Opportunity",
    description: "Analysis of supplier payment terms reveals potential for $280K cash retention by extending terms with 12 strategic suppliers without damaging relationships.",
    confidence: 88,
    impact: 280000,
    status: "opportunity",
    category: "payables",
    recommendation: "Negotiate extended terms with top suppliers who offer flexibility",
    action: "Start Negotiations",
    timeframe: "45 days"
  },
  {
    id: "3",
    title: "Inventory Carrying Costs High",
    description: "Current DIO of 48.8 days is 18% above industry benchmark. Slow-moving inventory accounts for $350K in tied-up capital with holding costs of $2.1K/month.",
    confidence: 91,
    impact: 350000,
    status: "at-risk",
    category: "inventory",
    recommendation: "Implement JIT ordering for top 20 SKUs and liquidate slow-movers",
    action: "Optimize Inventory",
    timeframe: "60 days"
  },
  {
    id: "4",
    title: "Cash Forecast Accuracy Strong",
    description: "13-week rolling forecast maintains 94% accuracy. Variance analysis shows seasonal patterns are well-captured, providing reliable planning basis.",
    confidence: 96,
    impact: 0,
    status: "on-track",
    category: "forecast",
    recommendation: "Maintain current forecasting methodology and monitor weekly",
    action: "Continue Monitoring",
    timeframe: "Ongoing"
  },
  {
    id: "5",
    title: "Working Capital Optimization",
    description: "Coordinated optimization of receivables, payables, and inventory could release $1.15M in cash over next 90 days while maintaining operational efficiency.",
    confidence: 92,
    impact: 1150000,
    status: "opportunity",
    category: "optimization",
    recommendation: "Execute phased implementation starting with highest-confidence opportunities",
    action: "Create Implementation Plan",
    timeframe: "90 days"
  }
]

const getCategoryIcon = (category: AIInsight["category"]) => {
  switch (category) {
    case "collections":
      return <TrendingUp className="h-4 w-4" />
    case "payables":
      return <TrendingDown className="h-4 w-4" />
    case "inventory":
      return <Target className="h-4 w-4" />
    case "forecast":
      return <Clock className="h-4 w-4" />
    case "optimization":
      return <Lightbulb className="h-4 w-4" />
  }
}

const getStatusColor = (status: AIInsight["status"]) => {
  switch (status) {
    case "on-track":
      return "bg-green-50 border-green-200 text-green-900"
    case "at-risk":
      return "bg-red-50 border-red-200 text-red-900"
    case "opportunity":
      return "bg-blue-50 border-blue-200 text-blue-900"
    case "completed":
      return "bg-gray-50 border-gray-200 text-gray-900"
  }
}

const getStatusIcon = (status: AIInsight["status"]) => {
  switch (status) {
    case "on-track":
      return <CheckCircle2 className="h-4 w-4 text-green-600" />
    case "at-risk":
      return <AlertCircle className="h-4 w-4 text-red-600" />
    case "opportunity":
      return <Lightbulb className="h-4 w-4 text-blue-600" />
    case "completed":
      return <CheckCircle2 className="h-4 w-4 text-gray-600" />
  }
}

export function AIInsights() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Brain className="h-8 w-8 text-purple-600" />
            <div>
              <CardTitle className="text-2xl">AI-Generated Insights</CardTitle>
              <CardDescription>Intelligent analysis and recommendations for cash optimization</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-sm text-muted-foreground mb-1">Active Insights</div>
              <div className="text-2xl font-bold">{mockInsights.length}</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-sm text-muted-foreground mb-1">Avg Confidence</div>
              <div className="text-2xl font-bold">
                {Math.round(mockInsights.reduce((sum, i) => sum + i.confidence, 0) / mockInsights.length)}%
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-sm text-muted-foreground mb-1">Total Impact</div>
              <div className="text-2xl font-bold text-green-600">
                ${(mockInsights.reduce((sum, i) => sum + i.impact, 0) / 1000000).toFixed(2)}M
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-sm text-muted-foreground mb-1">On Track</div>
              <div className="text-2xl font-bold text-green-600">
                {mockInsights.filter(i => i.status === "on-track").length}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insights List */}
      <div className="space-y-4">
        {mockInsights.map((insight) => (
          <Card key={insight.id} className={`border-2 ${getStatusColor(insight.status)}`}>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getCategoryIcon(insight.category)}
                    <CardTitle className="text-lg">{insight.title}</CardTitle>
                    {getStatusIcon(insight.status)}
                  </div>
                  <CardDescription className="text-base">
                    {insight.description}
                  </CardDescription>
                </div>
                <div className="text-right flex-shrink-0">
                  <Badge variant="outline" className="mb-2">
                    {insight.confidence}% confidence
                  </Badge>
                  {insight.impact > 0 && (
                    <div className="text-lg font-bold text-green-600">
                      ${(insight.impact / 1000).toFixed(0)}K impact
                    </div>
                  )}
                  <Badge 
                    variant={insight.status === "on-track" ? "default" : insight.status === "opportunity" ? "secondary" : "destructive"}
                    className="mt-2"
                  >
                    {insight.status.replace("-", " ")}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-white/50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold mb-1">AI Recommendation:</p>
                      <p className="text-sm">{insight.recommendation}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Timeframe: {insight.timeframe}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                    <Button size="sm">
                      {insight.action}
                    </Button>
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































