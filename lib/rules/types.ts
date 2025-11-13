export type RuleCondition = {
  metric: string
  operator: ">" | "<" | ">=" | "<=" | "==" | "!="
  value: number
}

export type Rule = {
  id: string
  name: string
  category: "working_capital" | "tax_optimization" | "cost_reduction"
  conditions: RuleCondition[]
  priority: "high" | "medium" | "low"
  title: string
  description: string
  impact_model: string
  evidence_keys: string[]
}

export type Opportunity = {
  rule_id: string
  opportunity_type: string
  title: string
  description: string
  impact_amount: number | null
  impact_model: string
  trigger_rule: string
  evidence: {
    metrics: Record<string, number>
    line_items: string[]
  }
  priority: "high" | "medium" | "low"
}
