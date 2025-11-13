"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Download, FileText, Table, Mail, Calendar, Settings } from "lucide-react"

interface ExportDialogProps {
  returnId?: string
  returnName?: string
}

export function ExportDialog({ returnId, returnName }: ExportDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedFormat, setSelectedFormat] = useState<"pdf" | "excel">("pdf")
  const [selectedSections, setSelectedSections] = useState<string[]>([
    "executive-summary",
    "kpi-analysis",
    "opportunities",
    "cash-forecast"
  ])

  const exportOptions = [
    {
      id: "pdf",
      name: "PDF Report",
      description: "Comprehensive PDF report with charts and analysis",
      icon: FileText,
      features: ["Executive Summary", "KPI Analysis", "Opportunities", "Cash Forecast", "Charts & Graphs"]
    },
    {
      id: "excel",
      name: "Excel Workbook",
      description: "Detailed Excel workbook with raw data and calculations",
      icon: Table,
      features: ["Raw Data", "Calculations", "Pivot Tables", "Charts", "Formulas"]
    }
  ]

  const sections = [
    { id: "executive-summary", name: "Executive Summary", description: "High-level overview and key findings" },
    { id: "kpi-analysis", name: "KPI Analysis", description: "Working capital metrics and trends" },
    { id: "opportunities", name: "Optimization Opportunities", description: "AI-identified improvement opportunities" },
    { id: "cash-forecast", name: "Cash Flow Forecast", description: "13-week cash flow projections" },
    { id: "benchmarks", name: "Industry Benchmarks", description: "Comparison with industry standards" },
    { id: "recommendations", name: "Recommendations", description: "Actionable next steps" }
  ]

  const handleExport = async () => {
    // Simulate export process
    console.log("Exporting...", {
      format: selectedFormat,
      sections: selectedSections,
      returnId,
      returnName
    })
    
    // In a real implementation, this would call an API endpoint
    // that generates and downloads the file
    setIsOpen(false)
  }

  const toggleSection = (sectionId: string) => {
    setSelectedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Export Report</DialogTitle>
          <DialogDescription>
            Generate and download comprehensive reports in your preferred format
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Format Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Select Format</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {exportOptions.map((option) => (
                <Card 
                  key={option.id}
                  className={`cursor-pointer transition-all ${
                    selectedFormat === option.id 
                      ? "ring-2 ring-primary border-primary" 
                      : "hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedFormat(option.id as "pdf" | "excel")}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <option.icon className="h-6 w-6 text-primary" />
                      <div>
                        <CardTitle className="text-base">{option.name}</CardTitle>
                        <CardDescription className="text-sm">{option.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">Includes:</p>
                      <div className="space-y-1">
                        {option.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2 text-xs">
                            <div className="w-1 h-1 bg-primary rounded-full" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Section Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Select Sections</h3>
            <div className="grid gap-3">
              {sections.map((section) => (
                <div 
                  key={section.id}
                  className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all ${
                    selectedSections.includes(section.id)
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => toggleSection(section.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                      selectedSections.includes(section.id)
                        ? "border-primary bg-primary"
                        : "border-muted-foreground"
                    }`}>
                      {selectedSections.includes(section.id) && (
                        <div className="w-2 h-2 bg-white rounded-sm" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{section.name}</p>
                      <p className="text-sm text-muted-foreground">{section.description}</p>
                    </div>
                  </div>
                  {selectedSections.includes(section.id) && (
                    <Badge variant="secondary">Selected</Badge>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Export Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Export Options</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Delivery
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground">
                    Receive the report via email when ready
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Schedule Export
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground">
                    Set up recurring exports
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleExport} disabled={selectedSections.length === 0}>
              <Download className="mr-2 h-4 w-4" />
              Export {selectedFormat.toUpperCase()}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

