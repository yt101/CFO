"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { FileText, ChevronRight } from "lucide-react"

type Return = {
  id: string
  entity_name: string
  entity_type: string
  tax_year: number
  status: string
  created_at: string
}

export function ReturnsList({ returns }: { returns: Return[] }) {
  if (returns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="mb-2 text-lg font-semibold">No returns yet</h3>
        <p className="mb-4 text-sm text-muted-foreground">Upload your first tax return to get started</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {returns.map((returnItem) => (
        <Link
          key={returnItem.id}
          href={`/dashboard/returns/${returnItem.id}`}
          className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="font-medium">{returnItem.entity_name}</div>
              <div className="text-sm text-muted-foreground">
                Form {returnItem.entity_type} • {returnItem.tax_year}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge
              variant={
                returnItem.status === "completed"
                  ? "default"
                  : returnItem.status === "processing"
                    ? "secondary"
                    : "outline"
              }
            >
              {returnItem.status}
            </Badge>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </Link>
      ))}
    </div>
  )
}
