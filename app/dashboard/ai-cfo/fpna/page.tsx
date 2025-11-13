"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  BarChart3, 
  Calculator,
  Plus,
  Edit,
  Trash2,
  Download,
  RefreshCw
} from "lucide-react"

interface DriverOverride {
  name: string
  type: 'set' | 'inc' | 'dec' | 'mul'
  value: number
}

export default function FPNAPage() {
  const [activeTab, setActiveTab] = useState("scenarios")
  const [isGenerating, setIsGenerating] = useState(false)
  
  // Form state for new scenario
  const [scenarioForm, setScenarioForm] = useState({
    name: '',
    base: 'latest_actuals'
  })
  
  const [driverOverrides, setDriverOverrides] = useState<DriverOverride[]>([])
  const [newDriver, setNewDriver] = useState({
    name: '',
    type: 'set' as DriverOverride['type'],
    value: 0
  })
  
  // Edit scenario state
  const [editingScenario, setEditingScenario] = useState<typeof scenarios[0] | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    status: 'draft' as 'active' | 'draft'
  })
  
  const [scenarios, setScenarios] = useState([
    {
      id: "1",
      name: "Base Case",
      description: "Current trajectory with no changes",
      created: "2025-01-15",
      status: "active",
      revenue: 2400000,
      ebitda: 480000
    },
    {
      id: "2", 
      name: "Optimistic",
      description: "Best case scenario with market growth",
      created: "2025-01-15",
      status: "draft",
      revenue: 3000000,
      ebitda: 750000
    },
    {
      id: "3",
      name: "Conservative",
      description: "Economic downturn scenario",
      created: "2025-01-14",
      status: "draft", 
      revenue: 1800000,
      ebitda: 270000
    }
  ])

  const [forecasts, setForecasts] = useState([
    {
      period: "2025-02",
      revenue: 800000,
      cogs: 320000,
      opex: 200000,
      ebitda: 280000,
      cash_end: 1200000
    },
    {
      period: "2025-03", 
      revenue: 850000,
      cogs: 340000,
      opex: 210000,
      ebitda: 300000,
      cash_end: 1500000
    },
    {
      period: "2025-04",
      revenue: 900000,
      cogs: 360000,
      opex: 220000,
      ebitda: 320000,
      cash_end: 1820000
    }
  ])

  const [varianceData, setVarianceData] = useState([
    {
      account: "Revenue",
      actual: 750000,
      budget: 800000,
      variance: -50000,
      variance_pct: -6.25,
      driver: "Lower conversion rate"
    },
    {
      account: "COGS",
      actual: 300000,
      budget: 320000,
      variance: 20000,
      variance_pct: 6.25,
      driver: "Better supplier pricing"
    },
    {
      account: "Marketing",
      actual: 120000,
      budget: 100000,
      variance: -20000,
      variance_pct: -20,
      driver: "Increased ad spend"
    }
  ])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatPercent = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  // Form handlers
  const handleScenarioFormChange = (field: string, value: string) => {
    setScenarioForm(prev => ({ ...prev, [field]: value }))
  }

  const handleAddDriver = () => {
    if (newDriver.name.trim() && newDriver.value !== 0) {
      setDriverOverrides(prev => [...prev, { ...newDriver }])
      setNewDriver({ name: '', type: 'set', value: 0 })
    }
  }

  const handleRemoveDriver = (index: number) => {
    setDriverOverrides(prev => prev.filter((_, i) => i !== index))
  }

  // Calculate preview of scenario impact
  const calculatePreview = () => {
    const baseRevenue = 2400000
    const baseEbitda = 720000
    const baseCash = 1200000
    
    let previewRevenue = baseRevenue
    let previewCogs = 960000
    let previewOpex = 720000
    
    driverOverrides.forEach(override => {
      const driverName = override.name.toLowerCase().replace(/\s+/g, '_')
      
      // Map drivers to financial line items
      if (['revenue_growth', 'customer_acquisition', 'average_deal_size'].includes(driverName)) {
        switch (override.type) {
          case 'set':
            previewRevenue = override.value
            break
          case 'inc':
            previewRevenue += override.value
            break
          case 'dec':
            previewRevenue -= override.value
            break
          case 'mul':
            previewRevenue *= (1 + override.value / 100)
            break
        }
      } else if (['cogs_per_unit', 'supplier_pricing'].includes(driverName)) {
        switch (override.type) {
          case 'set':
            previewCogs = override.value
            break
          case 'inc':
            previewCogs += override.value
            break
          case 'dec':
            previewCogs -= override.value
            break
          case 'mul':
            previewCogs *= (1 + override.value / 100)
            break
        }
      } else if (['marketing_spend', 'operational_efficiency', 'headcount', 'rent', 'utilities'].includes(driverName)) {
        switch (override.type) {
          case 'set':
            previewOpex = override.value
            break
          case 'inc':
            previewOpex += override.value
            break
          case 'dec':
            previewOpex -= override.value
            break
          case 'mul':
            previewOpex *= (1 + override.value / 100)
            break
        }
      }
    })
    
    const previewEbitda = previewRevenue - previewCogs - previewOpex
    const ebitdaChange = previewEbitda - baseEbitda
    const previewCash = baseCash + ebitdaChange
    
    return {
      revenue: previewRevenue,
      ebitda: previewEbitda,
      cash: previewCash,
      revenueChange: previewRevenue - baseRevenue,
      ebitdaChange: ebitdaChange,
      cashChange: previewCash - baseCash
    }
  }

  const preview = calculatePreview()

  // Edit scenario handlers
  const handleEditScenario = (scenario: typeof scenarios[0]) => {
    setEditingScenario(scenario)
    setEditForm({
      name: scenario.name,
      description: scenario.description,
      status: scenario.status
    })
    setIsEditModalOpen(true)
  }

  const handleUpdateScenario = async () => {
    if (!editingScenario || !editForm.name.trim()) {
      toast.error("Please enter a scenario name")
      return
    }

    try {
      const response = await fetch('/api/ai-cfo/fpna', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update_scenario',
          data: {
            scenario_id: editingScenario.id,
            name: editForm.name,
            description: editForm.description,
            status: editForm.status
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update scenario')
      }

      // Update the scenario in the list
      setScenarios(prev => prev.map(scenario => 
        scenario.id === editingScenario.id 
          ? { ...scenario, name: editForm.name, description: editForm.description, status: editForm.status }
          : scenario
      ))
      
      setIsEditModalOpen(false)
      setEditingScenario(null)
      toast.success("Scenario updated successfully!")
      
    } catch (error) {
      console.error('Error updating scenario:', error)
      toast.error("Failed to update scenario. Please try again.")
    }
  }

  const handleDeleteScenario = async (scenarioId: string) => {
    if (!confirm('Are you sure you want to delete this scenario?')) {
      return
    }

    try {
      const response = await fetch('/api/ai-cfo/fpna', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'delete_scenario',
          data: {
            scenario_id: scenarioId
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to delete scenario')
      }

      // Remove the scenario from the list
      setScenarios(prev => prev.filter(scenario => scenario.id !== scenarioId))
      toast.success("Scenario deleted successfully!")
      
    } catch (error) {
      console.error('Error deleting scenario:', error)
      toast.error("Failed to delete scenario. Please try again.")
    }
  }

  const handleGenerateScenario = async () => {
    if (!scenarioForm.name.trim()) {
      toast.error("Please enter a scenario name")
      return
    }

    setIsGenerating(true)
    
    try {
      const response = await fetch('/api/ai-cfo/fpna', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create_scenario',
          data: {
            name: scenarioForm.name,
            base: scenarioForm.base,
            overrides: driverOverrides
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create scenario')
      }

      const result = await response.json()
      
      // Add the new scenario to the list with calculated financials
      const newScenario = {
        id: result.scenario_id,
        name: scenarioForm.name,
        description: `Generated scenario with ${driverOverrides.length} driver overrides`,
        created: new Date().toISOString().split('T')[0],
        status: 'draft' as const,
        revenue: result.calculated_financials?.revenue || 2400000,
        ebitda: result.calculated_financials?.ebitda || 720000,
        impact_summary: result.impact_summary || {
          revenue_change: 0,
          ebitda_change: 0,
          cash_change: 0
        },
        calculated_financials: result.calculated_financials
      }
      
      setScenarios(prev => [...prev, newScenario])
      
      // Reset form
      setScenarioForm({ name: '', base: 'latest_actuals' })
      setDriverOverrides([])
      
      toast.success("Scenario generated successfully!")
      
    } catch (error) {
      console.error('Error generating scenario:', error)
      toast.error("Failed to generate scenario. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">FP&A</h1>
          <p className="text-muted-foreground">
            Financial Planning & Analysis with AI-powered insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Data
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Scenario
          </Button>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
          <TabsTrigger value="forecasts">Forecasts</TabsTrigger>
          <TabsTrigger value="variance">Variance Analysis</TabsTrigger>
          <TabsTrigger value="drivers">Drivers</TabsTrigger>
        </TabsList>

        <TabsContent value="scenarios" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {scenarios.map((scenario) => (
              <Card key={scenario.id} className="relative">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{scenario.name}</CardTitle>
                    <Badge variant={scenario.status === "active" ? "default" : "secondary"}>
                      {scenario.status}
                    </Badge>
                  </div>
                  <CardDescription>{scenario.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Revenue</Label>
                      <div className="text-lg font-semibold">
                        {formatCurrency(scenario.revenue)}
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">EBITDA</Label>
                      <div className="text-lg font-semibold">
                        {formatCurrency(scenario.ebitda)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-xs text-muted-foreground">
                      Created {scenario.created}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleEditScenario(scenario)}
                        title="Edit scenario"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleDeleteScenario(scenario.id)}
                        title="Delete scenario"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Create New Scenario</CardTitle>
              <CardDescription>
                Build a new financial scenario with driver overrides
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="scenario-name">Scenario Name</Label>
                  <Input 
                    id="scenario-name" 
                    placeholder="e.g., Growth Scenario" 
                    value={scenarioForm.name}
                    onChange={(e) => handleScenarioFormChange('name', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="base-scenario">Base Scenario</Label>
                  <Select value={scenarioForm.base} onValueChange={(value) => handleScenarioFormChange('base', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select base scenario" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="latest_actuals">Latest Actuals</SelectItem>
                      <SelectItem value="budget">Budget</SelectItem>
                      <SelectItem value="prior_year">Prior Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label>Driver Overrides</Label>
                <div className="mt-1 mb-3">
                  <div className="text-xs text-muted-foreground">
                    <strong>Revenue drivers:</strong> revenue_growth, customer_acquisition, average_deal_size<br/>
                    <strong>Cost drivers:</strong> cogs_per_unit, supplier_pricing<br/>
                    <strong>Expense drivers:</strong> marketing_spend, operational_efficiency, headcount, rent, utilities
                  </div>
                </div>
                <div className="mt-2 space-y-2">
                  {driverOverrides.map((driver, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 border rounded-md">
                      <span className="text-sm font-medium">{driver.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {driver.type === 'set' && '='}
                        {driver.type === 'inc' && '+'}
                        {driver.type === 'dec' && '-'}
                        {driver.type === 'mul' && '×'}
                        {driver.value}
                      </span>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleRemoveDriver(index)}
                        className="ml-auto"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  
                  <div className="grid grid-cols-4 gap-2">
                    <Input 
                      placeholder="Driver name" 
                      value={newDriver.name}
                      onChange={(e) => setNewDriver(prev => ({ ...prev, name: e.target.value }))}
                    />
                    <Select 
                      value={newDriver.type} 
                      onValueChange={(value: DriverOverride['type']) => setNewDriver(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="set">Set</SelectItem>
                        <SelectItem value="inc">Increase</SelectItem>
                        <SelectItem value="dec">Decrease</SelectItem>
                        <SelectItem value="mul">Multiply</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input 
                      placeholder="Value" 
                      type="number" 
                      value={newDriver.value || ''}
                      onChange={(e) => setNewDriver(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                    />
                    <Button size="sm" variant="outline" onClick={handleAddDriver}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Preview Section */}
              {driverOverrides.length > 0 && (
                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader>
                    <CardTitle className="text-lg text-blue-800">Impact Preview</CardTitle>
                    <CardDescription className="text-blue-600">
                      Preview of how your driver overrides will affect the financials
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Revenue</div>
                        <div className="text-lg font-semibold">{formatCurrency(preview.revenue)}</div>
                        <div className={`text-sm ${preview.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(preview.revenueChange)} ({formatPercent((preview.revenueChange / 2400000) * 100)})
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">EBITDA</div>
                        <div className="text-lg font-semibold">{formatCurrency(preview.ebitda)}</div>
                        <div className={`text-sm ${preview.ebitdaChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(preview.ebitdaChange)} ({formatPercent((preview.ebitdaChange / 720000) * 100)})
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Cash Position</div>
                        <div className="text-lg font-semibold">{formatCurrency(preview.cash)}</div>
                        <div className={`text-sm ${preview.cashChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(preview.cashChange)} ({formatPercent((preview.cashChange / 1200000) * 100)})
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <Button 
                className="w-full" 
                onClick={handleGenerateScenario}
                disabled={isGenerating}
              >
                <Brain className="mr-2 h-4 w-4" />
                {isGenerating ? "Generating Scenario..." : "Generate Scenario"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecasts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Forecast</CardTitle>
              <CardDescription>
                AI-generated monthly financial forecast
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Period</th>
                      <th className="text-right py-2">Revenue</th>
                      <th className="text-right py-2">COGS</th>
                      <th className="text-right py-2">OpEx</th>
                      <th className="text-right py-2">EBITDA</th>
                      <th className="text-right py-2">Cash End</th>
                    </tr>
                  </thead>
                  <tbody>
                    {forecasts.map((forecast) => (
                      <tr key={forecast.period} className="border-b">
                        <td className="py-2 font-medium">{forecast.period}</td>
                        <td className="text-right py-2">{formatCurrency(forecast.revenue)}</td>
                        <td className="text-right py-2">{formatCurrency(forecast.cogs)}</td>
                        <td className="text-right py-2">{formatCurrency(forecast.opex)}</td>
                        <td className="text-right py-2 font-semibold">{formatCurrency(forecast.ebitda)}</td>
                        <td className="text-right py-2">{formatCurrency(forecast.cash_end)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="variance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Variance Analysis</CardTitle>
              <CardDescription>
                Actual vs Budget variance analysis for current period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {varianceData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <h4 className="font-medium">{item.account}</h4>
                      <p className="text-sm text-muted-foreground">{item.driver}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground">Actual</div>
                          <div className="font-medium">{formatCurrency(item.actual)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Budget</div>
                          <div className="font-medium">{formatCurrency(item.budget)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Variance</div>
                          <div className={`font-medium flex items-center ${
                            item.variance > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {item.variance > 0 ? (
                              <TrendingUp className="h-3 w-3 mr-1" />
                            ) : (
                              <TrendingDown className="h-3 w-3 mr-1" />
                            )}
                            {formatCurrency(item.variance)} ({formatPercent(item.variance_pct)})
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drivers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Financial Drivers</CardTitle>
              <CardDescription>
                Key business drivers and their impact on financial performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <h4 className="font-medium">Revenue Drivers</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 border rounded">
                      <span className="text-sm">Customer Acquisition Rate</span>
                      <Badge variant="outline">+15%</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 border rounded">
                      <span className="text-sm">Average Deal Size</span>
                      <Badge variant="outline">+8%</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 border rounded">
                      <span className="text-sm">Churn Rate</span>
                      <Badge variant="outline" className="text-red-600">-5%</Badge>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium">Cost Drivers</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 border rounded">
                      <span className="text-sm">COGS per Unit</span>
                      <Badge variant="outline" className="text-green-600">-3%</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 border rounded">
                      <span className="text-sm">Marketing Efficiency</span>
                      <Badge variant="outline">+12%</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 border rounded">
                      <span className="text-sm">Operational Efficiency</span>
                      <Badge variant="outline">+7%</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Scenario Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Scenario</DialogTitle>
            <DialogDescription>
              Update the scenario details below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-scenario-name">Scenario Name</Label>
              <Input 
                id="edit-scenario-name"
                value={editForm.name}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter scenario name"
              />
            </div>
            <div>
              <Label htmlFor="edit-scenario-description">Description</Label>
              <Textarea 
                id="edit-scenario-description"
                value={editForm.description}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter scenario description"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit-scenario-status">Status</Label>
              <Select 
                value={editForm.status} 
                onValueChange={(value: 'active' | 'draft') => setEditForm(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateScenario}>
                Update Scenario
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}


