"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface KPICardProps {
  title: string
  value: number
  unit: string
  change?: number
  changeLabel?: string
  trend?: "up" | "down" | "stable"
  icon?: React.ReactNode
  description?: string
  target?: number
  industry?: number
  className?: string
}

export function KPICard({
  title,
  value,
  unit,
  change,
  changeLabel,
  trend,
  icon,
  description,
  target,
  industry,
  className
}: KPICardProps) {
  const getTrendIcon = () => {
    if (trend === "up") return <TrendingUp className="h-3 w-3" />
    if (trend === "down") return <TrendingDown className="h-3 w-3" />
    return <Minus className="h-3 w-3" />
  }

  const getTrendColor = () => {
    if (trend === "up") return "text-green-600"
    if (trend === "down") return "text-red-600"
    return "text-gray-500"
  }

  const formatValue = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`
    if (val >= 1000) return `${(val / 1000).toFixed(1)}K`
    return val.toFixed(1)
  }

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-2xl font-bold">
            {formatValue(value)}
            <span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>
          </div>
          
          {change !== undefined && changeLabel && (
            <div className={cn("flex items-center text-xs", getTrendColor())}>
              {getTrendIcon()}
              <span className="ml-1">{changeLabel}</span>
            </div>
          )}

          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}

          {(target !== undefined || industry !== undefined) && (
            <div className="space-y-1 pt-2 border-t">
              {target !== undefined && (
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Target:</span>
                  <span className="font-medium">{formatValue(target)} {unit}</span>
                </div>
              )}
              {industry !== undefined && (
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Industry:</span>
                  <span className="font-medium">{formatValue(industry)} {unit}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

