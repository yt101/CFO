export type KPIMetric = {
  name: string
  formula: string
  value: number
  previous_value: number | null
  trend: "up" | "down" | "stable"
  evidence: {
    line_codes: string[]
    provenance: string[]
  }
}

export type WorkingCapitalMetrics = {
  current_ratio: KPIMetric
  quick_ratio: KPIMetric
  dso: KPIMetric
  dio: KPIMetric
  dpo: KPIMetric
  ccc: KPIMetric
  net_working_capital: KPIMetric
}
