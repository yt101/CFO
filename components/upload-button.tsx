"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload } from "lucide-react"
import { useRouter } from "next/navigation"

export function UploadButton() {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [entityName, setEntityName] = useState("")
  const [entityType, setEntityType] = useState<"1040" | "1120">("1040")
  const [taxYear, setTaxYear] = useState(new Date().getFullYear() - 1)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("entityName", entityName)
      formData.append("entityType", entityType)
      formData.append("taxYear", taxYear.toString())

      const response = await fetch("/api/returns/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Upload failed" }))
        throw new Error(errorData.error || "Upload failed")
      }

      const data = await response.json()
      
      // Close dialog
      setOpen(false)
      
      // Reset form
      setFile(null)
      setEntityName("")
      setEntityType("1040")
      
      // Show success message
      if (data.demo) {
        alert(`✅ Upload successful!\n\n📊 Demo Mode Active:\nYour file "${entityName}" was received and validated.\n\nIn demo mode, uploads are simulated to demonstrate the platform without requiring database setup.\n\n🎯 To see analysis results:\nClick on the sample returns in the Tax Returns section to explore:\n• Working capital metrics (DSO, DPO, DIO, CCC)\n• Cash flow forecasts\n• Optimization opportunities\n• Tax savings recommendations\n\n💡 To enable real processing:\nConfigure your Supabase database in .env.local`)
        router.push("/dashboard/returns")
      } else {
        router.push(`/dashboard/returns/${data.returnId}`)
      }
      
      router.refresh()
    } catch (error) {
      console.error("Upload error:", error)
      const message = error instanceof Error ? error.message : "Failed to upload return"
      alert(`❌ Upload failed: ${message}\n\nPlease check your file and try again.`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Upload Return
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Tax Return</DialogTitle>
          <DialogDescription>Upload a 1040 or 1120 tax return in PDF or XML format</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="entityName">Entity Name</Label>
            <Input
              id="entityName"
              placeholder="Company or Individual Name"
              value={entityName}
              onChange={(e) => setEntityName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="entityType">Return Type</Label>
            <Select value={entityType} onValueChange={(value: "1040" | "1120") => setEntityType(value)}>
              <SelectTrigger id="entityType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1040">Form 1040 (Individual)</SelectItem>
                <SelectItem value="1120">Form 1120 (Corporation)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="taxYear">Tax Year</Label>
            <Input
              id="taxYear"
              type="number"
              min="2000"
              max={new Date().getFullYear()}
              value={taxYear}
              onChange={(e) => setTaxYear(Number.parseInt(e.target.value))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">File</Label>
            <Input
              id="file"
              type="file"
              accept=".pdf,.xml"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              required
            />
            <p className="text-xs text-muted-foreground">Supported formats: PDF, XML (MeF)</p>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
