import { type ExtractedData, type LineItem, LINE_CODES_1120, LINE_CODES_1040 } from "./types"

export async function parsePDF(pdfBuffer: Buffer, formType: "1040" | "1120"): Promise<ExtractedData> {
  // In production, this would use OCR/IDP services like:
  // - Ocrolus
  // - Veryfi
  // - Azure Document Intelligence
  // - AWS Textract

  // For now, we'll simulate extraction with mock data
  const lineItems: LineItem[] = []

  if (formType === "1120") {
    // Simulate 1120 extraction with slightly lower confidence than XML
    lineItems.push(
      {
        form_id: "1120",
        line_code: LINE_CODES_1120.GROSS_RECEIPTS,
        value: 5000000,
        begin_value: null,
        end_value: null,
        provenance: "1120, Line 1a (OCR)",
        confidence: 0.96,
      },
      {
        form_id: "1120",
        line_code: LINE_CODES_1120.COST_OF_GOODS_SOLD,
        value: 3000000,
        begin_value: null,
        end_value: null,
        provenance: "1120, Line 2 (OCR)",
        confidence: 0.96,
      },
      {
        form_id: "1120.L",
        line_code: LINE_CODES_1120.CASH_BEGIN,
        value: null,
        begin_value: 250000,
        end_value: 180000,
        provenance: "1120 Schedule L, Line 1 (OCR)",
        confidence: 0.95,
      },
      {
        form_id: "1120.L",
        line_code: LINE_CODES_1120.AR_BEGIN,
        value: null,
        begin_value: 450000,
        end_value: 620000,
        provenance: "1120 Schedule L, Line 2a (OCR)",
        confidence: 0.95,
      },
      {
        form_id: "1120.L",
        line_code: LINE_CODES_1120.INVENTORY_BEGIN,
        value: null,
        begin_value: 380000,
        end_value: 520000,
        provenance: "1120 Schedule L, Line 3 (OCR)",
        confidence: 0.95,
      },
      {
        form_id: "1120.L",
        line_code: LINE_CODES_1120.AP_BEGIN,
        value: null,
        begin_value: 320000,
        end_value: 280000,
        provenance: "1120 Schedule L, Line 17 (OCR)",
        confidence: 0.95,
      },
    )
  } else {
    // Simulate 1040 Schedule C extraction
    lineItems.push(
      {
        form_id: "1040.C",
        line_code: LINE_CODES_1040.GROSS_RECEIPTS,
        value: 850000,
        begin_value: null,
        end_value: null,
        provenance: "1040 Schedule C, Line 1 (OCR)",
        confidence: 0.94,
      },
      {
        form_id: "1040.C",
        line_code: LINE_CODES_1040.COST_OF_GOODS_SOLD,
        value: 420000,
        begin_value: null,
        end_value: null,
        provenance: "1040 Schedule C, Line 4 (OCR)",
        confidence: 0.94,
      },
      {
        form_id: "1040.C",
        line_code: LINE_CODES_1040.NET_PROFIT,
        value: 150000,
        begin_value: null,
        end_value: null,
        provenance: "1040 Schedule C, Line 31 (OCR)",
        confidence: 0.94,
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
      extraction_method: "pdf",
      confidence_min: minConfidence,
    },
  }
}
