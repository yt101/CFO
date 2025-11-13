"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  FileCheck, 
  Download, 
  Calendar,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  Database,
  Shield,
  Users
} from "lucide-react"

export default function AuditPage() {
  const [activeTab, setActiveTab] = useState("export")
  const [selectedPeriod, setSelectedPeriod] = useState("2025-01")
  const [selectedScope, setSelectedScope] = useState(["gl", "bank", "ap", "ar", "controls"])
  const [isExporting, setIsExporting] = useState(false)

  const auditExports = [
    {
      id: "1",
      period: "2025-01",
      scope: ["gl", "bank", "ap", "ar", "controls"],
      status: "completed",
      created: "2025-01-16T10:30:00Z",
      file_url: "https://api.cfo.ai/audit/export-2025-01.zip",
      items: [
        "General Ledger - January 2025",
        "Bank Statements - January 2025", 
        "Accounts Payable - January 2025",
        "Accounts Receivable - January 2025",
        "Control Test Results - January 2025"
      ]
    },
    {
      id: "2",
      period: "2024-12",
      scope: ["gl", "bank", "controls"],
      status: "completed",
      created: "2025-01-01T09:15:00Z",
      file_url: "https://api.cfo.ai/audit/export-2024-12.zip",
      items: [
        "General Ledger - December 2024",
        "Bank Statements - December 2024",
        "Control Test Results - December 2024"
      ]
    },
    {
      id: "3",
      period: "2025-01",
      scope: ["gl", "bank"],
      status: "in_progress",
      created: "2025-01-16T14:45:00Z",
      file_url: null,
      items: []
    }
  ]

  const auditItems = [
    {
      type: "General Ledger",
      description: "Complete general ledger with all journal entries",
      icon: Database,
      status: "ready"
    },
    {
      type: "Bank Statements",
      description: "Bank reconciliation and statement data",
      icon: FileText,
      status: "ready"
    },
    {
      type: "Accounts Payable",
      description: "AP aging and vendor payment records",
      icon: Users,
      status: "ready"
    },
    {
      type: "Accounts Receivable",
      description: "AR aging and customer payment records",
      icon: Users,
      status: "ready"
    },
    {
      type: "Control Tests",
      description: "Financial control test results and evidence",
      icon: Shield,
      status: "ready"
    },
    {
      type: "Payroll Records",
      description: "Employee payroll and benefits data",
      icon: Users,
      status: "pending"
    }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "in_progress":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "pending":
        return <AlertTriangle className="h-4 w-4 text-gray-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>
      case "in_progress":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">In Progress</Badge>
      case "pending":
        return <Badge variant="outline">Pending</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const handleExport = async () => {
    setIsExporting(true)
    // Simulate export process
    setTimeout(() => {
      setIsExporting(false)
      // In real implementation, this would trigger the actual export
    }, 2000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit</h1>
          <p className="text-muted-foreground">
            Audit trail management and compliance reporting
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? "Exporting..." : "Export Bundle"}
          </Button>
        </div>
      </div>

      {/* Audit Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Exports</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{auditExports.length}</div>
            <p className="text-xs text-muted-foreground">
              Audit bundles created
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {auditExports.filter(e => e.status === "completed").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Ready for download
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {auditExports.filter(e => e.status === "in_progress").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently processing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Items</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{auditItems.length}</div>
            <p className="text-xs text-muted-foreground">
              Available data sources
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="export">Export Bundle</TabsTrigger>
          <TabsTrigger value="history">Export History</TabsTrigger>
          <TabsTrigger value="items">Data Items</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create Audit Export</CardTitle>
              <CardDescription>
                Generate a comprehensive audit bundle for a specific period
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="period">Period</Label>
                  <Input 
                    id="period"
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    placeholder="2025-01"
                  />
                </div>
                <div>
                  <Label>Export Scope</Label>
                  <div className="mt-2 space-y-2">
                    {auditItems.map((item) => (
                      <div key={item.type} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={item.type.toLowerCase().replace(/\s+/g, '-')}
                          checked={selectedScope.includes(item.type.toLowerCase().replace(/\s+/g, '-'))}
                          onChange={(e) => {
                            const value = item.type.toLowerCase().replace(/\s+/g, '-')
                            if (e.target.checked) {
                              setSelectedScope([...selectedScope, value])
                            } else {
                              setSelectedScope(selectedScope.filter(s => s !== value))
                            }
                          }}
                          className="rounded"
                        />
                        <Label htmlFor={item.type.toLowerCase().replace(/\s+/g, '-')} className="text-sm">
                          {item.type}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={handleExport} 
                disabled={isExporting || selectedScope.length === 0}
                className="w-full"
              >
                <Download className="mr-2 h-4 w-4" />
                {isExporting ? "Creating Export..." : "Create Export Bundle"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="space-y-4">
            {auditExports.map((exportItem) => (
              <Card key={exportItem.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-medium">
                          Audit Export - {exportItem.period}
                        </h4>
                        {getStatusIcon(exportItem.status)}
                        {getStatusBadge(exportItem.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Scope: {exportItem.scope.join(", ")}</span>
                        <span>Created: {new Date(exportItem.created).toLocaleString()}</span>
                      </div>
                      {exportItem.items.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Included Items:</p>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {exportItem.items.map((item, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <FileText className="h-3 w-3" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {exportItem.file_url && (
                        <Button size="sm">
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="items" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {auditItems.map((item) => (
              <Card key={item.type}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <item.icon className="h-5 w-5" />
                      {item.type}
                    </CardTitle>
                    <Badge variant={item.status === "ready" ? "default" : "secondary"}>
                      {item.status}
                    </Badge>
                  </div>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Data availability
                    </span>
                    <Button size="sm" variant="outline" disabled={item.status !== "ready"}>
                      <FileText className="h-3 w-3 mr-1" />
                      Preview
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit Settings</CardTitle>
              <CardDescription>
                Configure audit export preferences and retention policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="retention-period">Data Retention Period</Label>
                  <select 
                    id="retention-period"
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="1">1 year</option>
                    <option value="3">3 years</option>
                    <option value="5">5 years</option>
                    <option value="7">7 years</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="export-format">Default Export Format</Label>
                  <select 
                    id="export-format"
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="zip">ZIP Archive</option>
                    <option value="pdf">PDF Bundle</option>
                    <option value="excel">Excel Workbook</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="auto-export"
                    className="rounded"
                  />
                  <Label htmlFor="auto-export">Enable monthly auto-export</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="encrypt-exports"
                    className="rounded"
                  />
                  <Label htmlFor="encrypt-exports">Encrypt export files</Label>
                </div>
              </div>
              <Button>
                <FileCheck className="mr-2 h-4 w-4" />
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}













