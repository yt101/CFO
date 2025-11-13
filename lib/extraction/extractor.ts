import { parseXML } from "./xml-parser"
import { parsePDF } from "./pdf-parser"
import type { ExtractedData } from "./types"

export async function extractTaxReturnData(
  file: File | Buffer,
  formType: "1040" | "1120",
  sourceType: "xml" | "pdf",
): Promise<ExtractedData> {
  try {
    if (sourceType === "xml") {
      const content = file instanceof File ? await file.text() : file.toString()
      return await parseXML(content, formType)
    } else {
      const buffer = file instanceof File ? Buffer.from(await file.arrayBuffer()) : file
      return await parsePDF(buffer, formType)
    }
  } catch (error) {
    console.error("Extraction error:", error)
    throw new Error("Failed to extract data from tax return")
  }
}

export async function saveExtractedData(returnId: string, extractedData: ExtractedData, supabase: any): Promise<void> {
  // Save line items to database
  const lineItemsToInsert = extractedData.line_items.map((item) => ({
    return_id: returnId,
    form_id: item.form_id,
    line_code: item.line_code,
    value: item.value,
    begin_value: item.begin_value,
    end_value: item.end_value,
    provenance: item.provenance,
    confidence: item.confidence,
  }))

  const { error: lineItemsError } = await supabase.from("line_items").insert(lineItemsToInsert)

  if (lineItemsError) {
    console.error("Error saving line items:", lineItemsError)
    throw new Error("Failed to save extracted line items")
  }

  // Update return with confidence score
  const { error: updateError } = await supabase
    .from("returns")
    .update({
      confidence_min: extractedData.metadata.confidence_min,
      status: "completed",
      updated_at: new Date().toISOString(),
    })
    .eq("id", returnId)

  if (updateError) {
    console.error("Error updating return:", updateError)
    throw new Error("Failed to update return status")
  }
}
