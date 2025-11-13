"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, DollarSign, Clock, Target, ArrowRight } from "lucide-react"

const mockOpportunities = [
  {
    id: "receivables-opt",
    title: "Receivables Optimization",
    description: "Improve collection processes and reduce DSO",
    impact: 420000,
    confidence: 94,
    status: "high-priority",
    category: "Working Capital",
    timeline: "2-4 weeks",
    actions: [
      "Implement automated follow-up sequences",
      "Segment customers by payment behavior",
      "Offer early payment discounts"
    ]
  },
  {
    id: "payables-extension",
    title: "Payables Extension",
    description: "Negotiate extended payment terms with suppliers",
    impact: 280000,
    confidence: 87,
    status: "medium-priority",
    category: "Working Capital",
    timeline: "4-6 weeks",
    actions: [
      "Renegotiate terms with top 5 suppliers",
      "Implement dynamic discounting",
      "Optimize payment timing"
    ]
  },
  {
    id: "inventory-reduction",
    title: "Inventory Reduction",
    description: "Optimize inventory levels and reduce holding costs",
    impact: 350000,
    confidence: 76,
    status: "medium-priority",
    category: "Working Capital",
    timeline: "6-8 weeks",
    actions: [
      "Implement demand forecasting",
      "Optimize safety stock levels",
      "Improve supplier lead times"
    ]
  },
  {
    id: "tax-optimization",
    title: "Tax Optimization",
    description: "Maximize R&D tax credits and deductions",
    impact: 180000,
    confidence: 92,
    status: "high-priority",
    category: "Tax",
    timeline: "1-2 weeks",
    actions: [
      "Claim R&D tax credits",
      "Optimize depreciation timing",
      "Review deductible expenses"
    ]
  }
]

export function OpportunitiesOverview() {
  const totalImpact = mockOpportunities.reduce((sum, opp) => sum + opp.impact, 0)
  const highPriorityCount = mockOpportunities.filter(opp => opp.status === "high-priority").length

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Impact</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(totalImpact / 1000000).toFixed(1)}M</div>
            <p className="text-xs text-muted-foreground">Optimization potential</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{highPriorityCount}</div>
            <p className="text-xs text-muted-foreground">Opportunities</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(mockOpportunities.reduce((sum, opp) => sum + opp.confidence, 0) / mockOpportunities.length)}%
            </div>
            <p className="text-xs text-muted-foreground">AI confidence</p>
          </CardContent>
        </Card>
      </div>

      {/* Opportunities List */}
      <div className="space-y-4">
        {mockOpportunities.map((opportunity) => (
          <Card key={opportunity.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{opportunity.title}</CardTitle>
                  <CardDescription>{opportunity.description}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={opportunity.status === "high-priority" ? "destructive" : "secondary"}
                  >
                    {opportunity.status.replace("-", " ")}
                  </Badge>
                  <Badge variant="outline">{opportunity.category}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Impact and Confidence */}
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Impact</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      +${(opportunity.impact / 1000).toFixed(0)}K
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Confidence</span>
                    </div>
                    <div className="space-y-1">
                      <div className="text-2xl font-bold">{opportunity.confidence}%</div>
                      <Progress value={opportunity.confidence} className="h-2" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium">Timeline</span>
                    </div>
                    <div className="text-2xl font-bold">{opportunity.timeline}</div>
                  </div>
                </div>

                {/* Recommended Actions */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Recommended Actions:</h4>
                  <div className="space-y-1">
                    {opportunity.actions.map((action, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        {action}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button size="sm">
                    <Target className="mr-2 h-4 w-4" />
                    Implement
                  </Button>
                  <Button size="sm" variant="outline">
                    View Details
                    <ArrowRight className="ml-2 h-4 w-4" />
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

