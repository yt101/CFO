"use client"

import { TrendingUp, TrendingDown, Minus } from "lucide-react"

type Metric = {
  id: string
  name: string
  value: number
  previous_value: number | null
  trend: string | null
  formula: string | null
}

export function MetricsView({
  metrics,
  compact = false,
}: {
  metrics: Metric[]
  compact?: boolean
}) {
  if (metrics.length === 0) {
    return <div className="py-8 text-center text-sm text-muted-foreground">No metrics available yet</div>
  }

  const displayMetrics = compact ? metrics.slice(0, 5) : metrics

  return (
    <div className="space-y-3">
      {displayMetrics.map((metric) => {
        const change = metric.previous_value
          ? ((metric.value - metric.previous_value) / metric.previous_value) * 100
          : null

        return (
          <div key={metric.id} className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-1">
              <div className="font-medium">{metric.name}</div>
              {metric.formula && !compact && <div className="text-xs text-muted-foreground">{metric.formula}</div>}
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-lg font-semibold">{metric.value.toFixed(2)}</div>
                {change !== null && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    {metric.trend === "up" && <TrendingUp className="h-3 w-3 text-green-500" />}
                    {metric.trend === "down" && <TrendingDown className="h-3 w-3 text-red-500" />}
                    {metric.trend === "stable" && <Minus className="h-3 w-3 text-muted-foreground" />}
                    <span>{Math.abs(change).toFixed(1)}%</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
