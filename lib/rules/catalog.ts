import type { Rule } from "./types"

export const RULES_CATALOG: Rule[] = [
  {
    id: "opp_dso_rise",
    name: "DSO Deterioration",
    category: "working_capital",
    conditions: [
      { metric: "DSO.delta_pct", operator: ">", value: 15 },
      { metric: "Sales.yoy", operator: "<=", value: 5 },
    ],
    priority: "high",
    title: "Collections tightening to unlock cash",
    description:
      "Days Sales Outstanding has increased significantly while sales growth is modest, indicating slower collections. Tightening credit terms or improving collection processes could free up substantial working capital.",
    impact_model: "(DSO_current - DSO_target) * (Sales / 365)",
    evidence_keys: ["1120.L.2a", "1120.1a"],
  },
  {
    id: "opp_inventory_bloat",
    name: "Inventory Bloat",
    category: "working_capital",
    conditions: [
      { metric: "DIO.delta_pct", operator: ">", value: 20 },
      { metric: "Gross_Margin.delta_pct", operator: "<", value: -2 },
    ],
    priority: "high",
    title: "Inventory optimization opportunity",
    description:
      "Days Inventory Outstanding has increased substantially while gross margins declined, suggesting excess or slow-moving inventory. Optimizing inventory levels could free up cash and reduce carrying costs.",
    impact_model: "(DIO_current - DIO_target) * (COGS / 365)",
    evidence_keys: ["1120.L.3", "1120.2"],
  },
  {
    id: "opp_supplier_financing",
    name: "Supplier Financing Gap",
    category: "working_capital",
    conditions: [
      { metric: "DPO.value", operator: "<", value: 45 },
      { metric: "DPO.delta_pct", operator: "<", value: -5 },
    ],
    priority: "medium",
    title: "Extend payment terms with suppliers",
    description:
      "Days Payable Outstanding is below industry benchmarks and declining. Negotiating extended payment terms with suppliers could improve cash flow without additional financing costs.",
    impact_model: "(DPO_target - DPO_current) * (COGS / 365)",
    evidence_keys: ["1120.L.17", "1120.2"],
  },
  {
    id: "opp_negative_nwc_trend",
    name: "Negative NWC Trend",
    category: "working_capital",
    conditions: [
      { metric: "Net_Working_Capital.delta_pct", operator: "<", value: -15 },
      { metric: "Current_Ratio.value", operator: "<", value: 1.5 },
    ],
    priority: "high",
    title: "Working capital stress detected",
    description:
      "Net working capital has declined significantly and current ratio is below healthy levels. This indicates potential liquidity stress that requires immediate attention through improved cash management or financing.",
    impact_model: "NWC_decline_amount",
    evidence_keys: ["1120.L.1", "1120.L.2a", "1120.L.3", "1120.L.21"],
  },
  {
    id: "opp_quick_ratio_stress",
    name: "Quick Ratio Stress",
    category: "working_capital",
    conditions: [{ metric: "Quick_Ratio.value", operator: "<", value: 0.8 }],
    priority: "high",
    title: "Liquidity improvement needed",
    description:
      "Quick ratio is below 0.8, indicating potential difficulty meeting short-term obligations without selling inventory. Focus on accelerating collections and managing payables strategically.",
    impact_model: "(Quick_Ratio_target - Quick_Ratio_current) * Current_Liabilities",
    evidence_keys: ["1120.L.1", "1120.L.2a", "1120.L.21"],
  },
  {
    id: "opp_ccc_spike",
    name: "Cash Conversion Cycle Spike",
    category: "working_capital",
    conditions: [{ metric: "CCC.delta_days", operator: ">", value: 20 }],
    priority: "high",
    title: "Cash cycle optimization opportunity",
    description:
      "Cash Conversion Cycle has increased by more than 20 days, meaning cash is tied up longer in operations. Addressing collections, inventory turnover, and payment timing could unlock significant working capital.",
    impact_model: "CCC_increase_days * (Sales / 365)",
    evidence_keys: ["1120.L.2a", "1120.L.3", "1120.L.17", "1120.1a", "1120.2"],
  },
  {
    id: "opp_bonus_depreciation",
    name: "Bonus Depreciation Timing",
    category: "tax_optimization",
    conditions: [
      { metric: "Capital_Expenditures.value", operator: ">", value: 100000 },
      { metric: "Depreciation_Claimed.pct_of_capex", operator: "<", value: 80 },
    ],
    priority: "medium",
    title: "Maximize bonus depreciation deduction",
    description:
      "Significant capital expenditures were made but bonus depreciation may not be fully utilized. Review Section 168(k) eligibility to accelerate deductions and reduce current tax liability.",
    impact_model: "Unclaimed_Depreciation * Effective_Tax_Rate",
    evidence_keys: ["1120.L.10", "1120.20"],
  },
  {
    id: "opp_interest_deduction",
    name: "Interest Deduction Gap",
    category: "tax_optimization",
    conditions: [
      { metric: "Interest_Expense.value", operator: ">", value: 50000 },
      { metric: "Interest_Limitation_163j.utilized_pct", operator: "<", value: 90 },
    ],
    priority: "medium",
    title: "Interest deduction optimization",
    description:
      "Interest expense is substantial but Section 163(j) limitation may be restricting deductions. Consider restructuring debt or electing real property trade or business exception to maximize deductions.",
    impact_model: "Restricted_Interest * Effective_Tax_Rate",
    evidence_keys: ["1120.18"],
  },
  {
    id: "opp_rd_credit",
    name: "R&D Credit Trigger",
    category: "tax_optimization",
    conditions: [
      { metric: "Wages.value", operator: ">", value: 500000 },
      { metric: "RD_Credit_Claimed.value", operator: "==", value: 0 },
    ],
    priority: "medium",
    title: "Research & Development tax credit opportunity",
    description:
      "Significant wage expenses suggest potential R&D activities. Many businesses qualify for R&D tax credits without realizing it. A detailed study could identify qualifying expenses for substantial credits.",
    impact_model: "Estimated_Qualifying_Expenses * 0.07",
    evidence_keys: ["1120.12"],
  },
  {
    id: "opp_qbi_deduction",
    name: "QBI Under-Claimed",
    category: "tax_optimization",
    conditions: [
      { metric: "Schedule_C_Net_Profit.value", operator: ">", value: 100000 },
      { metric: "QBI_Deduction.pct_of_profit", operator: "<", value: 18 },
    ],
    priority: "medium",
    title: "Qualified Business Income deduction opportunity",
    description:
      "Schedule C shows substantial business income but QBI deduction appears under-utilized. Review Section 199A eligibility and consider strategies to maximize the 20% deduction.",
    impact_model: "(Net_Profit * 0.20 - QBI_Claimed) * Marginal_Tax_Rate",
    evidence_keys: ["1040.C.31"],
  },
]
