"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Download,
  FileText,
  FileSpreadsheet,
  Loader2,
  CheckCircle,
  Calendar,
  DollarSign,
  TrendingUp,
  Target
} from "lucide-react"

interface ExportReportModalProps {
  taxData?: any
}

export function ExportReportModal({ taxData }: ExportReportModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel'>('pdf')
  const [selectedSections, setSelectedSections] = useState({
    executiveSummary: true,
    financialAnalysis: true,
    optimizationActions: true,
    aiInsights: true,
    recommendations: true,
    scheduleData: false
  })

  const handleSectionToggle = (section: keyof typeof selectedSections) => {
    setSelectedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handleExport = async () => {
    setIsExporting(true)
    
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsExporting(false)
    setIsOpen(false)
    
    // In a real implementation, this would trigger the actual export
    console.log('Exporting report with:', {
      format: exportFormat,
      sections: selectedSections,
      taxData
    })
  }

  const getSelectedSectionsCount = () => {
    return Object.values(selectedSections).filter(Boolean).length
  }

  const generateReportPreview = () => {
    const sections = []
    
    if (selectedSections.executiveSummary) {
      sections.push({
        title: "Executive Summary",
        description: "Key findings and recommendations overview",
        icon: <TrendingUp className="h-4 w-4" />
      })
    }
    
    if (selectedSections.financialAnalysis) {
      sections.push({
        title: "Financial Analysis",
        description: "Ratio analysis and working capital metrics",
        icon: <DollarSign className="h-4 w-4" />
      })
    }
    
    if (selectedSections.optimizationActions) {
      sections.push({
        title: "Optimization Actions",
        description: "Prioritized action items with timelines",
        icon: <Target className="h-4 w-4" />
      })
    }
    
    if (selectedSections.aiInsights) {
      sections.push({
        title: "AI Insights",
        description: "Intelligent recommendations and opportunities",
        icon: <TrendingUp className="h-4 w-4" />
      })
    }
    
    if (selectedSections.recommendations) {
      sections.push({
        title: "Recommendations",
        description: "Strategic recommendations for next year",
        icon: <Calendar className="h-4 w-4" />
      })
    }
    
    if (selectedSections.scheduleData) {
      sections.push({
        title: "Schedule Data",
        description: "Detailed Schedule L, M-1, M-2 analysis",
        icon: <FileText className="h-4 w-4" />
      })
    }
    
    return sections
  }

  const previewSections = generateReportPreview()

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Export Tax Optimization Report</DialogTitle>
          <DialogDescription>
            Generate a comprehensive report with your tax analysis and optimization recommendations.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Export Format</Label>
            <div className="grid grid-cols-2 gap-3">
              <Card 
                className={`cursor-pointer transition-all ${
                  exportFormat === 'pdf' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => setExportFormat('pdf')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-red-500" />
                    <div>
                      <h4 className="font-semibold">PDF Report</h4>
                      <p className="text-sm text-muted-foreground">Executive summary format</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card 
                className={`cursor-pointer transition-all ${
                  exportFormat === 'excel' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => setExportFormat('excel')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="h-8 w-8 text-green-500" />
                    <div>
                      <h4 className="font-semibold">Excel Workbook</h4>
                      <p className="text-sm text-muted-foreground">Detailed analysis with data</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Section Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Report Sections</Label>
            <div className="space-y-3">
              {Object.entries(selectedSections).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-3">
                  <Checkbox
                    id={key}
                    checked={value}
                    onCheckedChange={() => handleSectionToggle(key as keyof typeof selectedSections)}
                  />
                  <Label htmlFor={key} className="flex-1">
                    <div className="capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                  </Label>
                </div>
              ))}
            </div>
            <div className="text-sm text-muted-foreground">
              {getSelectedSectionsCount()} sections selected
            </div>
          </div>

          {/* Report Preview */}
          {previewSections.length > 0 && (
            <div className="space-y-3">
              <Label className="text-base font-medium">Report Preview</Label>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    AI 1120 Tax Optimization Report
                  </CardTitle>
                  <CardDescription>
                    Generated on {new Date().toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {previewSections.map((section, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        {section.icon}
                        <span className="font-medium">{section.title}</span>
                        <span className="text-muted-foreground">- {section.description}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Summary Stats */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Potential Savings:</span>
                  <div className="font-semibold">
                    ${taxData?.optimizationActions?.reduce((sum, action) => sum + action.benefit, 0).toLocaleString() || '0'}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Actions Identified:</span>
                  <div className="font-semibold">
                    {taxData?.optimizationActions?.length || 0}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleExport}
              disabled={isExporting || getSelectedSectionsCount() === 0}
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Report...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export {exportFormat.toUpperCase()}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}





























