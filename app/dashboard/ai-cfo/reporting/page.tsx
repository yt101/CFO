"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { 
  FileText, 
  Download, 
  Calendar,
  BarChart3,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Eye,
  Share,
  Clock,
  Plus,
  Trash2,
  Settings
} from "lucide-react"

export default function ReportingPage() {
  const [activeTab, setActiveTab] = useState("mtd")
  const [selectedQuarter, setSelectedQuarter] = useState("2025-Q1")
  const [includeRisks, setIncludeRisks] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedBoardPack, setGeneratedBoardPack] = useState<{
    quarter: string
    generated_at: string
    includes_risks: boolean
  } | null>(null)

  // Custom Report Builder state
  const [customReport, setCustomReport] = useState({
    name: '',
    description: '',
    reportType: 'financial',
    period: 'monthly',
    sections: [] as string[],
    format: 'pdf',
    includeCharts: true,
    includeInsights: true
  })
  const [isGeneratingCustom, setIsGeneratingCustom] = useState(false)
  const [generatedCustomReport, setGeneratedCustomReport] = useState<{
    name: string
    format: string
    downloadUrl?: string
    blob?: Blob
  } | null>(null)
  const [availableSections] = useState([
    { id: 'executive_summary', name: 'Executive Summary', description: 'High-level overview and key metrics' },
    { id: 'financial_performance', name: 'Financial Performance', description: 'P&L, Balance Sheet, Cash Flow' },
    { id: 'kpis', name: 'Key Performance Indicators', description: 'Critical business metrics and trends' },
    { id: 'variance_analysis', name: 'Variance Analysis', description: 'Actual vs Budget comparisons' },
    { id: 'cash_flow', name: 'Cash Flow Analysis', description: 'Detailed cash flow breakdown' },
    { id: 'risk_assessment', name: 'Risk Assessment', description: 'Business risks and mitigation strategies' },
    { id: 'benchmarking', name: 'Benchmarking', description: 'Industry comparisons and performance' },
    { id: 'forecasting', name: 'Forecasting', description: 'Future projections and scenarios' }
  ])

  const mtdData = {
    period: "2025-01",
    pnl: {
      revenue: 750000,
      cogs: 300000,
      gross_profit: 450000,
      opex: 280000,
      ebitda: 170000,
      net_income: 120000
    },
    bs: {
      cash: 1200000,
      ar: 450000,
      inventory: 180000,
      total_assets: 2500000,
      ap: 120000,
      debt: 500000,
      equity: 1880000
    },
    cfs: {
      operating_cash: 150000,
      investing_cash: -50000,
      financing_cash: 0,
      net_cash_change: 100000
    }
  }

  const boardPackStatus = {
    status: "ready",
    last_generated: "2025-01-15T10:30:00Z",
    file_url: "https://api.cfo.ai/reports/board-pack-2025-q1.pptx",
    summary: "Q1 2025 board pack includes financial highlights, key metrics, and risk assessment"
  }

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

  const handleGenerateBoardPack = async () => {
    setIsGenerating(true)
    
    try {
      const response = await fetch('/api/ai-cfo/reporting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generate_board_pack',
          data: {
            quarter: selectedQuarter,
            include_risks: includeRisks
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate board pack')
      }

      // Check if the response is a file download
      const contentType = response.headers.get('content-type')
      if (contentType?.includes('application/vnd.openxmlformats-officedocument.presentationml.presentation')) {
        // Handle file download
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `board-pack-${selectedQuarter}.pptx`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        // Update state to show generated board pack
        setGeneratedBoardPack({
          quarter: selectedQuarter,
          generated_at: new Date().toISOString(),
          includes_risks: includeRisks
        })
        
        toast.success(`Board pack for ${selectedQuarter} generated and downloaded successfully!`)
      } else {
        const result = await response.json()
        if (result.error) {
          throw new Error(result.error)
        }
        toast.success(`Board pack for ${selectedQuarter} generated successfully!`)
      }
      
    } catch (error) {
      console.error('Error generating board pack:', error)
      toast.error("Failed to generate board pack. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadBoardPack = async () => {
    if (!generatedBoardPack) return
    
    try {
      const response = await fetch('/api/ai-cfo/reporting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generate_board_pack',
          data: {
            quarter: generatedBoardPack.quarter,
            include_risks: generatedBoardPack.includes_risks
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to download board pack')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `board-pack-${generatedBoardPack.quarter}.pptx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast.success("Board pack downloaded successfully!")
      
    } catch (error) {
      console.error('Error downloading board pack:', error)
      toast.error("Failed to download board pack. Please try again.")
    }
  }

  const handleCustomReportChange = (field: string, value: any) => {
    setCustomReport(prev => ({ ...prev, [field]: value }))
  }

  const handleSectionToggle = (sectionId: string) => {
    setCustomReport(prev => ({
      ...prev,
      sections: prev.sections.includes(sectionId)
        ? prev.sections.filter(id => id !== sectionId)
        : [...prev.sections, sectionId]
    }))
  }

  const handleGenerateCustomReport = async () => {
    if (!customReport.name.trim()) {
      toast.error("Please enter a report name")
      return
    }

    if (customReport.sections.length === 0) {
      toast.error("Please select at least one section")
      return
    }

    setIsGeneratingCustom(true)
    
    try {
      const response = await fetch('/api/ai-cfo/reporting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generate_custom_report',
          data: {
            ...customReport,
            generated_at: new Date().toISOString()
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate custom report')
      }

      // Check if the response is a file download (for PPTX format)
      const contentType = response.headers.get('content-type')
      console.log('Response content type:', contentType)
      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))
      
      if (contentType?.includes('application/vnd.openxmlformats-officedocument.presentationml.presentation')) {
        // Handle PPTX file download
        const blob = await response.blob()
        console.log('Blob size:', blob.size)
        console.log('Blob type:', blob.type)
        
        // Store the generated report for download
        setGeneratedCustomReport({
          name: customReport.name,
          format: customReport.format,
          blob: blob
        })
        
        toast.success(`Custom report "${customReport.name}" generated successfully! Click the download button to download the file.`)
      } else {
        // Handle other formats (JSON response)
        const result = await response.json()
        
        if (result.download_url) {
          // Store the generated report for download
          setGeneratedCustomReport({
            name: customReport.name,
            format: customReport.format,
            downloadUrl: result.download_url
          })
          
          toast.success(`Custom report "${customReport.name}" generated successfully! Click the download button to download the file.`)
        } else {
          toast.success(`Custom report "${customReport.name}" is being generated. You'll be notified when ready.`)
        }
      }
      
    } catch (error) {
      console.error('Error generating custom report:', error)
      toast.error("Failed to generate custom report. Please try again.")
    } finally {
      setIsGeneratingCustom(false)
    }
  }

  const handleDownloadCustomReport = () => {
    if (!generatedCustomReport) return
    
    console.log('Downloading custom report:', generatedCustomReport)
    
    try {
      if (generatedCustomReport.blob) {
        // Handle blob download (PPTX format)
        console.log('Downloading blob:', generatedCustomReport.blob)
        const url = window.URL.createObjectURL(generatedCustomReport.blob)
        console.log('Created blob URL:', url)
        const a = document.createElement('a')
        a.href = url
        a.download = `${generatedCustomReport.name}-custom-report.${generatedCustomReport.format}`
        a.style.display = 'none'
        document.body.appendChild(a)
        console.log('Triggering download...')
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success("Report downloaded successfully!")
      } else if (generatedCustomReport.downloadUrl) {
        // Handle URL download (other formats) - but prevent external redirects
        if (generatedCustomReport.downloadUrl.startsWith('http')) {
          // For external URLs, open in new tab instead of redirecting
          window.open(generatedCustomReport.downloadUrl, '_blank')
          toast.success("Report opened in new tab!")
        } else {
          // For local URLs, download directly
          const link = document.createElement('a')
          link.href = generatedCustomReport.downloadUrl
          link.download = `${generatedCustomReport.name}-custom-report.${generatedCustomReport.format}`
          link.style.display = 'none'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          toast.success("Report downloaded successfully!")
        }
      }
      
    } catch (error) {
      console.error('Error downloading custom report:', error)
      toast.error("Failed to download report. Please try again.")
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reporting</h1>
          <p className="text-muted-foreground">
            AI-powered financial reporting and board pack generation
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button>
            <FileText className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="mtd">Month-to-Date</TabsTrigger>
          <TabsTrigger value="board-pack">Board Pack</TabsTrigger>
          <TabsTrigger value="custom">Custom Reports</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="mtd" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>P&L Summary</CardTitle>
                <CardDescription>Month-to-date income statement</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Revenue</span>
                  <span className="font-medium">{formatCurrency(mtdData.pnl.revenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">COGS</span>
                  <span className="font-medium">{formatCurrency(mtdData.pnl.cogs)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-sm font-medium">Gross Profit</span>
                  <span className="font-semibold">{formatCurrency(mtdData.pnl.gross_profit)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">OpEx</span>
                  <span className="font-medium">{formatCurrency(mtdData.pnl.opex)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-sm font-medium">EBITDA</span>
                  <span className="font-semibold text-green-600">{formatCurrency(mtdData.pnl.ebitda)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-sm font-medium">Net Income</span>
                  <span className="font-semibold text-green-600">{formatCurrency(mtdData.pnl.net_income)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Balance Sheet</CardTitle>
                <CardDescription>Key balance sheet items</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Assets</h4>
                  <div className="flex justify-between">
                    <span className="text-sm">Cash</span>
                    <span className="font-medium">{formatCurrency(mtdData.bs.cash)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Accounts Receivable</span>
                    <span className="font-medium">{formatCurrency(mtdData.bs.ar)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Inventory</span>
                    <span className="font-medium">{formatCurrency(mtdData.bs.inventory)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-sm font-medium">Total Assets</span>
                    <span className="font-semibold">{formatCurrency(mtdData.bs.total_assets)}</span>
                  </div>
                </div>
                <div className="space-y-2 pt-2 border-t">
                  <h4 className="text-sm font-medium">Liabilities</h4>
                  <div className="flex justify-between">
                    <span className="text-sm">Accounts Payable</span>
                    <span className="font-medium">{formatCurrency(mtdData.bs.ap)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Debt</span>
                    <span className="font-medium">{formatCurrency(mtdData.bs.debt)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-sm font-medium">Equity</span>
                    <span className="font-semibold">{formatCurrency(mtdData.bs.equity)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cash Flow</CardTitle>
                <CardDescription>Cash flow statement summary</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Operating Cash</span>
                  <span className="font-medium text-green-600">{formatCurrency(mtdData.cfs.operating_cash)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Investing Cash</span>
                  <span className="font-medium text-red-600">{formatCurrency(mtdData.cfs.investing_cash)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Financing Cash</span>
                  <span className="font-medium">{formatCurrency(mtdData.cfs.financing_cash)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-sm font-medium">Net Cash Change</span>
                  <span className="font-semibold text-green-600">{formatCurrency(mtdData.cfs.net_cash_change)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Key Metrics & Trends</CardTitle>
              <CardDescription>AI-generated insights and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <h4 className="font-medium">Performance Indicators</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 border rounded">
                      <span className="text-sm">Revenue Growth</span>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-green-500" />
                        <span className="text-sm font-medium text-green-600">+12%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-2 border rounded">
                      <span className="text-sm">Gross Margin</span>
                      <span className="text-sm font-medium">60%</span>
                    </div>
                    <div className="flex justify-between items-center p-2 border rounded">
                      <span className="text-sm">EBITDA Margin</span>
                      <span className="text-sm font-medium">22.7%</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium">Efficiency Metrics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 border rounded">
                      <span className="text-sm">AR Days</span>
                      <span className="text-sm font-medium">45 days</span>
                    </div>
                    <div className="flex justify-between items-center p-2 border rounded">
                      <span className="text-sm">AP Days</span>
                      <span className="text-sm font-medium">30 days</span>
                    </div>
                    <div className="flex justify-between items-center p-2 border rounded">
                      <span className="text-sm">Inventory Turnover</span>
                      <span className="text-sm font-medium">6.2x</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="board-pack" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Board Pack Generator</CardTitle>
              <CardDescription>
                Generate comprehensive board presentation packages
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="quarter">Quarter</Label>
                  <select 
                    id="quarter"
                    value={selectedQuarter}
                    onChange={(e) => setSelectedQuarter(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="2025-Q1">Q1 2025</option>
                    <option value="2025-Q2">Q2 2025</option>
                    <option value="2025-Q3">Q3 2025</option>
                    <option value="2025-Q4">Q4 2025</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="include-risks"
                    checked={includeRisks}
                    onChange={(e) => setIncludeRisks(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="include-risks">Include Risk Assessment</Label>
                </div>
              </div>
              <Button 
                className="w-full" 
                onClick={handleGenerateBoardPack}
                disabled={isGenerating}
              >
                <FileText className="mr-2 h-4 w-4" />
                {isGenerating ? "Generating Board Pack..." : "Generate Board Pack"}
              </Button>
            </CardContent>
          </Card>

          {boardPackStatus.status === "ready" && (
            <Card>
              <CardHeader>
                <CardTitle>Latest Board Pack</CardTitle>
                <CardDescription>
                  Generated on {new Date(boardPackStatus.last_generated).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {boardPackStatus.summary}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button onClick={handleDownloadBoardPack}>
                      <Download className="mr-2 h-4 w-4" />
                      Download PPTX
                    </Button>
                    <Button variant="outline">
                      <Eye className="mr-2 h-4 w-4" />
                      Preview
                    </Button>
                    <Button variant="outline">
                      <Share className="mr-2 h-4 w-4" />
                      Share
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom Report Builder</CardTitle>
              <CardDescription>
                Create custom financial reports with AI assistance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Report Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Report Configuration</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="report-name">Report Name</Label>
                    <Input 
                      id="report-name"
                      placeholder="e.g., Monthly Executive Dashboard"
                      value={customReport.name}
                      onChange={(e) => handleCustomReportChange('name', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="report-type">Report Type</Label>
                    <Select 
                      value={customReport.reportType} 
                      onValueChange={(value) => handleCustomReportChange('reportType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="financial">Financial Report</SelectItem>
                        <SelectItem value="operational">Operational Report</SelectItem>
                        <SelectItem value="executive">Executive Summary</SelectItem>
                        <SelectItem value="compliance">Compliance Report</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="report-period">Period</Label>
                    <Select 
                      value={customReport.period} 
                      onValueChange={(value) => handleCustomReportChange('period', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                        <SelectItem value="custom">Custom Period</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="report-format">Output Format</Label>
                    <Select 
                      value={customReport.format} 
                      onValueChange={(value) => handleCustomReportChange('format', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="excel">Excel</SelectItem>
                        <SelectItem value="pptx">PowerPoint</SelectItem>
                        <SelectItem value="html">HTML</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="report-description">Description</Label>
                  <Textarea 
                    id="report-description"
                    placeholder="Brief description of the report purpose and scope..."
                    value={customReport.description}
                    onChange={(e) => handleCustomReportChange('description', e.target.value)}
                    rows={3}
                  />
                </div>
              </div>

              {/* Report Sections */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Select Report Sections</h3>
                <p className="text-sm text-muted-foreground">
                  Choose the sections you want to include in your custom report
                </p>
                <div className="grid gap-3 md:grid-cols-2">
                  {availableSections.map((section) => (
                    <div key={section.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <Checkbox 
                        id={section.id}
                        checked={customReport.sections.includes(section.id)}
                        onCheckedChange={() => handleSectionToggle(section.id)}
                      />
                      <div className="space-y-1">
                        <Label htmlFor={section.id} className="text-sm font-medium">
                          {section.name}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {section.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Report Options */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Report Options</h3>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="include-charts"
                      checked={customReport.includeCharts}
                      onCheckedChange={(checked) => handleCustomReportChange('includeCharts', checked)}
                    />
                    <Label htmlFor="include-charts">Include Charts & Graphs</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="include-insights"
                      checked={customReport.includeInsights}
                      onCheckedChange={(checked) => handleCustomReportChange('includeInsights', checked)}
                    />
                    <Label htmlFor="include-insights">Include AI Insights</Label>
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <div className="pt-4 border-t">
                <Button 
                  className="w-full" 
                  onClick={handleGenerateCustomReport}
                  disabled={isGeneratingCustom}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  {isGeneratingCustom ? "Generating Custom Report..." : "Generate Custom Report"}
                </Button>
              </div>

              {/* Download Section */}
              {generatedCustomReport && (
                <Card className="border-green-200 bg-green-50">
                  <CardHeader>
                    <CardTitle className="text-lg text-green-800">Report Generated Successfully!</CardTitle>
                    <CardDescription className="text-green-600">
                      Your custom report "{generatedCustomReport.name}" is ready for download.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">Report: {generatedCustomReport.name}</div>
                        <div className="text-sm text-muted-foreground">Format: {generatedCustomReport.format.toUpperCase()}</div>
                      </div>
                      <Button onClick={handleDownloadCustomReport} className="bg-green-600 hover:bg-green-700">
                        <Download className="mr-2 h-4 w-4" />
                        Download Report
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Financial Summary</CardTitle>
                <CardDescription>
                  Standard monthly financial report template
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Includes P&L, Balance Sheet, Cash Flow</span>
                    <Badge variant="outline">Standard</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">AI-generated insights</span>
                    <Badge variant="outline">AI Powered</Badge>
                  </div>
                </div>
                <Button className="w-full mt-4">
                  <Download className="mr-2 h-4 w-4" />
                  Use Template
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quarterly Board Report</CardTitle>
                <CardDescription>
                  Comprehensive quarterly board presentation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Executive summary, KPIs, risks</span>
                    <Badge variant="outline">Premium</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Automated chart generation</span>
                    <Badge variant="outline">AI Powered</Badge>
                  </div>
                </div>
                <Button className="w-full mt-4">
                  <Download className="mr-2 h-4 w-4" />
                  Use Template
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}


