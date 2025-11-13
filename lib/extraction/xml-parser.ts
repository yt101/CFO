import { type ExtractedData, type LineItem, LINE_CODES_1120, LINE_CODES_1040 } from "./types"

export async function parseXML(xmlContent: string, formType: "1040" | "1120"): Promise<ExtractedData> {
  // In production, this would use a proper XML parser like fast-xml-parser
  // For now, we'll simulate extraction with mock data

  const lineItems: LineItem[] = []

  if (formType === "1120") {
    // Extract 1120 data
    lineItems.push(
      {
        form_id: "1120",
        line_code: LINE_CODES_1120.GROSS_RECEIPTS,
        value: 5000000,
        begin_value: null,
        end_value: null,
        provenance: "1120, Line 1a",
        confidence: 0.99,
      },
      {
        form_id: "1120",
        line_code: LINE_CODES_1120.COST_OF_GOODS_SOLD,
        value: 3000000,
        begin_value: null,
        end_value: null,
        provenance: "1120, Line 2",
        confidence: 0.99,
      },
      {
        form_id: "1120.L",
        line_code: LINE_CODES_1120.CASH_BEGIN,
        value: null,
        begin_value: 250000,
        end_value: 180000,
        provenance: "1120 Schedule L, Line 1",
        confidence: 0.99,
      },
      {
        form_id: "1120.L",
        line_code: LINE_CODES_1120.AR_BEGIN,
        value: null,
        begin_value: 450000,
        end_value: 620000,
        provenance: "1120 Schedule L, Line 2a",
        confidence: 0.99,
      },
      {
        form_id: "1120.L",
        line_code: LINE_CODES_1120.INVENTORY_BEGIN,
        value: null,
        begin_value: 380000,
        end_value: 520000,
        provenance: "1120 Schedule L, Line 3",
        confidence: 0.99,
      },
      {
        form_id: "1120.L",
        line_code: LINE_CODES_1120.AP_BEGIN,
        value: null,
        begin_value: 320000,
        end_value: 280000,
        provenance: "1120 Schedule L, Line 17",
        confidence: 0.99,
      },
      {
        form_id: "1120.L",
        line_code: LINE_CODES_1120.CURRENT_LIABILITIES_BEGIN,
        value: null,
        begin_value: 450000,
        end_value: 520000,
        provenance: "1120 Schedule L, Line 21",
        confidence: 0.99,
      },
    )
  } else {
    // Extract 1040 Schedule C data
    lineItems.push(
      {
        form_id: "1040.C",
        line_code: LINE_CODES_1040.GROSS_RECEIPTS,
        value: 850000,
        begin_value: null,
        end_value: null,
        provenance: "1040 Schedule C, Line 1",
        confidence: 0.98,
      },
      {
        form_id: "1040.C",
        line_code: LINE_CODES_1040.COST_OF_GOODS_SOLD,
        value: 420000,
        begin_value: null,
        end_value: null,
        provenance: "1040 Schedule C, Line 4",
        confidence: 0.98,
      },
      {
        form_id: "1040.C",
        line_code: LINE_CODES_1040.TOTAL_EXPENSES,
        value: 280000,
        begin_value: null,
        end_value: null,
        provenance: "1040 Schedule C, Line 28",
        confidence: 0.98,
      },
      {
        form_id: "1040.C",
        line_code: LINE_CODES_1040.NET_PROFIT,
        value: 150000,
        begin_value: null,
        end_value: null,
        provenance: "1040 Schedule C, Line 31",
        confidence: 0.98,
      },
    )
  }

  const confidenceScores = lineItems.map((item) => item.confidence)
  const minConfidence = Math.min(...confidenceScores)

  return {
    form_type: formType,
    tax_year: new Date().getFullYear() - 1,
    line_items: lineItems,
    metadata: {
      extraction_method: "xml",
      confidence_min: minConfidence,
    },
  }
}
