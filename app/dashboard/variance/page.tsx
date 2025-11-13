"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle,
  DollarSign,
  Users,
  Package,
  CreditCard,
  BarChart3
} from "lucide-react"

export default function VarianceAnalysisPage() {
  const varianceData = {
    revenue: {
      actual: 1200000,
      budget: 1000000,
      variance: 200000,
      variancePercent: 20,
      trend: "favorable"
    },
    cogs: {
      actual: 480000,
      budget: 400000,
      variance: 80000,
      variancePercent: 20,
      trend: "unfavorable"
    },
    grossProfit: {
      actual: 720000,
      budget: 600000,
      variance: 120000,
      variancePercent: 20,
      trend: "favorable"
    },
    operatingExpenses: {
      actual: 420000,
      budget: 350000,
      variance: 70000,
      variancePercent: 20,
      trend: "unfavorable"
    },
    netIncome: {
      actual: 300000,
      budget: 250000,
      variance: 50000,
      variancePercent: 20,
      trend: "favorable"
    }
  }

  const topDrivers = [
    {
      category: "Revenue Growth",
      driver: "New customer acquisition exceeded target by 35%",
      impact: 150000,
      type: "favorable",
      icon: Users
    },
    {
      category: "COGS Increase",
      driver: "Raw material costs up 15% due to supply chain issues",
      impact: -60000,
      type: "unfavorable",
      icon: Package
    },
    {
      category: "Revenue Growth",
      driver: "Pricing optimization added 8% to average deal size",
      impact: 50000,
      type: "favorable",
      icon: DollarSign
    },
    {
      category: "OpEx Increase",
      driver: "Additional marketing spend for Q4 campaign",
      impact: -45000,
      type: "unfavorable",
      icon: CreditCard
    },
    {
      category: "OpEx Increase",
      driver: "Three new engineering hires ahead of schedule",
      impact: -25000,
      type: "unfavorable",
      icon: Users
    }
  ]

  const departmentVariances = [
    { dept: "Sales & Marketing", budget: 180000, actual: 210000, variance: -30000, variancePercent: -16.7 },
    { dept: "Engineering", budget: 250000, actual: 275000, variance: -25000, variancePercent: -10 },
    { dept: "Operations", budget: 120000, actual: 115000, variance: 5000, variancePercent: 4.2 },
    { dept: "G&A", budget: 80000, actual: 82000, variance: -2000, variancePercent: -2.5 },
  ]

  const formatCurrency = (value: number) => {
    const absValue = Math.abs(value)
    if (absValue >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    } else if (absValue >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`
    }
    return `$${value.toLocaleString()}`
  }

  const getVarianceBadge = (trend: string) => {
    if (trend === "favorable") {
      return (
        <Badge variant="default" className="bg-green-600 flex items-center gap-1">
          <TrendingUp className="h-3 w-3" />
          Favorable
        </Badge>
      )
    }
    return (
      <Badge variant="destructive" className="flex items-center gap-1">
        <TrendingDown className="h-3 w-3" />
        Unfavorable
      </Badge>
    )
  }

  return (
    <DashboardLayout
      title="Variance Analysis"
      description="Compare actual performance vs budget and identify key drivers"
    >
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue Variance</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">+{formatCurrency(varianceData.revenue.variance)}</div>
              <p className="text-xs text-muted-foreground">
                +{varianceData.revenue.variancePercent}% vs budget
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">COGS Variance</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(varianceData.cogs.variance)}</div>
              <p className="text-xs text-muted-foreground">
                +{varianceData.cogs.variancePercent}% vs budget
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">OpEx Variance</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(varianceData.operatingExpenses.variance)}</div>
              <p className="text-xs text-muted-foreground">
                +{varianceData.operatingExpenses.variancePercent}% vs budget
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Income Variance</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">+{formatCurrency(varianceData.netIncome.variance)}</div>
              <p className="text-xs text-muted-foreground">
                +{varianceData.netIncome.variancePercent}% vs budget
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="summary" className="space-y-6">
          <TabsList>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="drivers">Top Drivers</TabsTrigger>
            <TabsTrigger value="departments">By Department</TabsTrigger>
            <TabsTrigger value="monthly">Monthly Trend</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Income Statement Variance</CardTitle>
                <CardDescription>
                  Actual vs Budget - Q4 2023
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(varianceData).map(([key, data]) => (
                    <div key={key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                          {getVarianceBadge(data.trend)}
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(data.actual)}</div>
                          <div className="text-sm text-muted-foreground">Budget: {formatCurrency(data.budget)}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress 
                          value={(data.actual / data.budget) * 100} 
                          className="flex-1"
                        />
                        <span className={`text-sm font-medium ${data.trend === 'favorable' ? 'text-green-600' : 'text-red-600'}`}>
                          {data.trend === 'favorable' ? '+' : ''}{data.variancePercent}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="drivers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Top 5 Variance Drivers</CardTitle>
                <CardDescription>
                  Key factors contributing to budget variance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topDrivers.map((driver, index) => {
                    const Icon = driver.icon
                    return (
                      <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                        <div className={`p-2 rounded-lg ${driver.type === 'favorable' ? 'bg-green-100' : 'bg-red-100'}`}>
                          <Icon className={`h-5 w-5 ${driver.type === 'favorable' ? 'text-green-600' : 'text-red-600'}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">{driver.category}</span>
                            <span className={`text-lg font-bold ${driver.type === 'favorable' ? 'text-green-600' : 'text-red-600'}`}>
                              {driver.type === 'favorable' ? '+' : ''}{formatCurrency(driver.impact)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{driver.driver}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="departments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Department-Level Variance</CardTitle>
                <CardDescription>
                  Operating expenses by department vs budget
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {departmentVariances.map((dept, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{dept.dept}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground">
                            {formatCurrency(dept.actual)} / {formatCurrency(dept.budget)}
                          </span>
                          <Badge variant={dept.variance > 0 ? "default" : "destructive"} className="min-w-[80px]">
                            {dept.variance > 0 ? '+' : ''}{formatCurrency(dept.variance)}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress 
                          value={(dept.actual / dept.budget) * 100} 
                          className="flex-1"
                        />
                        <span className={`text-sm font-medium min-w-[50px] text-right ${dept.variance > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {dept.variancePercent > 0 ? '+' : ''}{dept.variancePercent.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monthly" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Variance Trend</CardTitle>
                <CardDescription>
                  Budget variance over time (last 6 months)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-[300px] flex items-center justify-center border-2 border-dashed rounded-lg">
                    <div className="text-center text-muted-foreground">
                      <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Monthly trend chart would display here</p>
                      <p className="text-sm">(Chart visualization in production)</p>
                    </div>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Avg Monthly Variance</div>
                      <div className="text-2xl font-bold text-green-600">+$42K</div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Best Month</div>
                      <div className="text-2xl font-bold">December</div>
                      <div className="text-sm text-green-600">+$85K vs budget</div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Worst Month</div>
                      <div className="text-2xl font-bold">August</div>
                      <div className="text-sm text-red-600">-$12K vs budget</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

