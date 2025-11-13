"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Upload,
  FileText,
  FileSpreadsheet,
  File,
  CheckCircle,
  AlertCircle,
  X,
  Loader2
} from "lucide-react"

interface FileUploadModalProps {
  onUploadComplete?: (files: File[]) => void
  isOpen?: boolean
  onClose?: () => void
}

export function FileUploadModal({ onUploadComplete, isOpen: externalIsOpen, onClose }: FileUploadModalProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [uploadStatus, setUploadStatus] = useState<Record<string, 'pending' | 'uploading' | 'processing' | 'completed' | 'error'>>({})

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      ...file,
      id: Math.random().toString(36).substr(2, 9)
    }))
    
    setUploadedFiles(prev => [...prev, ...newFiles])
    
    // Initialize upload status
    const statusUpdates = {}
    newFiles.forEach(file => {
      statusUpdates[file.id] = 'pending'
    })
    setUploadStatus(prev => ({ ...prev, ...statusUpdates }))
    
    // Simulate upload process
    newFiles.forEach(file => {
      simulateUpload(file)
    })
  }, [])

  const simulateUpload = async (file: File) => {
    // Simulate upload progress
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 100))
      setUploadProgress(prev => ({ ...prev, [file.id]: progress }))
      
      if (progress === 50) {
        setUploadStatus(prev => ({ ...prev, [file.id]: 'processing' }))
      }
    }
    
    setUploadStatus(prev => ({ ...prev, [file.id]: 'completed' }))
  }

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId))
    setUploadProgress(prev => {
      const newProgress = { ...prev }
      delete newProgress[fileId]
      return newProgress
    })
    setUploadStatus(prev => {
      const newStatus = { ...prev }
      delete newStatus[fileId]
      return newStatus
    })
  }

  const handleComplete = () => {
    if (uploadedFiles.length > 0) {
      onUploadComplete?.(uploadedFiles)
    }
    if (onClose) {
      onClose()
    } else {
      setInternalIsOpen(false)
    }
    setUploadedFiles([])
    setUploadProgress({})
    setUploadStatus({})
  }

  const handleClose = () => {
    if (onClose) {
      onClose()
    } else {
      setInternalIsOpen(false)
    }
    setUploadedFiles([])
    setUploadProgress({})
    setUploadStatus({})
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
      'application/xml': ['.xml']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true
  })

  const getFileIcon = (file: File) => {
    if (file.type === 'application/pdf') return <FileText className="h-8 w-8 text-red-500" />
    if ((file.type && (file.type.includes('spreadsheet') || file.type.includes('excel'))) || (file.name && file.name.endsWith('.csv'))) {
      return <FileSpreadsheet className="h-8 w-8 text-green-500" />
    }
    return <File className="h-8 w-8 text-gray-500" />
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Completed</Badge>
      case 'processing':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Processing</Badge>
      case 'error':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Error</Badge>
      default:
        return <Badge variant="outline">Pending</Badge>
    }
  }

  const allCompleted = uploadedFiles.every(file => uploadStatus[file.id] === 'completed')
  const hasFiles = uploadedFiles.length > 0

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      {!externalIsOpen && (
        <DialogTrigger asChild>
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Upload 1120 Return
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload Form 1120 Tax Return</DialogTitle>
          <DialogDescription>
            Upload your corporate tax return files for AI analysis. Supported formats: PDF, Excel, CSV, XML.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Dropzone */}
          <Card>
            <CardContent className="p-6">
              <div
                {...getRootProps()}
                className={`
                  border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                  ${isDragActive 
                    ? 'border-blue-400 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                  }
                `}
              >
                <input {...getInputProps()} />
                <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                {isDragActive ? (
                  <p className="text-lg font-medium text-blue-600">
                    Drop the files here...
                  </p>
                ) : (
                  <div>
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      Drag & drop your 1120 files here
                    </p>
                    <p className="text-sm text-gray-500">
                      or click to browse files
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      PDF, Excel (.xlsx, .xls), CSV, XML • Max 10MB per file
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Uploaded Files */}
          {hasFiles && (
            <div className="space-y-2">
              <h4 className="font-medium">Uploaded Files</h4>
              {uploadedFiles.map((file) => (
                <Card key={file.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        {getFileIcon(file)}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{file.name || 'Unknown file'}</p>
                          <p className="text-sm text-gray-500">
                            {((file.size || 0) / 1024 / 1024).toFixed(2)} MB
                          </p>
                          {uploadStatus[file.id] === 'processing' && (
                            <div className="mt-2">
                              <Progress value={uploadProgress[file.id]} className="h-2" />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(uploadStatus[file.id])}
                        {getStatusBadge(uploadStatus[file.id])}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(file.id)}
                          disabled={uploadStatus[file.id] === 'processing'}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleComplete}
              disabled={!hasFiles || !allCompleted}
            >
              {allCompleted ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete Upload
                </>
              ) : (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}






