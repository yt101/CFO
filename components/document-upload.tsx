"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Upload, 
  FileText, 
  X, 
  CheckCircle, 
  AlertCircle,
  File,
  BarChart3,
  Shield,
  BookOpen,
  TrendingUp,
  Settings
} from "lucide-react"

interface DocumentUploadProps {
  onUpload: (file: File, type: string, title?: string) => Promise<void>
  isUploading?: boolean
}

const documentTypes = [
  { id: 'financial_report', label: 'Financial Report', icon: BarChart3, color: 'bg-blue-100 text-blue-800' },
  { id: 'policy', label: 'Policy', icon: Shield, color: 'bg-green-100 text-green-800' },
  { id: 'procedure', label: 'Procedure', icon: Settings, color: 'bg-purple-100 text-purple-800' },
  { id: 'data_dictionary', label: 'Data Dictionary', icon: BookOpen, color: 'bg-orange-100 text-orange-800' },
  { id: 'analysis', label: 'Analysis', icon: TrendingUp, color: 'bg-red-100 text-red-800' },
  { id: 'other', label: 'Other', icon: File, color: 'bg-gray-100 text-gray-800' }
]

export function DocumentUpload({ onUpload, isUploading = false }: DocumentUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedType, setSelectedType] = useState('financial_report')
  const [customTitle, setCustomTitle] = useState('')
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setCustomTitle(file.name.replace(/\.[^/.]+$/, "")) // Remove file extension
      setUploadStatus('idle')
      setErrorMessage('')
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploadStatus('uploading')
    setErrorMessage('')

    try {
      await onUpload(selectedFile, selectedType, customTitle || undefined)
      setUploadStatus('success')
      setSelectedFile(null)
      setCustomTitle('')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      setUploadStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Upload failed')
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setCustomTitle('')
    setUploadStatus('idle')
    setErrorMessage('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    switch (extension) {
      case 'pdf':
        return <FileText className="h-4 w-4 text-red-500" />
      case 'xlsx':
      case 'xls':
        return <BarChart3 className="h-4 w-4 text-green-500" />
      case 'csv':
        return <BarChart3 className="h-4 w-4 text-blue-500" />
      case 'docx':
      case 'doc':
        return <FileText className="h-4 w-4 text-blue-500" />
      default:
        return <File className="h-4 w-4 text-gray-500" />
    }
  }

  const selectedTypeInfo = documentTypes.find(type => type.id === selectedType)

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Document
        </CardTitle>
        <CardDescription>
          Add financial documents to enhance AI responses with your company data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Select File</label>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              accept=".pdf,.txt,.xlsx,.xls,.csv,.docx,.doc"
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex-1"
            >
              <Upload className="h-4 w-4 mr-2" />
              Choose File
            </Button>
          </div>
        </div>

        {/* Selected File Display */}
        {selectedFile && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              {getFileIcon(selectedFile.name)}
              <div>
                <p className="text-sm font-medium">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveFile}
              disabled={isUploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Document Type Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Document Type</label>
          <div className="grid grid-cols-2 gap-2">
            {documentTypes.map((type) => {
              const Icon = type.icon
              return (
                <Button
                  key={type.id}
                  variant={selectedType === type.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedType(type.id)}
                  disabled={isUploading}
                  className="justify-start"
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {type.label}
                </Button>
              )
            })}
          </div>
        </div>

        {/* Custom Title */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Document Title (Optional)</label>
          <input
            type="text"
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            placeholder="Enter a custom title for this document"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isUploading}
          />
        </div>

        {/* Upload Button */}
        <Button
          onClick={handleUpload}
          disabled={!selectedFile || isUploading || uploadStatus === 'uploading'}
          className="w-full"
        >
          {uploadStatus === 'uploading' ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </>
          )}
        </Button>

        {/* Status Messages */}
        {uploadStatus === 'success' && (
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <CheckCircle className="h-4 w-4" />
            Document uploaded successfully!
          </div>
        )}

        {uploadStatus === 'error' && (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="h-4 w-4" />
            {errorMessage || 'Upload failed. Please try again.'}
          </div>
        )}

        {/* Supported Formats */}
        <div className="text-xs text-gray-500">
          <p>Supported formats: PDF, TXT, XLSX, XLS, CSV, DOCX, DOC</p>
          <p>Maximum file size: 10MB</p>
        </div>
      </CardContent>
    </Card>
  )
}












