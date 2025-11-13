"use client"

import { Badge } from "@/components/ui/badge"
import { TrendingUp, DollarSign } from "lucide-react"

type Opportunity = {
  id: string
  opportunity_type: string
  title: string
  description: string | null
  impact_amount: number | null
  priority: string | null
}

export function OpportunitiesView({
  opportunities,
  compact = false,
}: {
  opportunities: Opportunity[]
  compact?: boolean
}) {
  if (opportunities.length === 0) {
    return <div className="py-8 text-center text-sm text-muted-foreground">No opportunities identified yet</div>
  }

  return (
    <div className="space-y-3">
      {opportunities.map((opp) => (
        <div key={opp.id} className="flex items-start gap-3 rounded-lg border p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            {opp.opportunity_type?.includes("tax") ? (
              <DollarSign className="h-5 w-5 text-primary" />
            ) : (
              <TrendingUp className="h-5 w-5 text-primary" />
            )}
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-medium">{opp.title}</div>
                {!compact && opp.description && (
                  <div className="mt-1 text-sm text-muted-foreground">{opp.description}</div>
                )}
              </div>
              {opp.priority && (
                <Badge
                  variant={
                    opp.priority === "high" ? "destructive" : opp.priority === "medium" ? "default" : "secondary"
                  }
                >
                  {opp.priority}
                </Badge>
              )}
            </div>
            {opp.impact_amount && (
              <div className="flex items-center gap-1 text-sm font-semibold text-green-600">
                <DollarSign className="h-4 w-4" />
                {opp.impact_amount.toLocaleString()} potential impact
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
