import { NextRequest, NextResponse } from "next/server"
import { quickbooksService } from "@/lib/integrations/accounting-systems"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const statementType = searchParams.get('type') as 'income' | 'balance' | 'cashflow'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!statementType || !startDate || !endDate) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // Fetch financial statement
    const statement = await quickbooksService.getFinancialStatements(
      statementType,
      new Date(startDate),
      new Date(endDate)
    )

    return NextResponse.json({
      success: true,
      statement,
      message: "Financial statement retrieved successfully"
    })
  } catch (error) {
    console.error("QuickBooks financial statement error:", error)
    return NextResponse.json(
      { error: "Failed to fetch financial statement" },
      { status: 500 }
    )
  }
}

























