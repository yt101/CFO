"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FileUploadModal } from "./file-upload-modal"
import { AIChatAdvisor } from "./ai-chat-advisor"
import { ExportReportModal } from "./export-report-modal"
import {
  DollarSign,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle,
  FileText,
  Download,
  Upload,
  Calculator,
  Target,
  Lightbulb,
  Calendar,
  User,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Eye,
  Edit,
  Trash2,
  Plus,
  Filter,
  Search
} from "lucide-react"
import { Input } from "@/components/ui/input"
import PersonalTaxPlanning from "./personal-tax-planning"

interface TaxOptimizationDashboardProps {
  taxData: any
  userContext: any
}

export function TaxOptimizationDashboard({ taxData, userContext }: TaxOptimizationDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedAction, setSelectedAction] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const { companyProfile, scheduleL, ratios, optimizationActions, aiInsights } = taxData

  // Calculate summary metrics
  const totalPotentialSavings = optimizationActions.reduce((sum, action) => sum + action.benefit, 0)
  const completedActions = optimizationActions.filter(action => action.status === 'completed').length
  const pendingActions = optimizationActions.filter(action => action.status === 'pending').length
  const inProgressActions = optimizationActions.filter(action => action.status === 'in_progress').length

  // Filter actions based on search and status
  const filteredActions = optimizationActions.filter(action => {
    const matchesSearch = (action.finding?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                         (action.action?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                         (action.focusArea?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
    const matchesStatus = statusFilter === "all" || action.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'in_progress': return <Clock className="h-4 w-4 text-blue-600" />
      case 'pending': return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      default: return <Minus className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600'
    if (confidence >= 0.8) return 'text-blue-600'
    if (confidence >= 0.7) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getImpactColor = (impact: number) => {
    if (impact >= 0.8) return 'text-green-600'
    if (impact >= 0.6) return 'text-blue-600'
    if (impact >= 0.4) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI 1120 Tax Advisor</h1>
          <p className="text-muted-foreground">
            Intelligent tax optimization and working capital analysis for {companyProfile.entityType}
          </p>
        </div>
        <div className="flex gap-2">
          <FileUploadModal onUploadComplete={(files) => {
            console.log('Files uploaded:', files)
            // Handle file upload completion
          }} />
          <ExportReportModal taxData={taxData} />
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Potential Tax Savings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPotentialSavings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across {optimizationActions.length} opportunities
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash Conversion Cycle</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ratios.cashConversionCycle} days</div>
            <p className="text-xs text-muted-foreground">
              {ratios.cashConversionCycle > 60 ? "Above optimal" : "Within range"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Ratio</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ratios.currentRatio}</div>
            <p className="text-xs text-muted-foreground">
              {ratios.currentRatio > 2 ? "Strong liquidity" : "Monitor closely"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Action Progress</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedActions}/{optimizationActions.length}</div>
            <Progress value={(completedActions / optimizationActions.length) * 100} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="optimization">Optimization Tracker</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="financials">Financial Analysis</TabsTrigger>
          <TabsTrigger value="advisor">AI Advisor</TabsTrigger>
          <TabsTrigger value="personal">Personal Tax Planning</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Company Profile */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Company Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">EIN:</span>
                  <span className="font-medium">{companyProfile.ein}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Fiscal Year:</span>
                  <span className="font-medium">{companyProfile.fiscalYear}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Entity Type:</span>
                  <span className="font-medium">{companyProfile.entityType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Revenue Range:</span>
                  <span className="font-medium">{companyProfile.revenueRange}</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Action Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Completed</span>
                  </div>
                  <Badge variant="secondary">{completedActions}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">In Progress</span>
                  </div>
                  <Badge variant="secondary">{inProgressActions}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm">Pending</span>
                  </div>
                  <Badge variant="secondary">{pendingActions}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent AI Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Recent AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {aiInsights.slice(0, 3).map((insight) => (
                  <div key={insight.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold">{insight.title}</h4>
                      <div className="flex gap-2">
                        <Badge variant="outline" className={getConfidenceColor(insight.confidence)}>
                          {Math.round(insight.confidence * 100)}% confident
                        </Badge>
                        <Badge variant="outline" className={getImpactColor(insight.impact)}>
                          {Math.round(insight.impact * 100)}% impact
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                    <div className="text-xs text-muted-foreground">
                      <strong>Evidence:</strong> {insight.evidence}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Optimization Tracker Tab */}
        <TabsContent value="optimization" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Optimization Actions</h3>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search actions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setStatusFilter("all")}>All Status</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("pending")}>Pending</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("in_progress")}>In Progress</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("completed")}>Completed</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Action
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            {filteredActions.map((action) => (
              <Card key={action.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{action.focusArea}</Badge>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(action.status)}
                          <Badge className={getStatusColor(action.status)}>
                            {action.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      <h4 className="font-semibold">{action.finding}</h4>
                      <p className="text-sm text-muted-foreground">{action.action}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {action.assignedTo}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {action.dueDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          ${action.benefit.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          {Math.round(action.confidence * 100)}% confidence
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4">
            {aiInsights.map((insight) => (
              <Card key={insight.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5" />
                        {insight.title}
                      </CardTitle>
                      <CardDescription className="mt-2">{insight.description}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className={getConfidenceColor(insight.confidence)}>
                        {Math.round(insight.confidence * 100)}% confidence
                      </Badge>
                      <Badge variant="outline" className={getImpactColor(insight.impact)}>
                        {Math.round(insight.impact * 100)}% impact
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Supporting Evidence</h4>
                      <p className="text-sm text-muted-foreground">{insight.evidence}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-1">IRS References</h4>
                      <div className="flex gap-1 flex-wrap">
                        {insight.irsReferences.map((ref, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {ref}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button size="sm">Create Action Item</Button>
                      <Button variant="outline" size="sm">Learn More</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Financial Analysis Tab */}
        <TabsContent value="financials" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Liquidity Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Liquidity Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Current Ratio</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{ratios.currentRatio}</span>
                    {ratios.currentRatio > 2 ? (
                      <ArrowUpRight className="h-4 w-4 text-green-600" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Working Capital</span>
                  <span className="font-medium">${scheduleL.workingCapital.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Cash Conversion Cycle</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{ratios.cashConversionCycle} days</span>
                    {ratios.cashConversionCycle > 60 ? (
                      <ArrowUpRight className="h-4 w-4 text-red-600" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Working Capital Efficiency */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Working Capital Efficiency
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Days Sales Outstanding</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{ratios.dso} days</span>
                    {ratios.dso > 30 ? (
                      <ArrowUpRight className="h-4 w-4 text-red-600" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Days Payable Outstanding</span>
                  <span className="font-medium">{ratios.dpo} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Days Inventory Outstanding</span>
                  <span className="font-medium">{ratios.dio} days</span>
                </div>
              </CardContent>
            </Card>

            {/* Leverage Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Leverage & Profitability
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Debt to Equity</span>
                  <span className="font-medium">{ratios.debtToEquity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Gross Margin</span>
                  <span className="font-medium">{Math.round(ratios.grossMargin * 100)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Operating Margin</span>
                  <span className="font-medium">{Math.round(ratios.operatingMargin * 100)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Net Margin</span>
                  <span className="font-medium">{Math.round(ratios.netMargin * 100)}%</span>
                </div>
              </CardContent>
            </Card>

            {/* Balance Sheet Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Balance Sheet Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Assets</span>
                  <span className="font-medium">${scheduleL.totalAssets.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Liabilities</span>
                  <span className="font-medium">${scheduleL.totalLiabilities.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Equity</span>
                  <span className="font-medium">${scheduleL.totalEquity.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Current Assets</span>
                  <span>${scheduleL.currentAssets.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Current Liabilities</span>
                  <span>${scheduleL.currentLiabilities.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AI Advisor Tab */}
        <TabsContent value="advisor" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Calculator className="h-4 w-4 mr-2" />
                    Calculate Tax Savings
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Generate Optimization Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Export Action Plan
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Key Metrics Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Potential Savings</span>
                    <span className="font-semibold">${totalPotentialSavings.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Actions Completed</span>
                    <span className="font-semibold">{completedActions}/{optimizationActions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Cash Conversion Cycle</span>
                    <span className="font-semibold">{ratios.cashConversionCycle} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Current Ratio</span>
                    <span className="font-semibold">{ratios.currentRatio}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <AIChatAdvisor taxData={taxData} />
          </div>
        </TabsContent>

        {/* Personal Tax Planning Tab */}
        <TabsContent value="personal" className="space-y-4">
          <PersonalTaxPlanning />
        </TabsContent>
      </Tabs>
    </div>
  )
}
