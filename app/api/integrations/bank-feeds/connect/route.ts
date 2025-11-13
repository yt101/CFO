import { NextRequest, NextResponse } from "next/server"
import { bankFeedService } from "@/lib/integrations/bank-feeds"

export async function POST(request: NextRequest) {
  try {
    const { publicToken, provider } = await request.json()

    if (!publicToken) {
      return NextResponse.json({ error: "Public token is required" }, { status: 400 })
    }

    // Connect bank account
    const accounts = await bankFeedService.connectPlaidAccount(publicToken)

    return NextResponse.json({
      success: true,
      accounts,
      message: "Bank account connected successfully"
    })
  } catch (error) {
    console.error("Bank feed connection error:", error)
    return NextResponse.json(
      { error: "Failed to connect bank account" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const accountId = searchParams.get('accountId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!accountId || !startDate || !endDate) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // Fetch transactions
    const transactions = await bankFeedService.fetchTransactions(
      accountId,
      new Date(startDate),
      new Date(endDate)
    )

    return NextResponse.json({
      success: true,
      transactions,
      count: transactions.length
    })
  } catch (error) {
    console.error("Bank feed fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    )
  }
}
































