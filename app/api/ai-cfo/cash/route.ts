import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'runway'

    switch (type) {
      case 'runway':
        const scenarioId = searchParams.get('scenario_id')
        const runway = {
          weeks: 18,
          assumptions: [
            "Current burn rate maintained",
            "No new funding rounds",
            "Revenue growth at 15% monthly"
          ],
          chart_url: "https://api.cfo.ai/charts/runway-2025-01.png"
        }
        return NextResponse.json(runway)

      case 'forecast':
        const cashFlowData = [
          { period: "Jan 2025", cash_in: 850000, cash_out: 720000, net_cash: 130000, balance: 1200000 },
          { period: "Feb 2025", cash_in: 920000, cash_out: 780000, net_cash: 140000, balance: 1340000 },
          { period: "Mar 2025", cash_in: 980000, cash_out: 820000, net_cash: 160000, balance: 1500000 },
          { period: "Apr 2025", cash_in: 1050000, cash_out: 880000, net_cash: 170000, balance: 1670000 }
        ]
        return NextResponse.json({ cash_flow: cashFlowData })

      case 'insights':
        const insights = {
          trends: [
            {
              type: "revenue_growth",
              trend: "up",
              value: "+15% MoM",
              description: "Revenue growth accelerating"
            },
            {
              type: "opex_increase",
              trend: "down",
              value: "+8% MoM",
              description: "Operating expenses increasing"
            },
            {
              type: "ar_efficiency",
              trend: "up",
              value: "+12% efficiency",
              description: "AR collection improving"
            }
          ],
          risks: [
            {
              type: "seasonal_dip",
              severity: "medium",
              description: "Q2 typically shows 20% revenue decline"
            },
            {
              type: "customer_concentration",
              severity: "high",
              description: "40% of revenue from top 3 customers"
            }
          ]
        }
        return NextResponse.json(insights)

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error fetching cash data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cash data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, data } = body

    switch (action) {
      case 'optimize_cash':
        const recommendations = [
          {
            action: "Accelerate AR Collection",
            expected_impact: 180000,
            effort: "Medium",
            timeline: "30 days",
            description: "Implement automated AR follow-up and early payment discounts"
          },
          {
            action: "Extend AP Terms",
            expected_impact: 75000,
            effort: "Low",
            timeline: "14 days", 
            description: "Negotiate extended payment terms with key suppliers"
          },
          {
            action: "Reduce Inventory Levels",
            expected_impact: 120000,
            effort: "High",
            timeline: "60 days",
            description: "Implement just-in-time inventory management"
          }
        ]
        return NextResponse.json({ recommendations })

      case 'update_runway':
        return NextResponse.json({
          success: true,
          runway_weeks: data.weeks,
          updated_at: new Date().toISOString()
        })

      case 'run_analysis':
        return NextResponse.json({
          success: true,
          analysis_id: `analysis_${Date.now()}`,
          status: 'completed',
          generated_at: new Date().toISOString()
        })

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error processing cash request:', error)
    return NextResponse.json(
      { error: 'Failed to process cash request' },
      { status: 500 }
    )
  }
}













