"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Package, 
  TrendingUp, 
  TrendingDown, 
  Truck,
  Users,
  AlertCircle,
  CheckCircle2,
  Clock,
  DollarSign,
  BarChart3
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
  PieChart,
  Pie,
  Cell
} from "recharts"

interface InventoryItem {
  sku: string
  product: string
  category: string
  currentStock: number
  optimalStock: number
  excessStock: number
  carryingCost: number
  turnoverRate: number
  status: "optimal" | "overstocked" | "understocked"
}

interface Supplier {
  name: string
  category: string
  annualSpend: number
  paymentTerms: string
  proposedTerms: string
  potentialSavings: number
  relationship: "strategic" | "preferred" | "standard"
  performance: number
}

const inventoryData: InventoryItem[] = [
  {
    sku: "SKU-001",
    product: "Product A",
    category: "Raw Materials",
    currentStock: 1500,
    optimalStock: 900,
    excessStock: 600,
    carryingCost: 12000,
    turnoverRate: 4.2,
    status: "overstocked"
  },
  {
    sku: "SKU-002",
    product: "Product B",
    category: "Finished Goods",
    currentStock: 800,
    optimalStock: 1000,
    excessStock: -200,
    carryingCost: 8000,
    turnoverRate: 8.5,
    status: "understocked"
  },
  {
    sku: "SKU-003",
    product: "Product C",
    category: "Components",
    currentStock: 2000,
    optimalStock: 1800,
    excessStock: 200,
    carryingCost: 4000,
    turnoverRate: 6.3,
    status: "optimal"
  },
  {
    sku: "SKU-004",
    product: "Product D",
    category: "Raw Materials",
    currentStock: 3000,
    optimalStock: 1500,
    excessStock: 1500,
    carryingCost: 22500,
    turnoverRate: 2.1,
    status: "overstocked"
  }
]

const supplierData: Supplier[] = [
  {
    name: "Acme Corp",
    category: "Raw Materials",
    annualSpend: 450000,
    paymentTerms: "Net 30",
    proposedTerms: "Net 45",
    potentialSavings: 22500,
    relationship: "strategic",
    performance: 95
  },
  {
    name: "Global Supplies Inc",
    category: "Components",
    annualSpend: 280000,
    paymentTerms: "Net 30",
    proposedTerms: "Net 60",
    potentialSavings: 28000,
    relationship: "preferred",
    performance: 88
  },
  {
    name: "Reliable Parts LLC",
    category: "Equipment",
    annualSpend: 180000,
    paymentTerms: "Net 15",
    proposedTerms: "Net 30",
    potentialSavings: 9000,
    relationship: "standard",
    performance: 92
  },
  {
    name: "Quality Materials Co",
    category: "Raw Materials",
    annualSpend: 320000,
    paymentTerms: "Net 45",
    proposedTerms: "Net 60",
    potentialSavings: 16000,
    relationship: "strategic",
    performance: 97
  }
]

const inventoryTrendData = [
  { month: "Jan", optimal: 1200, actual: 1800, target: 1300 },
  { month: "Feb", optimal: 1250, actual: 1750, target: 1300 },
  { month: "Mar", optimal: 1300, actual: 1700, target: 1350 },
  { month: "Apr", optimal: 1280, actual: 1650, target: 1350 },
  { month: "May", optimal: 1320, actual: 1600, target: 1400 },
  { month: "Jun", optimal: 1350, actual: 1550, target: 1400 }
]

const categoryDistribution = [
  { name: "Raw Materials", value: 4500, optimal: 2400 },
  { name: "Components", value: 2000, optimal: 1800 },
  { name: "Finished Goods", value: 800, optimal: 1000 },
  { name: "Equipment", value: 500, optimal: 400 }
]

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"]

export function SupplyChainOptimization() {
  const totalCarryingCost = inventoryData.reduce((sum, item) => sum + item.carryingCost, 0)
  const totalExcessStock = inventoryData.reduce((sum, item) => sum + Math.max(0, item.excessStock), 0)
  const totalSupplierSavings = supplierData.reduce((sum, supplier) => sum + supplier.potentialSavings, 0)
  const overstockedCount = inventoryData.filter(item => item.status === "overstocked").length

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Package className="h-8 w-8 text-violet-600" />
            <div>
              <CardTitle className="text-2xl">Supply Chain Optimization</CardTitle>
              <CardDescription>Inventory planning and supplier collaboration</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-sm text-muted-foreground mb-1">Inventory Savings</div>
              <div className="text-2xl font-bold text-green-600">${(totalCarryingCost / 1000).toFixed(0)}K</div>
              <div className="text-xs text-muted-foreground">Annual carrying cost reduction</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-sm text-muted-foreground mb-1">Excess Stock</div>
              <div className="text-2xl font-bold text-orange-600">{totalExcessStock}</div>
              <div className="text-xs text-muted-foreground">{overstockedCount} items overstocked</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-sm text-muted-foreground mb-1">Supplier Terms</div>
              <div className="text-2xl font-bold text-blue-600">${(totalSupplierSavings / 1000).toFixed(0)}K</div>
              <div className="text-xs text-muted-foreground">Payment term optimization</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-sm text-muted-foreground mb-1">Total Opportunity</div>
              <div className="text-2xl font-bold text-purple-600">
                ${((totalCarryingCost + totalSupplierSavings) / 1000).toFixed(0)}K
              </div>
              <div className="text-xs text-muted-foreground">Combined optimization</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs defaultValue="inventory" className="space-y-6">
        <TabsList>
          <TabsTrigger value="inventory">Inventory Planning</TabsTrigger>
          <TabsTrigger value="suppliers">Supplier Collaboration</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Inventory Planning Tab */}
        <TabsContent value="inventory" className="space-y-6">
          {/* Inventory Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Inventory Levels Over Time</CardTitle>
              <CardDescription>Actual vs. optimal vs. target inventory levels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={inventoryTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="actual" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      name="Current Levels"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="optimal" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      name="Optimal Levels"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="target" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Target"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Inventory Items */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Inventory Optimization Opportunities</h3>
            {inventoryData.map((item, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {item.product}
                        <Badge 
                          variant={item.status === "optimal" ? "default" : item.status === "overstocked" ? "destructive" : "secondary"}
                          className={item.status === "optimal" ? "bg-green-500" : ""}
                        >
                          {item.status}
                        </Badge>
                      </CardTitle>
                      <CardDescription>{item.sku} • {item.category}</CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Potential Savings</div>
                      <div className="text-2xl font-bold text-green-600">
                        ${(item.carryingCost / 1000).toFixed(1)}K
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Stock Levels */}
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground mb-1">Current Stock</div>
                        <div className="text-lg font-bold">{item.currentStock}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground mb-1">Optimal Stock</div>
                        <div className="text-lg font-bold text-blue-600">{item.optimalStock}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground mb-1">Turnover Rate</div>
                        <div className="text-lg font-bold">{item.turnoverRate}x/year</div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {item.status === "overstocked" && (
                      <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-orange-600 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            Excess Stock: {item.excessStock} units
                          </span>
                          <span className="text-muted-foreground">
                            Reduce by {Math.round((item.excessStock / item.currentStock) * 100)}%
                          </span>
                        </div>
                        <Progress 
                          value={((item.currentStock - item.optimalStock) / item.currentStock) * 100}
                          className="h-2"
                        />
                      </div>
                    )}

                    {/* Recommendations */}
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="text-sm">
                        <span className="font-semibold">Recommendation: </span>
                        {item.status === "overstocked" && (
                          <>Implement just-in-time ordering and liquidate {item.excessStock} units of excess inventory. This will reduce carrying costs by ${(item.carryingCost / 1000).toFixed(1)}K annually.</>
                        )}
                        {item.status === "understocked" && (
                          <>Increase stock levels by {Math.abs(item.excessStock)} units to meet demand. Consider safety stock adjustments.</>
                        )}
                        {item.status === "optimal" && (
                          <>Maintain current inventory levels. Monitor demand patterns for any changes.</>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Supplier Collaboration Tab */}
        <TabsContent value="suppliers" className="space-y-6">
          {/* Supplier Summary */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-muted-foreground">Total Annual Spend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${(supplierData.reduce((sum, s) => sum + s.annualSpend, 0) / 1000).toFixed(0)}K
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-muted-foreground">Potential Savings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ${(totalSupplierSavings / 1000).toFixed(0)}K
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-muted-foreground">Avg Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(supplierData.reduce((sum, s) => sum + s.performance, 0) / supplierData.length)}%
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Supplier Cards */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Supplier Payment Term Optimization</h3>
            {supplierData.map((supplier, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {supplier.name}
                        <Badge 
                          variant={supplier.relationship === "strategic" ? "default" : supplier.relationship === "preferred" ? "secondary" : "outline"}
                          className={supplier.relationship === "strategic" ? "bg-blue-500" : ""}
                        >
                          {supplier.relationship}
                        </Badge>
                      </CardTitle>
                      <CardDescription>{supplier.category}</CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Potential Savings</div>
                      <div className="text-2xl font-bold text-green-600">
                        ${(supplier.potentialSavings / 1000).toFixed(0)}K
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Metrics */}
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground mb-1">Annual Spend</div>
                        <div className="text-lg font-bold">${(supplier.annualSpend / 1000).toFixed(0)}K</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground mb-1">Current Terms</div>
                        <div className="text-lg font-bold">{supplier.paymentTerms}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground mb-1">Performance</div>
                        <div className="text-lg font-bold text-green-600">{supplier.performance}%</div>
                      </div>
                    </div>

                    {/* Terms Improvement */}
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="text-sm">
                          <span className="font-semibold">Proposed Terms: </span>
                          <span className="text-green-700">{supplier.proposedTerms}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-semibold text-green-600">
                            +{parseInt(supplier.proposedTerms.match(/\d+/)?.[0] || "0") - parseInt(supplier.paymentTerms.match(/\d+/)?.[0] || "0")} days
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        View Details
                      </Button>
                      <Button size="sm" className="flex-1">
                        Initiate Negotiation
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Category Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Inventory by Category</CardTitle>
                <CardDescription>Current vs. optimal distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#3b82f6" name="Current" />
                      <Bar dataKey="optimal" fill="#10b981" name="Optimal" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Supplier Spend Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Supplier Spend Distribution</CardTitle>
                <CardDescription>Annual spend by supplier</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={supplierData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="annualSpend"
                      >
                        {supplierData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => `$${(value / 1000).toFixed(0)}K`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary Card */}
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <BarChart3 className="h-6 w-6 text-purple-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-purple-900 mb-2">Supply Chain Summary</h4>
                  <p className="text-sm text-purple-800 mb-3">
                    Combined inventory optimization and supplier term improvements could release{" "}
                    <strong>${((totalCarryingCost + totalSupplierSavings) / 1000).toFixed(0)}K</strong> in cash
                    over the next 90 days. Focus on reducing {overstockedCount} overstocked items and negotiating
                    improved payment terms with {supplierData.filter(s => s.relationship === "strategic" || s.relationship === "preferred").length} key suppliers.
                  </p>
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                    Generate Action Plan
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}































