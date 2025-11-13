import { createClient } from "@/lib/supabase/server"
import { Form1120AdvisorEngine } from "@/lib/ai/1120-advisor-engine"
import { NextRequest, NextResponse } from "next/server"

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

    // Get user's company
    const { data: userProfile, error: profileError } = await supabase
      .from("user_profiles")
      .select("company_id")
      .eq("user_id", user.id)
      .single()

    if (profileError || !userProfile) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Initialize the advisor engine
    const advisorEngine = new Form1120AdvisorEngine(supabase)
    
    // Import data from Excel file
    const importedData = await advisorEngine.importFromExcel(file)
    
    // Save to database
    await advisorEngine.saveToDatabase(userProfile.company_id)

    return NextResponse.json({
      success: true,
      data: {
        companyName: importedData.companyName,
        ein: importedData.ein,
        taxYear: importedData.taxYear,
        entityType: importedData.entityType,
        optimizationOpportunities: importedData.optimizationOpportunities.length,
        totalPotentialSavings: importedData.optimizationOpportunities.reduce((sum, opp) => sum + opp.potentialSavings, 0)
      }
    })

  } catch (error) {
    console.error("Import error:", error)
    return NextResponse.json(
      { error: "Failed to import 1120 data" },
      { status: 500 }
    )
  }
}



























