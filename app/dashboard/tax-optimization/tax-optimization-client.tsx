"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { AnalysisDashboard } from "@/components/1120-analysis-dashboard"
import { Sidebar } from "@/components/sidebar"
import { FileUploadModal } from "./file-upload-modal"
import PersonalTaxPlanning from "./personal-tax-planning"
import type { Form1120Data } from "@/lib/ai/1120-advisor-engine"
import { Upload } from "lucide-react"

interface TaxOptimizationClientProps {
  userContext: any
}

export function TaxOptimizationClient({ userContext }: TaxOptimizationClientProps) {
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState<Form1120Data | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showUploadModal, setShowUploadModal] = useState(false)
  
  const activeTab = searchParams.get('tab') || 'corporate'

  useEffect(() => {
    // Check if we have uploaded data in localStorage
    const savedData = localStorage.getItem('form1120Data')
    if (savedData) {
      try {
        setFormData(JSON.parse(savedData))
      } catch (error) {
        console.error('Error parsing saved data:', error)
      }
    }
    setIsLoading(false)
  }, [])

  const handleUploadComplete = (files: File[]) => {
    // Process the uploaded files
    if (files.length > 0) {
      processUploadedFiles(files)
    }
    setShowUploadModal(false)
  }

  const processUploadedFiles = async (files: File[]) => {
    try {
      setIsLoading(true)
      
      // For now, we'll use the mock data from the advisor engine
      // In production, this would process the actual uploaded files
      const { Form1120AdvisorEngine } = await import("@/lib/ai/1120-advisor-engine")
      const advisorEngine = new Form1120AdvisorEngine()
      
      // Simulate processing the first file
      const processedData = await advisorEngine.importFromExcel(files[0])
      
      // Save to localStorage for persistence
      localStorage.setItem('form1120Data', JSON.stringify(processedData))
      setFormData(processedData)
      
    } catch (error) {
      console.error('Error processing files:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto bg-gray-50/50">
            <div className="p-6">
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading tax optimization data...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto bg-gray-50/50">
          <div className="p-6 space-y-6">
            {activeTab === 'personal' ? (
              // Show Personal Tax Planning
              <PersonalTaxPlanning />
            ) : (
              // Show Corporate Tax Optimization
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">Tax Optimization</h1>
                    <p className="text-gray-600 mt-2">
                      AI-powered analysis and optimization for Form 1120 tax returns
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowUploadModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Upload className="h-4 w-4" />
                      Upload 1120 Data
                    </button>
                  </div>
                </div>
                
                {formData ? (
                  // Show the analysis dashboard with real data
                  <AnalysisDashboard 
                    formData={formData}
                    onOptimizationClick={(opportunityId) => {
                      console.log('Optimization clicked:', opportunityId)
                    }}
                  />
                ) : (
                  // Show upload prompt
                  <div className="text-center py-12">
                    <div className="max-w-md mx-auto">
                      <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Upload Your 1120 Tax Return Data
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Upload your Form 1120 data to get AI-powered tax optimization insights and working capital analysis.
                      </p>
                      <button
                        onClick={() => setShowUploadModal(true)}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Upload Files
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      <FileUploadModal 
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUploadComplete={handleUploadComplete}
      />
    </div>
  )
}
