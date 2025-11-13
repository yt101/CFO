"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  GitBranch, 
  TrendingUp, 
  TrendingDown, 
  Calculator,
  AlertCircle
} from "lucide-react"
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart
} from "recharts"

interface Scenario {
  id: string
  name: string
  description: string
  assumptions: {
    revenueGrowth: number
    dsoChange: number
    dpoChange: number
    dioChange: number
  }
  impact: {
    cashPosition: number
    ccc: number
    workingCapital: number
  }
  probability: number
}

const scenarios: Scenario[] = [
  {
    id: "base",
    name: "Base Case",
    description: "Current trajectory with existing initiatives",
    assumptions: {
      revenueGrowth: 15,
      dsoChange: -2.8,
      dpoChange: 2.5,
      dioChange: -3.5
    },
    impact: {
      cashPosition: 4400000,
      ccc: 49,
      workingCapital: 3200000
    },
    probability: 60
  },
  {
    id: "optimistic",
    name: "Optimistic Case",
    description: "All optimization initiatives successful",
    assumptions: {
      revenueGrowth: 22,
      dsoChange: -6.5,
      dpoChange: 5.0,
      dioChange: -8.0
    },
    impact: {
      cashPosition: 5550000,
      ccc: 38,
      workingCapital: 4100000
    },
    probability: 25
  },
  {
    id: "conservative",
    name: "Conservative Case",
    description: "Slower progress, external headwinds",
    assumptions: {
      revenueGrowth: 8,
      dsoChange: -1.0,
      dpoChange: 1.0,
      dioChange: -1.5
    },
    impact: {
      cashPosition: 3350000,
      ccc: 58,
      workingCapital: 2600000
    },
    probability: 15
  },
  {
    id: "aggressive",
    name: "Aggressive Growth",
    description: "Rapid expansion with increased working capital needs",
    assumptions: {
      revenueGrowth: 35,
      dsoChange: 2.0,
      dpoChange: 1.5,
      dioChange: 3.0
    },
    impact: {
      cashPosition: 5800000,
      ccc: 65,
      workingCapital: 4800000
    },
    probability: 10
  }
]

const generateTimeSeriesData = (scenario: Scenario) => {
  const baseValue = 3550000
  const weeks = 13
  const data = []
  
  for (let i = 0; i <= weeks; i++) {
    const growthFactor = 1 + (scenario.assumptions.revenueGrowth / 100) * (i / weeks)
    const value = baseValue * growthFactor
    
    data.push({
      week: `W${i}`,
      value: Math.round(value),
      lower: Math.round(value * 0.9),
      upper: Math.round(value * 1.1)
    })
  }
  
  return data
}

export function ScenarioAnalysis() {
  const [selectedScenario, setSelectedScenario] = useState<string>("base")
  const currentScenario = scenarios.find(s => s.id === selectedScenario) || scenarios[0]
  const timeSeriesData = generateTimeSeriesData(currentScenario)

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <GitBranch className="h-8 w-8 text-cyan-600" />
            <div>
              <CardTitle className="text-2xl">Scenario Analysis</CardTitle>
              <CardDescription>Model different business scenarios and their cash impact</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Label htmlFor="scenario-select" className="text-sm font-medium whitespace-nowrap">
              Select Scenario:
            </Label>
            <Select value={selectedScenario} onValueChange={setSelectedScenario}>
              <SelectTrigger id="scenario-select" className="max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {scenarios.map(scenario => (
                  <SelectItem key={scenario.id} value={scenario.id}>
                    {scenario.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge variant="outline" className="ml-auto">
              {currentScenario.probability}% probability
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Scenario Comparison Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {scenarios.map(scenario => (
          <Card 
            key={scenario.id}
            className={`cursor-pointer transition-all ${
              selectedScenario === scenario.id 
                ? "ring-2 ring-blue-500 shadow-lg" 
                : "hover:shadow-md"
            }`}
            onClick={() => setSelectedScenario(scenario.id)}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{scenario.name}</CardTitle>
              <CardDescription className="text-xs">{scenario.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <div className="text-xs text-muted-foreground">Projected Cash</div>
                  <div className="text-lg font-bold text-blue-600">
                    ${(scenario.impact.cashPosition / 1000).toFixed(0)}K
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={scenario.id === "optimistic" ? "default" : scenario.id === "conservative" ? "destructive" : "secondary"}
                    className="text-xs"
                  >
                    {scenario.probability}% likely
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Current Scenario Details */}
      <Card>
        <CardHeader>
          <CardTitle>{currentScenario.name} - Detailed Analysis</CardTitle>
          <CardDescription>{currentScenario.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="forecast" className="space-y-4">
            <TabsList>
              <TabsTrigger value="forecast">Cash Forecast</TabsTrigger>
              <TabsTrigger value="assumptions">Assumptions</TabsTrigger>
              <TabsTrigger value="impact">Impact Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="forecast" className="space-y-4">
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis 
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                    />
                    <Tooltip 
                      formatter={(value: number) => [`$${(value / 1000).toFixed(0)}K`, "Cash"]}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="upper" 
                      stroke="#93c5fd" 
                      fill="#dbeafe" 
                      fillOpacity={0.3}
                      name="Upper Range"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#3b82f6" 
                      fill="#3b82f6" 
                      fillOpacity={0.5}
                      name="Projected"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="lower" 
                      stroke="#93c5fd" 
                      fill="#dbeafe" 
                      fillOpacity={0.3}
                      name="Lower Range"
                    />
                    <Legend />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="assumptions" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Revenue Assumptions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Growth Rate</span>
                      <div className="flex items-center gap-2">
                        {currentScenario.assumptions.revenueGrowth > 15 ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-orange-600" />
                        )}
                        <span className="text-lg font-bold">
                          {currentScenario.assumptions.revenueGrowth}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Working Capital</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">DSO Change</span>
                        <span className={currentScenario.assumptions.dsoChange < 0 ? "text-green-600" : "text-orange-600"}>
                          {currentScenario.assumptions.dsoChange > 0 ? "+" : ""}{currentScenario.assumptions.dsoChange} days
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">DPO Change</span>
                        <span className={currentScenario.assumptions.dpoChange > 0 ? "text-green-600" : "text-orange-600"}>
                          {currentScenario.assumptions.dpoChange > 0 ? "+" : ""}{currentScenario.assumptions.dpoChange} days
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">DIO Change</span>
                        <span className={currentScenario.assumptions.dioChange < 0 ? "text-green-600" : "text-orange-600"}>
                          {currentScenario.assumptions.dioChange > 0 ? "+" : ""}{currentScenario.assumptions.dioChange} days
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="impact" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-muted-foreground">Cash Position (W13)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      ${(currentScenario.impact.cashPosition / 1000).toFixed(0)}K
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      vs ${(scenarios[0].impact.cashPosition / 1000).toFixed(0)}K base
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-muted-foreground">Cash Conversion Cycle</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {currentScenario.impact.ccc} days
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      vs {scenarios[0].impact.ccc} days base
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-muted-foreground">Working Capital</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      ${(currentScenario.impact.workingCapital / 1000).toFixed(0)}K
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      vs ${(scenarios[0].impact.workingCapital / 1000).toFixed(0)}K base
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Calculator className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-1">Scenario Summary</h4>
                      <p className="text-sm text-blue-800">
                        In this scenario, your cash position would be{" "}
                        <strong>
                          ${Math.abs((currentScenario.impact.cashPosition - scenarios[0].impact.cashPosition) / 1000).toFixed(0)}K{" "}
                          {currentScenario.impact.cashPosition > scenarios[0].impact.cashPosition ? "higher" : "lower"}
                        </strong>{" "}
                        than the base case. The cash conversion cycle would be{" "}
                        <strong>
                          {Math.abs(currentScenario.impact.ccc - scenarios[0].impact.ccc)} days{" "}
                          {currentScenario.impact.ccc < scenarios[0].impact.ccc ? "shorter" : "longer"}
                        </strong>.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}































