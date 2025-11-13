import { createClient } from "@/lib/supabase/server"
import { extractTaxReturnData, saveExtractedData } from "@/lib/extraction/extractor"
import { computeAndSaveKPIs } from "@/lib/kpi/calculator"
import { identifyAndSaveOpportunities } from "@/lib/rules/engine"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { returnId } = await request.json()

    if (!returnId) {
      return NextResponse.json({ error: "Missing returnId" }, { status: 400 })
    }

    // Fetch return details
    const { data: returnData, error: fetchError } = await supabase
      .from("returns")
      .select("*")
      .eq("id", returnId)
      .eq("user_id", user.id)
      .single()

    if (fetchError || !returnData) {
      return NextResponse.json({ error: "Return not found" }, { status: 404 })
    }

    // In production, you would fetch the actual file from storage
    // For now, we'll simulate with mock data
    const mockFile = Buffer.from("mock file content")

    // Step 1: Extract data
    const extractedData = await extractTaxReturnData(
      mockFile,
      returnData.entity_type as "1040" | "1120",
      returnData.source_type as "xml" | "pdf",
    )

    // Step 2: Save extracted data
    await saveExtractedData(returnId, extractedData, supabase)

    // Step 3: Compute KPIs
    await computeAndSaveKPIs(returnId, supabase)

    // Step 4: Identify opportunities
    await identifyAndSaveOpportunities(returnId, supabase)

    return NextResponse.json({
      success: true,
      message: "Processing completed successfully",
      confidence: extractedData.metadata.confidence_min,
      lineItemsCount: extractedData.line_items.length,
    })
  } catch (error) {
    console.error("Processing error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
