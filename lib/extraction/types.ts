export type FormType = "1040" | "1120"

export type LineItem = {
  form_id: string
  line_code: string
  value: number | null
  begin_value: number | null
  end_value: number | null
  provenance: string
  confidence: number
}

export type ExtractedData = {
  form_type: FormType
  tax_year: number
  line_items: LineItem[]
  metadata: {
    extraction_method: "xml" | "pdf"
    confidence_min: number
  }
}

// Key line codes for 1120 (Corporation)
export const LINE_CODES_1120 = {
  // Income Statement
  GROSS_RECEIPTS: "1120.1a",
  COST_OF_GOODS_SOLD: "1120.2",
  GROSS_PROFIT: "1120.3",
  TOTAL_INCOME: "1120.11",

  // Balance Sheet (Schedule L)
  CASH_BEGIN: "1120.L.1.begin",
  CASH_END: "1120.L.1.end",
  AR_BEGIN: "1120.L.2a.begin",
  AR_END: "1120.L.2a.end",
  INVENTORY_BEGIN: "1120.L.3.begin",
  INVENTORY_END: "1120.L.3.end",
  TOTAL_ASSETS_BEGIN: "1120.L.15.begin",
  TOTAL_ASSETS_END: "1120.L.15.end",
  AP_BEGIN: "1120.L.17.begin",
  AP_END: "1120.L.17.end",
  CURRENT_LIABILITIES_BEGIN: "1120.L.21.begin",
  CURRENT_LIABILITIES_END: "1120.L.21.end",
  TOTAL_LIABILITIES_BEGIN: "1120.L.24.begin",
  TOTAL_LIABILITIES_END: "1120.L.24.end",
}

// Key line codes for 1040 (Individual)
export const LINE_CODES_1040 = {
  // Schedule C (Business Income)
  GROSS_RECEIPTS: "1040.C.1",
  COST_OF_GOODS_SOLD: "1040.C.4",
  GROSS_PROFIT: "1040.C.7",
  TOTAL_EXPENSES: "1040.C.28",
  NET_PROFIT: "1040.C.31",

  // Schedule E (Rental Income)
  RENTAL_INCOME: "1040.E.3",
  RENTAL_EXPENSES: "1040.E.20",
}
