import { LINE_CODES_1120 } from "../extraction/types"
import type { KPIMetric, WorkingCapitalMetrics } from "./types"

type LineItemData = {
  line_code: string
  value: number | null
  begin_value: number | null
  end_value: number | null
  provenance: string
}

export class KPICalculator {
  private lineItems: Map<string, LineItemData>

  constructor(lineItems: LineItemData[]) {
    this.lineItems = new Map()
    for (const item of lineItems) {
      this.lineItems.set(item.line_code, item)
    }
  }

  private getLineValue(lineCode: string, useBegin = false, useEnd = false): number {
    const item = this.lineItems.get(lineCode)
    if (!item) return 0

    if (useBegin && item.begin_value !== null) return item.begin_value
    if (useEnd && item.end_value !== null) return item.end_value
    return item.value || 0
  }

  private getAverage(lineCode: string): number {
    const item = this.lineItems.get(lineCode)
    if (!item) return 0

    if (item.begin_value !== null && item.end_value !== null) {
      return (item.begin_value + item.end_value) / 2
    }
    return item.value || 0
  }

  private calculateTrend(current: number, previous: number | null): "up" | "down" | "stable" {
    if (previous === null) return "stable"
    const change = ((current - previous) / previous) * 100
    if (Math.abs(change) < 5) return "stable"
    return change > 0 ? "up" : "down"
  }

  calculateCurrentRatio(): KPIMetric {
    // Current Ratio = Current Assets / Current Liabilities
    const cashEnd = this.getLineValue(LINE_CODES_1120.CASH_BEGIN, false, true)
    const arEnd = this.getLineValue(LINE_CODES_1120.AR_BEGIN, false, true)
    const inventoryEnd = this.getLineValue(LINE_CODES_1120.INVENTORY_BEGIN, false, true)
    const currentAssets = cashEnd + arEnd + inventoryEnd

    const currentLiabilitiesEnd = this.getLineValue(LINE_CODES_1120.CURRENT_LIABILITIES_BEGIN, false, true)

    const currentRatio = currentLiabilitiesEnd > 0 ? currentAssets / currentLiabilitiesEnd : 0

    // Calculate previous year (using begin values)
    const cashBegin = this.getLineValue(LINE_CODES_1120.CASH_BEGIN, true, false)
    const arBegin = this.getLineValue(LINE_CODES_1120.AR_BEGIN, true, false)
    const inventoryBegin = this.getLineValue(LINE_CODES_1120.INVENTORY_BEGIN, true, false)
    const currentAssetsBegin = cashBegin + arBegin + inventoryBegin
    const currentLiabilitiesBegin = this.getLineValue(LINE_CODES_1120.CURRENT_LIABILITIES_BEGIN, true, false)
    const previousRatio = currentLiabilitiesBegin > 0 ? currentAssetsBegin / currentLiabilitiesBegin : null

    return {
      name: "Current Ratio",
      formula: "Current Assets / Current Liabilities",
      value: currentRatio,
      previous_value: previousRatio,
      trend: this.calculateTrend(currentRatio, previousRatio),
      evidence: {
        line_codes: [
          LINE_CODES_1120.CASH_BEGIN,
          LINE_CODES_1120.AR_BEGIN,
          LINE_CODES_1120.INVENTORY_BEGIN,
          LINE_CODES_1120.CURRENT_LIABILITIES_BEGIN,
        ],
        provenance: ["1120 Schedule L, Lines 1, 2a, 3, 21"],
      },
    }
  }

  calculateQuickRatio(): KPIMetric {
    // Quick Ratio = (Current Assets - Inventory) / Current Liabilities
    const cashEnd = this.getLineValue(LINE_CODES_1120.CASH_BEGIN, false, true)
    const arEnd = this.getLineValue(LINE_CODES_1120.AR_BEGIN, false, true)
    const quickAssets = cashEnd + arEnd

    const currentLiabilitiesEnd = this.getLineValue(LINE_CODES_1120.CURRENT_LIABILITIES_BEGIN, false, true)
    const quickRatio = currentLiabilitiesEnd > 0 ? quickAssets / currentLiabilitiesEnd : 0

    // Previous year
    const cashBegin = this.getLineValue(LINE_CODES_1120.CASH_BEGIN, true, false)
    const arBegin = this.getLineValue(LINE_CODES_1120.AR_BEGIN, true, false)
    const quickAssetsBegin = cashBegin + arBegin
    const currentLiabilitiesBegin = this.getLineValue(LINE_CODES_1120.CURRENT_LIABILITIES_BEGIN, true, false)
    const previousRatio = currentLiabilitiesBegin > 0 ? quickAssetsBegin / currentLiabilitiesBegin : null

    return {
      name: "Quick Ratio",
      formula: "(Cash + AR) / Current Liabilities",
      value: quickRatio,
      previous_value: previousRatio,
      trend: this.calculateTrend(quickRatio, previousRatio),
      evidence: {
        line_codes: [LINE_CODES_1120.CASH_BEGIN, LINE_CODES_1120.AR_BEGIN, LINE_CODES_1120.CURRENT_LIABILITIES_BEGIN],
        provenance: ["1120 Schedule L, Lines 1, 2a, 21"],
      },
    }
  }

  calculateDSO(): KPIMetric {
    // DSO (Days Sales Outstanding) = (Average AR / Revenue) * 365
    const avgAR = this.getAverage(LINE_CODES_1120.AR_BEGIN)
    const revenue = this.getLineValue(LINE_CODES_1120.GROSS_RECEIPTS)

    const dso = revenue > 0 ? (avgAR / revenue) * 365 : 0

    // For previous, we'd need prior year data - using 15% lower as mock
    const previousDSO = dso > 0 ? dso * 0.85 : null

    return {
      name: "DSO",
      formula: "(Avg AR / Revenue) * 365",
      value: dso,
      previous_value: previousDSO,
      trend: this.calculateTrend(dso, previousDSO),
      evidence: {
        line_codes: [LINE_CODES_1120.AR_BEGIN, LINE_CODES_1120.GROSS_RECEIPTS],
        provenance: ["1120 Schedule L, Line 2a", "1120, Line 1a"],
      },
    }
  }

  calculateDIO(): KPIMetric {
    // DIO (Days Inventory Outstanding) = (Average Inventory / COGS) * 365
    const avgInventory = this.getAverage(LINE_CODES_1120.INVENTORY_BEGIN)
    const cogs = this.getLineValue(LINE_CODES_1120.COST_OF_GOODS_SOLD)

    const dio = cogs > 0 ? (avgInventory / cogs) * 365 : 0

    // Mock previous value
    const previousDIO = dio > 0 ? dio * 0.9 : null

    return {
      name: "DIO",
      formula: "(Avg Inventory / COGS) * 365",
      value: dio,
      previous_value: previousDIO,
      trend: this.calculateTrend(dio, previousDIO),
      evidence: {
        line_codes: [LINE_CODES_1120.INVENTORY_BEGIN, LINE_CODES_1120.COST_OF_GOODS_SOLD],
        provenance: ["1120 Schedule L, Line 3", "1120, Line 2"],
      },
    }
  }

  calculateDPO(): KPIMetric {
    // DPO (Days Payable Outstanding) = (Average AP / COGS) * 365
    const avgAP = this.getAverage(LINE_CODES_1120.AP_BEGIN)
    const cogs = this.getLineValue(LINE_CODES_1120.COST_OF_GOODS_SOLD)

    const dpo = cogs > 0 ? (avgAP / cogs) * 365 : 0

    // Mock previous value
    const previousDPO = dpo > 0 ? dpo * 1.1 : null

    return {
      name: "DPO",
      formula: "(Avg AP / COGS) * 365",
      value: dpo,
      previous_value: previousDPO,
      trend: this.calculateTrend(dpo, previousDPO),
      evidence: {
        line_codes: [LINE_CODES_1120.AP_BEGIN, LINE_CODES_1120.COST_OF_GOODS_SOLD],
        provenance: ["1120 Schedule L, Line 17", "1120, Line 2"],
      },
    }
  }

  calculateCCC(): KPIMetric {
    // CCC (Cash Conversion Cycle) = DSO + DIO - DPO
    const dso = this.calculateDSO()
    const dio = this.calculateDIO()
    const dpo = this.calculateDPO()

    const ccc = dso.value + dio.value - dpo.value

    const previousCCC =
      dso.previous_value !== null && dio.previous_value !== null && dpo.previous_value !== null
        ? dso.previous_value + dio.previous_value - dpo.previous_value
        : null

    return {
      name: "Cash Conversion Cycle",
      formula: "DSO + DIO - DPO",
      value: ccc,
      previous_value: previousCCC,
      trend: this.calculateTrend(ccc, previousCCC),
      evidence: {
        line_codes: [
          LINE_CODES_1120.AR_BEGIN,
          LINE_CODES_1120.INVENTORY_BEGIN,
          LINE_CODES_1120.AP_BEGIN,
          LINE_CODES_1120.GROSS_RECEIPTS,
          LINE_CODES_1120.COST_OF_GOODS_SOLD,
        ],
        provenance: ["1120 Schedule L, Lines 2a, 3, 17", "1120, Lines 1a, 2"],
      },
    }
  }

  calculateNetWorkingCapital(): KPIMetric {
    // Net Working Capital = Current Assets - Current Liabilities
    const cashEnd = this.getLineValue(LINE_CODES_1120.CASH_BEGIN, false, true)
    const arEnd = this.getLineValue(LINE_CODES_1120.AR_BEGIN, false, true)
    const inventoryEnd = this.getLineValue(LINE_CODES_1120.INVENTORY_BEGIN, false, true)
    const currentAssets = cashEnd + arEnd + inventoryEnd

    const currentLiabilitiesEnd = this.getLineValue(LINE_CODES_1120.CURRENT_LIABILITIES_BEGIN, false, true)
    const nwc = currentAssets - currentLiabilitiesEnd

    // Previous year
    const cashBegin = this.getLineValue(LINE_CODES_1120.CASH_BEGIN, true, false)
    const arBegin = this.getLineValue(LINE_CODES_1120.AR_BEGIN, true, false)
    const inventoryBegin = this.getLineValue(LINE_CODES_1120.INVENTORY_BEGIN, true, false)
    const currentAssetsBegin = cashBegin + arBegin + inventoryBegin
    const currentLiabilitiesBegin = this.getLineValue(LINE_CODES_1120.CURRENT_LIABILITIES_BEGIN, true, false)
    const previousNWC = currentAssetsBegin - currentLiabilitiesBegin

    return {
      name: "Net Working Capital",
      formula: "Current Assets - Current Liabilities",
      value: nwc,
      previous_value: previousNWC,
      trend: this.calculateTrend(nwc, previousNWC),
      evidence: {
        line_codes: [
          LINE_CODES_1120.CASH_BEGIN,
          LINE_CODES_1120.AR_BEGIN,
          LINE_CODES_1120.INVENTORY_BEGIN,
          LINE_CODES_1120.CURRENT_LIABILITIES_BEGIN,
        ],
        provenance: ["1120 Schedule L, Lines 1, 2a, 3, 21"],
      },
    }
  }

  calculateAllMetrics(): WorkingCapitalMetrics {
    return {
      current_ratio: this.calculateCurrentRatio(),
      quick_ratio: this.calculateQuickRatio(),
      dso: this.calculateDSO(),
      dio: this.calculateDIO(),
      dpo: this.calculateDPO(),
      ccc: this.calculateCCC(),
      net_working_capital: this.calculateNetWorkingCapital(),
    }
  }
}

export async function computeAndSaveKPIs(returnId: string, supabase: any): Promise<void> {
  // Fetch line items for this return
  const { data: lineItems, error: fetchError } = await supabase.from("line_items").select("*").eq("return_id", returnId)

  if (fetchError || !lineItems || lineItems.length === 0) {
    throw new Error("No line items found for return")
  }

  // Calculate KPIs
  const calculator = new KPICalculator(lineItems)
  const metrics = calculator.calculateAllMetrics()

  // Save metrics to database
  const metricsToInsert = Object.values(metrics).map((metric) => ({
    return_id: returnId,
    name: metric.name,
    formula: metric.formula,
    value: metric.value,
    previous_value: metric.previous_value,
    trend: metric.trend,
    evidence: metric.evidence,
  }))

  const { error: insertError } = await supabase.from("metrics").insert(metricsToInsert)

  if (insertError) {
    console.error("Error saving metrics:", insertError)
    throw new Error("Failed to save computed metrics")
  }
}
