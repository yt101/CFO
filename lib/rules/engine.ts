import { RULES_CATALOG } from "./catalog"
import type { Opportunity, Rule } from "./types"

type MetricData = {
  name: string
  value: number
  previous_value: number | null
}

type LineItemData = {
  line_code: string
  value: number | null
  provenance: string
}

export class RulesEngine {
  private metrics: Map<string, MetricData>
  private lineItems: Map<string, LineItemData>

  constructor(metrics: MetricData[], lineItems: LineItemData[]) {
    this.metrics = new Map()
    this.lineItems = new Map()

    for (const metric of metrics) {
      this.metrics.set(metric.name, metric)
    }

    for (const item of lineItems) {
      this.lineItems.set(item.line_code, item)
    }
  }

  private getMetricValue(metricPath: string): number | null {
    const parts = metricPath.split(".")
    const metricName = parts[0]
    const property = parts[1] || "value"

    const metric = this.metrics.get(metricName)
    if (!metric) return null

    if (property === "value") return metric.value
    if (property === "previous_value") return metric.previous_value
    if (property === "delta_pct" && metric.previous_value !== null) {
      return ((metric.value - metric.previous_value) / metric.previous_value) * 100
    }
    if (property === "delta_days" && metric.previous_value !== null) {
      return metric.value - metric.previous_value
    }

    return null
  }

  private evaluateCondition(condition: { metric: string; operator: string; value: number }): boolean {
    const metricValue = this.getMetricValue(condition.metric)
    if (metricValue === null) return false

    switch (condition.operator) {
      case ">":
        return metricValue > condition.value
      case "<":
        return metricValue < condition.value
      case ">=":
        return metricValue >= condition.value
      case "<=":
        return metricValue <= condition.value
      case "==":
        return metricValue === condition.value
      case "!=":
        return metricValue !== condition.value
      default:
        return false
    }
  }

  private evaluateRule(rule: Rule): boolean {
    return rule.conditions.every((condition) => this.evaluateCondition(condition))
  }

  private calculateImpact(rule: Rule): number | null {
    // Simplified impact calculation
    // In production, this would parse and evaluate the impact_model formula

    if (rule.id === "opp_dso_rise") {
      const dso = this.metrics.get("DSO")
      const sales = this.lineItems.get("1120.1a")
      if (dso && sales?.value) {
        const targetDSO = 50
        const excessDays = Math.max(0, dso.value - targetDSO)
        return (excessDays * sales.value) / 365
      }
    }

    if (rule.id === "opp_inventory_bloat") {
      const dio = this.metrics.get("DIO")
      const cogs = this.lineItems.get("1120.2")
      if (dio && cogs?.value) {
        const targetDIO = 45
        const excessDays = Math.max(0, dio.value - targetDIO)
        return (excessDays * cogs.value) / 365
      }
    }

    if (rule.id === "opp_supplier_financing") {
      const dpo = this.metrics.get("DPO")
      const cogs = this.lineItems.get("1120.2")
      if (dpo && cogs?.value) {
        const targetDPO = 60
        const additionalDays = Math.max(0, targetDPO - dpo.value)
        return (additionalDays * cogs.value) / 365
      }
    }

    if (rule.id === "opp_ccc_spike") {
      const ccc = this.metrics.get("Cash Conversion Cycle")
      const sales = this.lineItems.get("1120.1a")
      if (ccc && ccc.previous_value && sales?.value) {
        const increaseDays = ccc.value - ccc.previous_value
        return (increaseDays * sales.value) / 365
      }
    }

    // Default impact for other rules
    return null
  }

  identifyOpportunities(): Opportunity[] {
    const opportunities: Opportunity[] = []

    for (const rule of RULES_CATALOG) {
      if (this.evaluateRule(rule)) {
        const impact = this.calculateImpact(rule)

        const evidence: Record<string, number> = {}
        for (const key of rule.evidence_keys) {
          const lineItem = this.lineItems.get(key)
          if (lineItem?.value !== null) {
            evidence[key] = lineItem.value || 0
          }
        }

        opportunities.push({
          rule_id: rule.id,
          opportunity_type: rule.category,
          title: rule.title,
          description: rule.description,
          impact_amount: impact,
          impact_model: rule.impact_model,
          trigger_rule: rule.name,
          evidence: {
            metrics: evidence,
            line_items: rule.evidence_keys,
          },
          priority: rule.priority,
        })
      }
    }

    return opportunities
  }
}

export async function identifyAndSaveOpportunities(returnId: string, supabase: any): Promise<void> {
  // Fetch metrics
  const { data: metrics, error: metricsError } = await supabase.from("metrics").select("*").eq("return_id", returnId)

  if (metricsError || !metrics || metrics.length === 0) {
    throw new Error("No metrics found for return")
  }

  // Fetch line items
  const { data: lineItems, error: lineItemsError } = await supabase
    .from("line_items")
    .select("*")
    .eq("return_id", returnId)

  if (lineItemsError || !lineItems || lineItems.length === 0) {
    throw new Error("No line items found for return")
  }

  // Run rules engine
  const engine = new RulesEngine(metrics, lineItems)
  const opportunities = engine.identifyOpportunities()

  if (opportunities.length === 0) {
    console.log("No opportunities identified for return:", returnId)
    return
  }

  // Save opportunities to database
  const opportunitiesToInsert = opportunities.map((opp) => ({
    return_id: returnId,
    opportunity_type: opp.opportunity_type,
    title: opp.title,
    description: opp.description,
    impact_amount: opp.impact_amount,
    impact_model: opp.impact_model,
    trigger_rule: opp.trigger_rule,
    evidence: opp.evidence,
    priority: opp.priority,
  }))

  const { error: insertError } = await supabase.from("opportunities").insert(opportunitiesToInsert)

  if (insertError) {
    console.error("Error saving opportunities:", insertError)
    throw new Error("Failed to save identified opportunities")
  }

  console.log(`Identified and saved ${opportunities.length} opportunities for return:`, returnId)
}
