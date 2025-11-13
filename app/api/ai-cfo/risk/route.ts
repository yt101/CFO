import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'risks'

    switch (type) {
      case 'risks':
        const risks = [
          {
            id: "1",
            area: "Financial",
            likelihood: 4,
            impact: 3,
            owner: "CFO",
            mitigation_status: "in_progress",
            description: "Currency fluctuation affecting international revenue",
            created: "2025-01-10",
            last_updated: "2025-01-15"
          },
          {
            id: "2",
            area: "Operational",
            likelihood: 2,
            impact: 4,
            owner: "COO",
            mitigation_status: "open",
            description: "Key supplier dependency risk in APAC region",
            created: "2025-01-08",
            last_updated: "2025-01-12"
          },
          {
            id: "3",
            area: "Technology",
            likelihood: 3,
            impact: 2,
            owner: "CTO",
            mitigation_status: "closed",
            description: "Data security breach potential",
            created: "2025-01-05",
            last_updated: "2025-01-14"
          },
          {
            id: "4",
            area: "Regulatory",
            likelihood: 2,
            impact: 5,
            owner: "Legal",
            mitigation_status: "in_progress",
            description: "New data privacy regulations compliance",
            created: "2025-01-12",
            last_updated: "2025-01-16"
          }
        ]
        return NextResponse.json({ risks })

      case 'matrix':
        const matrix = {
          dimensions: {
            likelihood: [1, 2, 3, 4, 5],
            impact: [1, 2, 3, 4, 5]
          },
          risk_counts: {
            "1-1": 0, "1-2": 0, "1-3": 0, "1-4": 0, "1-5": 0,
            "2-1": 0, "2-2": 0, "2-3": 0, "2-4": 1, "2-5": 0,
            "3-1": 0, "3-2": 1, "3-3": 0, "3-4": 0, "3-5": 0,
            "4-1": 0, "4-2": 0, "4-3": 1, "4-4": 0, "4-5": 0,
            "5-1": 0, "5-2": 0, "5-3": 0, "5-4": 0, "5-5": 0
          }
        }
        return NextResponse.json(matrix)

      case 'insights':
        const insights = {
          trends: [
            {
              type: "financial_risks",
              trend: "up",
              change: "+25%",
              description: "Financial risks increasing this month"
            },
            {
              type: "technology_risks",
              trend: "down",
              change: "-15%",
              description: "Technology risks decreasing this month"
            },
            {
              type: "regulatory_risks",
              trend: "stable",
              change: "0%",
              description: "Regulatory risks stable but high impact"
            }
          ],
          recommendations: [
            {
              title: "Currency Hedging",
              description: "Implement currency hedging for international revenue",
              priority: "high"
            },
            {
              title: "Supplier Diversification",
              description: "Identify alternative suppliers in different regions",
              priority: "medium"
            },
            {
              title: "Compliance Monitoring",
              description: "Set up automated compliance tracking system",
              priority: "high"
            }
          ]
        }
        return NextResponse.json(insights)

      case 'summary':
        const summary = {
          total_risks: 4,
          critical: 1,
          high: 1,
          medium: 1,
          low: 1,
          in_progress: 2,
          open: 1,
          closed: 1
        }
        return NextResponse.json(summary)

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error fetching risk data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch risk data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, data } = body

    switch (action) {
      case 'create_risk':
        const newRisk = {
          id: (Date.now()).toString(),
          area: data.area,
          likelihood: data.likelihood,
          impact: data.impact,
          owner: data.owner,
          mitigation_status: "open",
          description: data.description,
          created: new Date().toISOString().split('T')[0],
          last_updated: new Date().toISOString().split('T')[0]
        }
        return NextResponse.json(newRisk)

      case 'update_risk':
        return NextResponse.json({
          success: true,
          risk_id: data.id,
          updated_at: new Date().toISOString()
        })

      case 'delete_risk':
        return NextResponse.json({
          success: true,
          risk_id: data.id,
          deleted_at: new Date().toISOString()
        })

      case 'update_mitigation':
        return NextResponse.json({
          success: true,
          risk_id: data.risk_id,
          mitigation_status: data.status,
          updated_at: new Date().toISOString()
        })

      case 'run_risk_analysis':
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
    console.error('Error processing risk request:', error)
    return NextResponse.json(
      { error: 'Failed to process risk request' },
      { status: 500 }
    )
  }
}













