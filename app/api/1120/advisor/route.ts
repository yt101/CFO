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

    const { question, companyId } = await request.json()

    if (!question) {
      return NextResponse.json({ error: "No question provided" }, { status: 400 })
    }

    // Get user's company if not provided
    let targetCompanyId = companyId
    if (!targetCompanyId) {
      const { data: userProfile, error: profileError } = await supabase
        .from("user_profiles")
        .select("company_id")
        .eq("user_id", user.id)
        .single()

      if (profileError || !userProfile) {
        return NextResponse.json({ error: "User profile not found" }, { status: 404 })
      }
      targetCompanyId = userProfile.company_id
    }

    // Get the latest tax profile for the company
    const { data: taxProfile, error: taxProfileError } = await supabase
      .from("company_tax_profiles")
      .select("*")
      .eq("company_id", targetCompanyId)
      .order("fiscal_year", { ascending: false })
      .limit(1)
      .single()

    if (taxProfileError || !taxProfile) {
      return NextResponse.json({ 
        error: "No 1120 data found. Please upload your tax data first." 
      }, { status: 404 })
    }

    // Load the data from database
    const advisorEngine = new Form1120AdvisorEngine(supabase)
    
    // Get all related data
    const { data: scheduleLData } = await supabase
      .from("schedule_l_data")
      .select("*")
      .eq("company_tax_profile_id", taxProfile.id)

    const { data: scheduleM1Data } = await supabase
      .from("schedule_m1_data")
      .select("*")
      .eq("company_tax_profile_id", taxProfile.id)

    const { data: scheduleM2Data } = await supabase
      .from("schedule_m2_data")
      .select("*")
      .eq("company_tax_profile_id", taxProfile.id)

    const { data: financialRatios } = await supabase
      .from("tax_financial_ratios")
      .select("*")
      .eq("company_tax_profile_id", taxProfile.id)
      .single()

    const { data: optimizationActions } = await supabase
      .from("tax_optimization_actions")
      .select("*")
      .eq("company_tax_profile_id", taxProfile.id)

    // Reconstruct the form data from database
    const formData = {
      companyName: taxProfile.company_id, // You might want to get actual company name
      ein: taxProfile.ein,
      taxYear: taxProfile.fiscal_year,
      entityType: taxProfile.entity_type,
      scheduleL: scheduleLData ? this.reconstructScheduleL(scheduleLData) : null,
      scheduleM1: scheduleM1Data ? this.reconstructScheduleM1(scheduleM1Data) : null,
      scheduleM2: scheduleM2Data?.[0] || null,
      financialRatios: financialRatios || null,
      optimizationOpportunities: optimizationActions || []
    }

    // Set the form data in the engine
    advisorEngine.setFormData(formData)

    // Get AI response
    const response = await advisorEngine.answerQuestion(question)

    return NextResponse.json({
      success: true,
      response
    })

  } catch (error) {
    console.error("Advisor error:", error)
    return NextResponse.json(
      { error: "Failed to process question" },
      { status: 500 }
    )
  }
}

// Helper functions to reconstruct form data from database
function reconstructScheduleL(scheduleLData: any[]) {
  const data: any = {}
  
  scheduleLData.forEach(item => {
    switch (item.line_number) {
      case 1:
        data.cash = { beginning: item.beginning_year, ending: item.end_year }
        break
      case 2:
        data.accountsReceivable = { beginning: item.beginning_year, ending: item.end_year }
        break
      case 3:
        data.allowanceForBadDebts = { beginning: item.beginning_year, ending: item.end_year }
        break
      case 4:
        data.inventories = { beginning: item.beginning_year, ending: item.end_year }
        break
      case 5:
        data.otherCurrentAssets = { beginning: item.beginning_year, ending: item.end_year }
        break
      case 6:
        data.totalCurrentAssets = { beginning: item.beginning_year, ending: item.end_year }
        break
      case 11:
        data.buildingsAndDepreciableAssets = { beginning: item.beginning_year, ending: item.end_year }
        break
      case 12:
        data.accumulatedDepreciation = { beginning: item.beginning_year, ending: item.end_year }
        break
      case 15:
        data.land = { beginning: item.beginning_year, ending: item.end_year }
        break
      case 16:
        data.intangibleAssets = { beginning: item.beginning_year, ending: item.end_year }
        break
      case 17:
        data.accumulatedAmortization = { beginning: item.beginning_year, ending: item.end_year }
        break
      case 18:
        data.otherAssets = { beginning: item.beginning_year, ending: item.end_year }
        break
      case 19:
        data.totalAssets = { beginning: item.beginning_year, ending: item.end_year }
        break
      case 20:
        data.accountsPayable = { beginning: item.beginning_year, ending: item.end_year }
        break
      case 21:
        data.shortTermDebt = { beginning: item.beginning_year, ending: item.end_year }
        break
      case 22:
        data.otherCurrentLiabilities = { beginning: item.beginning_year, ending: item.end_year }
        break
      case 23:
        data.totalCurrentLiabilities = { beginning: item.beginning_year, ending: item.end_year }
        break
      case 24:
        data.totalLiabilities = { beginning: item.beginning_year, ending: item.end_year }
        break
      case 25:
        data.paidInCapital = { beginning: item.beginning_year, ending: item.end_year }
        break
      case 26:
        data.retainedEarnings = { beginning: item.beginning_year, ending: item.end_year }
        break
      case 27:
        data.totalEquity = { beginning: item.beginning_year, ending: item.end_year }
        break
    }
  })
  
  return data
}

function reconstructScheduleM1(scheduleM1Data: any[]) {
  const data: any = {}
  
  scheduleM1Data.forEach(item => {
    switch (item.line_number) {
      case 1:
        data.incomePerBooks = item.book_amount
        break
      case 2:
        data.federalIncomeTaxPerBooks = item.book_amount
        break
      case 3:
        data.excessCapitalLosses = item.book_amount
        break
      case 4:
        data.incomeSubjectToTaxNotRecorded = item.book_amount
        break
      case 5:
        data.expensesRecordedNotDeducted = item.book_amount
        break
      case 6:
        data.depreciation = { 
          book: item.book_amount, 
          tax: item.tax_amount, 
          difference: item.difference 
        }
        break
      case 7:
        data.charitableContributions = { 
          book: item.book_amount, 
          tax: item.tax_amount, 
          difference: item.difference 
        }
        break
      case 8:
        data.mealsAndEntertainment = { 
          book: item.book_amount, 
          tax: item.tax_amount, 
          difference: item.difference 
        }
        break
      case 9:
        data.otherDeductions = { 
          book: item.book_amount, 
          tax: item.tax_amount, 
          difference: item.difference 
        }
        break
      case 10:
        data.totalAdditions = item.book_amount
        break
      case 11:
        data.totalSubtractions = item.book_amount
        break
      case 12:
        data.netIncome = item.book_amount
        break
    }
  })
  
  return data
}



























