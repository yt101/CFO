"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  ShieldCheck, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Play,
  RefreshCw,
  Settings,
  FileText,
  Clock,
  Target
} from "lucide-react"

export default function ControlsPage() {
  const [activeTab, setActiveTab] = useState("checks")
  const [selectedRule, setSelectedRule] = useState("")
  const [selectedPeriod, setSelectedPeriod] = useState("2025-01")

  const controlRules = [
    {
      id: "gaap_flux_check",
      name: "GAAP Flux Check",
      description: "Validates that month-over-month changes in P&L accounts are within acceptable thresholds",
      category: "Financial",
      frequency: "Monthly",
      last_run: "2025-01-15",
      status: "ok"
    },
    {
      id: "balance_sheet_balance",
      name: "Balance Sheet Balance",
      description: "Ensures assets equal liabilities plus equity",
      category: "Financial",
      frequency: "Daily",
      last_run: "2025-01-16",
      status: "ok"
    },
    {
      id: "cash_reconciliation",
      name: "Cash Reconciliation",
      description: "Reconciles bank statements with general ledger cash accounts",
      category: "Cash",
      frequency: "Weekly",
      last_run: "2025-01-14",
      status: "warn"
    },
    {
      id: "revenue_recognition",
      name: "Revenue Recognition",
      description: "Validates proper revenue recognition timing and amounts",
      category: "Revenue",
      frequency: "Monthly",
      last_run: "2025-01-10",
      status: "fail"
    }
  ]

  const controlResults = [
    {
      rule_id: "gaap_flux_check",
      rule_name: "GAAP Flux Check",
      status: "ok",
      evidence_links: [
        "https://api.cfo.ai/evidence/gaap_flux_2025_01.pdf",
        "https://api.cfo.ai/evidence/flux_analysis_2025_01.xlsx"
      ],
      details: "All P&L accounts within 15% variance threshold",
      run_time: "2025-01-15T14:30:00Z"
    },
    {
      rule_id: "balance_sheet_balance",
      rule_name: "Balance Sheet Balance",
      status: "ok",
      evidence_links: [
        "https://api.cfo.ai/evidence/bs_balance_2025_01_16.pdf"
      ],
      details: "Assets ($2.5M) = Liabilities + Equity ($2.5M)",
      run_time: "2025-01-16T09:15:00Z"
    },
    {
      rule_id: "cash_reconciliation",
      rule_name: "Cash Reconciliation",
      status: "warn",
      evidence_links: [
        "https://api.cfo.ai/evidence/cash_recon_2025_01_14.pdf"
      ],
      details: "Minor discrepancies found in petty cash account ($150 variance)",
      run_time: "2025-01-14T16:45:00Z"
    },
    {
      rule_id: "revenue_recognition",
      rule_name: "Revenue Recognition",
      status: "fail",
      evidence_links: [
        "https://api.cfo.ai/evidence/revenue_rec_2025_01_10.pdf"
      ],
      details: "Revenue recognized before delivery for 3 transactions totaling $45K",
      run_time: "2025-01-10T11:20:00Z"
    }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ok":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "warn":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "fail":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ok":
        return <Badge variant="default" className="bg-green-100 text-green-800">Pass</Badge>
      case "warn":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Warning</Badge>
      case "fail":
        return <Badge variant="destructive">Fail</Badge>
      default:
        return <Badge variant="outline">Pending</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Controls</h1>
          <p className="text-muted-foreground">
            Financial controls monitoring and compliance validation
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button>
            <Play className="mr-2 h-4 w-4" />
            Run All Checks
          </Button>
        </div>
      </div>

      {/* Control Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rules</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{controlRules.length}</div>
            <p className="text-xs text-muted-foreground">
              Active control rules
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Passing</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {controlResults.filter(r => r.status === "ok").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Rules passing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warnings</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {controlResults.filter(r => r.status === "warn").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Rules with warnings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failing</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {controlResults.filter(r => r.status === "fail").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Rules failing
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="checks">Control Checks</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="rules">Rule Management</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="checks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Run Control Check</CardTitle>
              <CardDescription>
                Execute specific control rules for validation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="rule-select">Select Rule</Label>
                  <select 
                    id="rule-select"
                    value={selectedRule}
                    onChange={(e) => setSelectedRule(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">Choose a rule...</option>
                    {controlRules.map((rule) => (
                      <option key={rule.id} value={rule.id}>
                        {rule.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="period-select">Period</Label>
                  <Input 
                    id="period-select"
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    placeholder="2025-01"
                  />
                </div>
              </div>
              <Button 
                className="w-full" 
                disabled={!selectedRule}
              >
                <Play className="mr-2 h-4 w-4" />
                Run Control Check
              </Button>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {controlRules.map((rule) => (
              <Card key={rule.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{rule.name}</CardTitle>
                    {getStatusIcon(rule.status)}
                  </div>
                  <CardDescription>{rule.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Category:</span>
                    <Badge variant="outline">{rule.category}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Frequency:</span>
                    <span>{rule.frequency}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Last Run:</span>
                    <span>{rule.last_run}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    {getStatusBadge(rule.status)}
                    <Button size="sm" variant="outline">
                      <Play className="h-3 w-3 mr-1" />
                      Run
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <div className="space-y-4">
            {controlResults.map((result) => (
              <Card key={result.rule_id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-medium">{result.rule_name}</h4>
                        {getStatusIcon(result.status)}
                        {getStatusBadge(result.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {result.details}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Run at: {new Date(result.run_time).toLocaleString()}
                      </p>
                      {result.evidence_links.length > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Evidence:</span>
                          {result.evidence_links.map((link, index) => (
                            <Button key={index} size="sm" variant="outline">
                              <FileText className="h-3 w-3 mr-1" />
                              View {index + 1}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Control Rule Management</CardTitle>
              <CardDescription>
                Manage and configure financial control rules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Settings className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-medium">Rule Management</h3>
                <p className="text-sm text-muted-foreground">
                  Advanced rule configuration coming soon
                </p>
                <Button className="mt-4" disabled>
                  <Settings className="mr-2 h-4 w-4" />
                  Configure Rules
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Control Settings</CardTitle>
              <CardDescription>
                Configure control check frequency and thresholds
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="check-frequency">Default Check Frequency</Label>
                  <select 
                    id="check-frequency"
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="alert-threshold">Alert Threshold</Label>
                  <Input 
                    id="alert-threshold"
                    placeholder="15"
                    type="number"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Percentage variance threshold for alerts
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="auto-run"
                    className="rounded"
                  />
                  <Label htmlFor="auto-run">Enable automatic control checks</Label>
                </div>
              </div>
              <Button>
                <Settings className="mr-2 h-4 w-4" />
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}













