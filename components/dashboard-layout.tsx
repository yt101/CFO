"use client"

import { ReactNode } from "react"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Download, Menu } from "lucide-react"
import { ExportDialog } from "@/components/export-dialog"
import { UploadButton } from "@/components/upload-button"

interface DashboardLayoutProps {
  children: ReactNode
  title: string
  description?: string
  actions?: ReactNode
}

export function DashboardLayout({ 
  children, 
  title, 
  description, 
  actions 
}: DashboardLayoutProps) {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b bg-white">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">{title}</h1>
              {description && (
                <p className="text-sm text-muted-foreground hidden md:block">
                  {description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-4">
              {actions || (
                <>
                  <UploadButton />
                  <ExportDialog />
                </>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50/50">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

