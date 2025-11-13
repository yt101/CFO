"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  FileText, 
  Download, 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  BarChart3,
  PieChart,
  FileSpreadsheet,
  CheckCircle,
  Clock
} from "lucide-react"

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("q4-2023")
  const [selectedFormat, setSelectedFormat] = useState("pdf")
  const [isGenerating, setIsGenerating] = useState(false)

  const reportTemplates = [
    {
      id: "financial-summary",
      name: "Financial Summary",
      description: "Complete P&L, Balance Sheet, and Cash Flow statements",
      icon: FileText,
      lastGenerated: "2 days ago",
      status: "ready"
    },
    {
      id: "investor-deck",
      name: "Investor Deck",
      description: "Executive summary with key metrics and growth trends",
      icon: TrendingUp,
      lastGenerated: "1 week ago",
      status: "ready"
    },
    {
      id: "cash-forecast",
      name: "13-Week Cash Forecast",
      description: "Detailed cash flow projections and runway analysis",
      icon: DollarSign,
      lastGenerated: "3 days ago",
      status: "ready"
    },
    {
      id: "kpi-dashboard",
      name: "KPI Dashboard",
      description: "DSO, DPO, DIO, and other operational metrics",
      icon: BarChart3,
      lastGenerated: "1 day ago",
      status: "ready"
    },
    {
      id: "variance-analysis",
      name: "Variance Analysis",
      description: "Budget vs actual with top drivers identified",
      icon: PieChart,
      lastGenerated: "5 days ago",
      status: "ready"
    },
    {
      id: "custom-export",
      name: "Custom Data Export",
      description: "Export raw data to Excel for custom analysis",
      icon: FileSpreadsheet,
      lastGenerated: "Never",
      status: "new"
    }
  ]

  const recentReports = [
    {
      id: "1",
      name: "Q4 2023 Financial Summary",
      type: "Financial Summary",
      generatedAt: "2024-01-15 10:30 AM",
      format: "PDF",
      size: "2.4 MB"
    },
    {
      id: "2",
      name: "December 2023 Investor Deck",
      type: "Investor Deck",
      generatedAt: "2024-01-10 14:20 PM",
      format: "PDF",
      size: "5.1 MB"
    },
    {
      id: "3",
      name: "13-Week Cash Forecast - Jan 2024",
      type: "Cash Forecast",
      generatedAt: "2024-01-08 09:15 AM",
      format: "Excel",
      size: "890 KB"
    }
  ]

  const handleGenerateReport = async (reportId: string) => {
    setIsGenerating(true)
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsGenerating(false)
    
    // In production, this would trigger actual report generation
    console.log(`Generating ${reportId} for ${selectedPeriod} in ${selectedFormat} format`)
    alert(`Report generated successfully! (Demo mode - download would start in production)`)
  }

  const handleDownloadReport = (reportId: string) => {
    console.log(`Downloading report ${reportId}`)
    alert(`Downloading report... (Demo mode - file download would start in production)`)
  }

  return (
    <DashboardLayout
      title="Reports & Exports"
      description="Generate investor-ready financial reports and data exports"
    >
      <div className="space-y-6">
        {/* Report Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Report Configuration</CardTitle>
            <CardDescription>
              Select period and format for report generation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="period">Time Period</Label>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger id="period">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="q4-2023">Q4 2023</SelectItem>
                    <SelectItem value="q3-2023">Q3 2023</SelectItem>
                    <SelectItem value="q2-2023">Q2 2023</SelectItem>
                    <SelectItem value="q1-2023">Q1 2023</SelectItem>
                    <SelectItem value="fy-2023">FY 2023</SelectItem>
                    <SelectItem value="ytd-2024">YTD 2024</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="format">Export Format</Label>
                <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                  <SelectTrigger id="format">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF (Branded)</SelectItem>
                    <SelectItem value="excel">Excel Workbook</SelectItem>
                    <SelectItem value="csv">CSV Data</SelectItem>
                    <SelectItem value="json">JSON API Export</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="branding">Include Branding</Label>
                <Select defaultValue="yes">
                  <SelectTrigger id="branding">
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Company Logo</SelectItem>
                    <SelectItem value="no">Plain Format</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Templates */}
        <Tabs defaultValue="templates" className="space-y-6">
          <TabsList>
            <TabsTrigger value="templates">Report Templates</TabsTrigger>
            <TabsTrigger value="recent">Recent Reports</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {reportTemplates.map((template) => {
                const Icon = template.icon
                return (
                  <Card key={template.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{template.name}</CardTitle>
                            <CardDescription className="text-xs mt-1">
                              {template.description}
                            </CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Last generated:</span>
                          <span className="font-medium">{template.lastGenerated}</span>
                        </div>
                        <Button 
                          onClick={() => handleGenerateReport(template.id)}
                          disabled={isGenerating}
                          className="w-full"
                        >
                          {isGenerating ? (
                            <>
                              <Clock className="mr-2 h-4 w-4 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Download className="mr-2 h-4 w-4" />
                              Generate Report
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="recent" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Reports</CardTitle>
                <CardDescription>
                  Previously generated reports available for download
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentReports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors">
                      <div className="flex items-center gap-4">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{report.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {report.type} • Generated {report.generatedAt}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{report.format}</Badge>
                        <span className="text-sm text-muted-foreground">{report.size}</span>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDownloadReport(report.id)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scheduled" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Scheduled Reports</CardTitle>
                <CardDescription>
                  Automatically generated reports sent via email
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Calendar className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Weekly Financial Summary</div>
                        <div className="text-sm text-muted-foreground">
                          Every Monday at 9:00 AM • Email to: CFO, Founders
                        </div>
                      </div>
                    </div>
                    <Badge variant="default" className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Active
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Calendar className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Monthly Investor Deck</div>
                        <div className="text-sm text-muted-foreground">
                          1st of each month at 8:00 AM • Email to: Investors
                        </div>
                      </div>
                    </div>
                    <Badge variant="default" className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Active
                    </Badge>
                  </div>

                  <Button variant="outline" className="w-full">
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule New Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

































