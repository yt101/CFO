import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'rules'

    switch (type) {
      case 'rules':
        const controlRules = [
          {
            id: "gaap_flux_check",
            name: "GAAP Flux Check",
            description: "Validates that month-over-month changes in P&L accounts are within acceptable thresholds",
            category: "Financial",
            frequency: "Monthly",
            last_run: "2025-01-15",
            status: "ok"
          },
          {
            id: "balance_sheet_balance",
            name: "Balance Sheet Balance",
            description: "Ensures assets equal liabilities plus equity",
            category: "Financial",
            frequency: "Daily",
            last_run: "2025-01-16",
            status: "ok"
          },
          {
            id: "cash_reconciliation",
            name: "Cash Reconciliation",
            description: "Reconciles bank statements with general ledger cash accounts",
            category: "Cash",
            frequency: "Weekly",
            last_run: "2025-01-14",
            status: "warn"
          },
          {
            id: "revenue_recognition",
            name: "Revenue Recognition",
            description: "Validates proper revenue recognition timing and amounts",
            category: "Revenue",
            frequency: "Monthly",
            last_run: "2025-01-10",
            status: "fail"
          }
        ]
        return NextResponse.json({ rules: controlRules })

      case 'results':
        const controlResults = [
          {
            rule_id: "gaap_flux_check",
            rule_name: "GAAP Flux Check",
            status: "ok",
            evidence_links: [
              "https://api.cfo.ai/evidence/gaap_flux_2025_01.pdf",
              "https://api.cfo.ai/evidence/flux_analysis_2025_01.xlsx"
            ],
            details: "All P&L accounts within 15% variance threshold",
            run_time: "2025-01-15T14:30:00Z"
          },
          {
            rule_id: "balance_sheet_balance",
            rule_name: "Balance Sheet Balance",
            status: "ok",
            evidence_links: [
              "https://api.cfo.ai/evidence/bs_balance_2025_01_16.pdf"
            ],
            details: "Assets ($2.5M) = Liabilities + Equity ($2.5M)",
            run_time: "2025-01-16T09:15:00Z"
          },
          {
            rule_id: "cash_reconciliation",
            rule_name: "Cash Reconciliation",
            status: "warn",
            evidence_links: [
              "https://api.cfo.ai/evidence/cash_recon_2025_01_14.pdf"
            ],
            details: "Minor discrepancies found in petty cash account ($150 variance)",
            run_time: "2025-01-14T16:45:00Z"
          },
          {
            rule_id: "revenue_recognition",
            rule_name: "Revenue Recognition",
            status: "fail",
            evidence_links: [
              "https://api.cfo.ai/evidence/revenue_rec_2025_01_10.pdf"
            ],
            details: "Revenue recognized before delivery for 3 transactions totaling $45K",
            run_time: "2025-01-10T11:20:00Z"
          }
        ]
        return NextResponse.json({ results: controlResults })

      case 'summary':
        const summary = {
          total_rules: 4,
          passing: 2,
          warnings: 1,
          failing: 1,
          last_check: "2025-01-16T09:15:00Z"
        }
        return NextResponse.json(summary)

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error fetching controls data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch controls data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, data } = body

    switch (action) {
      case 'run_control_check':
        const { rule_id, period } = data
        const controlCheckResult = {
          rule_id,
          status: Math.random() > 0.5 ? "ok" : "warn",
          evidence_links: [
            `https://api.cfo.ai/evidence/${rule_id}_${period}.pdf`
          ],
          details: `Control check completed for ${rule_id}`,
          run_time: new Date().toISOString()
        }
        return NextResponse.json(controlCheckResult)

      case 'run_all_checks':
        const allChecksResult = {
          job_id: `job_${Date.now()}`,
          status: "running",
          started_at: new Date().toISOString(),
          estimated_completion: new Date(Date.now() + 10 * 60 * 1000).toISOString()
        }
        return NextResponse.json(allChecksResult)

      case 'update_rule':
        return NextResponse.json({
          success: true,
          rule_id: data.rule_id,
          updated_at: new Date().toISOString()
        })

      case 'create_rule':
        const newRule = {
          rule_id: `rule_${Date.now()}`,
          name: data.name,
          description: data.description,
          category: data.category,
          frequency: data.frequency,
          created_at: new Date().toISOString()
        }
        return NextResponse.json(newRule)

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error processing controls request:', error)
    return NextResponse.json(
      { error: 'Failed to process controls request' },
      { status: 500 }
    )
  }
}













