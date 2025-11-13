"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  Receipt, 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  FileText,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  ArrowRight
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

interface TaxOpportunity {
  id: string
  category: string
  opportunity: string
  description: string
  potentialSavings: number
  confidence: number
  status: "identified" | "in-review" | "implemented" | "claimed"
  deadline: string
  requirements: string[]
  priority: "critical" | "high" | "medium" | "low"
}

const taxOpportunities: TaxOpportunity[] = [
  {
    id: "1",
    category: "R&D Tax Credits",
    opportunity: "Software Development Activities",
    description: "Eligible R&D activities include new product development, algorithm improvements, and technical uncertainty resolution. Based on qualified wages and supplies.",
    potentialSavings: 127000,
    confidence: 92,
    status: "in-review",
    deadline: "2024-03-15",
    requirements: [
      "Document development activities and technical challenges",
      "Track employee time on qualifying projects",
      "Compile supply costs and contractor expenses"
    ],
    priority: "critical"
  },
  {
    id: "2",
    category: "R&D Tax Credits",
    opportunity: "Process Improvement Initiatives",
    description: "Manufacturing process optimization and efficiency improvements qualify for R&D credits. Substantial technical documentation available.",
    potentialSavings: 68000,
    confidence: 87,
    status: "identified",
    deadline: "2024-03-15",
    requirements: [
      "Gather process improvement documentation",
      "Identify qualifying personnel",
      "Calculate qualified research expenses"
    ],
    priority: "high"
  },
  {
    id: "3",
    category: "Section 179 Deduction",
    opportunity: "Equipment Purchases",
    description: "$245K in eligible equipment purchases can be immediately expensed under Section 179, improving cash flow through accelerated deductions.",
    potentialSavings: 51450,
    confidence: 98,
    status: "implemented",
    deadline: "2023-12-31",
    requirements: [
      "Verify equipment placed in service dates",
      "Ensure business use percentage >50%",
      "Complete Form 4562"
    ],
    priority: "high"
  },
  {
    id: "4",
    category: "Work Opportunity Tax Credit",
    opportunity: "Eligible New Hires",
    description: "12 new hires qualify for WOTC based on veteran status and long-term unemployment. Credits range from $2,400-$9,600 per employee.",
    potentialSavings: 43200,
    confidence: 95,
    status: "in-review",
    deadline: "2024-02-28",
    requirements: [
      "Submit Form 8850 within 28 days of hire",
      "Obtain signed IRS Form 9061",
      "Document eligibility criteria"
    ],
    priority: "critical"
  },
  {
    id: "5",
    category: "Bonus Depreciation",
    opportunity: "Qualified Property",
    description: "100% bonus depreciation available for qualified property placed in service. Includes machinery, equipment, and certain improvements.",
    potentialSavings: 35600,
    confidence: 96,
    status: "implemented",
    deadline: "2023-12-31",
    requirements: [
      "Verify original use or acquired property",
      "Confirm placed in service date",
      "Calculate qualified improvement property"
    ],
    priority: "medium"
  },
  {
    id: "6",
    category: "Energy Efficiency Credits",
    opportunity: "Commercial Building Improvements",
    description: "HVAC and lighting upgrades qualify for Section 179D deduction. Potential for $1.88/sq ft deduction based on energy efficiency gains.",
    potentialSavings: 28200,
    confidence: 83,
    status: "identified",
    deadline: "2024-12-31",
    requirements: [
      "Obtain energy efficiency certification",
      "Calculate building square footage",
      "Document improvement costs"
    ],
    priority: "medium"
  }
]

const taxPaymentSchedule = [
  { quarter: "Q1 2023", estimated: 45000, actual: 42000, optimized: 38000 },
  { quarter: "Q2 2023", estimated: 48000, actual: 47000, optimized: 41000 },
  { quarter: "Q3 2023", estimated: 50000, actual: 49000, optimized: 43000 },
  { quarter: "Q4 2023", estimated: 52000, actual: 51000, optimized: 44000 },
  { quarter: "Q1 2024", estimated: 55000, actual: null, optimized: 46000 },
  { quarter: "Q2 2024", estimated: 58000, actual: null, optimized: 48000 }
]

export function TaxOptimization() {
  const totalPotential = taxOpportunities.reduce((sum, opp) => sum + opp.potentialSavings, 0)
  const criticalCount = taxOpportunities.filter(o => o.priority === "critical").length
  const avgConfidence = taxOpportunities.reduce((sum, o) => sum + o.confidence, 0) / taxOpportunities.length
  const implementedSavings = taxOpportunities
    .filter(o => o.status === "implemented" || o.status === "claimed")
    .reduce((sum, o) => sum + o.potentialSavings, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Receipt className="h-8 w-8 text-emerald-600" />
            <div>
              <CardTitle className="text-2xl">Tax Optimization</CardTitle>
              <CardDescription>Identify and maximize tax savings opportunities</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-sm text-muted-foreground mb-1">Total Potential</div>
              <div className="text-2xl font-bold text-green-600">${(totalPotential / 1000).toFixed(0)}K</div>
              <div className="text-xs text-muted-foreground">Tax savings identified</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-sm text-muted-foreground mb-1">Realized Savings</div>
              <div className="text-2xl font-bold text-blue-600">${(implementedSavings / 1000).toFixed(0)}K</div>
              <div className="text-xs text-muted-foreground">{((implementedSavings / totalPotential) * 100).toFixed(0)}% captured</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-sm text-muted-foreground mb-1">Active Opportunities</div>
              <div className="text-2xl font-bold">{taxOpportunities.length}</div>
              <div className="text-xs text-red-600 font-medium">{criticalCount} critical</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-sm text-muted-foreground mb-1">Avg Confidence</div>
              <div className="text-2xl font-bold text-purple-600">{Math.round(avgConfidence)}%</div>
              <div className="text-xs text-muted-foreground">Probability of capture</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tax Payment Optimization */}
      <Card>
        <CardHeader>
          <CardTitle>Quarterly Tax Payment Optimization</CardTitle>
          <CardDescription>Estimated vs. actual vs. optimized payments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={taxPaymentSchedule}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="quarter" />
                <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(value: number) => `$${(value / 1000).toFixed(0)}K`} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="estimated" 
                  stroke="#94a3b8" 
                  strokeWidth={2}
                  name="Estimated"
                  strokeDasharray="5 5"
                />
                <Line 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Actual"
                />
                <Line 
                  type="monotone" 
                  dataKey="optimized" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Optimized"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Opportunities List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Tax Savings Opportunities</h3>
          <div className="flex gap-2">
            <Badge variant="destructive">{criticalCount} Critical</Badge>
            <Badge variant="secondary">
              {taxOpportunities.filter(o => o.priority === "high").length} High
            </Badge>
          </div>
        </div>

        {taxOpportunities.map((opportunity) => (
          <Card 
            key={opportunity.id}
            className={`border-l-4 ${
              opportunity.priority === "critical" 
                ? "border-l-red-500 bg-red-50/50" 
                : opportunity.priority === "high"
                ? "border-l-orange-500"
                : "border-l-blue-500"
            }`}
          >
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{opportunity.category}</Badge>
                    <CardTitle className="text-lg">{opportunity.opportunity}</CardTitle>
                  </div>
                  <CardDescription className="text-base">
                    {opportunity.description}
                  </CardDescription>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm text-muted-foreground mb-1">Potential Savings</div>
                  <div className="text-2xl font-bold text-green-600">
                    ${(opportunity.potentialSavings / 1000).toFixed(0)}K
                  </div>
                  <Badge 
                    variant={
                      opportunity.status === "implemented" || opportunity.status === "claimed"
                        ? "default"
                        : opportunity.status === "in-review"
                        ? "secondary"
                        : "outline"
                    }
                    className="mt-2"
                  >
                    {opportunity.status.replace("-", " ")}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Confidence & Deadline */}
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-amber-600" />
                    <span className="text-muted-foreground">Confidence:</span>
                    <span className="font-semibold">{opportunity.confidence}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span className="text-muted-foreground">Deadline:</span>
                    <span className="font-semibold">{new Date(opportunity.deadline).toLocaleDateString()}</span>
                  </div>
                  {opportunity.priority === "critical" && (
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="font-semibold">Time-Sensitive</span>
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Completion Progress</span>
                    <span className="font-medium">
                      {opportunity.status === "implemented" || opportunity.status === "claimed" ? "100%" : 
                       opportunity.status === "in-review" ? "60%" : "20%"}
                    </span>
                  </div>
                  <Progress 
                    value={
                      opportunity.status === "implemented" || opportunity.status === "claimed" ? 100 : 
                      opportunity.status === "in-review" ? 60 : 20
                    }
                    className="h-2"
                  />
                </div>

                {/* Requirements */}
                <div>
                  <h4 className="text-sm font-semibold mb-2">Requirements:</h4>
                  <ul className="space-y-2">
                    {opportunity.requirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <FileText className="h-3 w-3 mr-1" />
                    View Details
                  </Button>
                  {opportunity.status !== "implemented" && opportunity.status !== "claimed" && (
                    <Button size="sm" className="flex-1">
                      Take Action
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Card */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <TrendingUp className="h-6 w-6 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-green-900 mb-2">Next Steps</h4>
              <p className="text-sm text-green-800 mb-3">
                Focus on <strong>{criticalCount} critical opportunities</strong> with upcoming deadlines. 
                Potential to realize <strong>${((totalPotential - implementedSavings) / 1000).toFixed(0)}K</strong> in additional savings.
                Our AI has identified these opportunities with {Math.round(avgConfidence)}% confidence based on your tax returns and financial data.
              </p>
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                Schedule Tax Strategy Review
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}































