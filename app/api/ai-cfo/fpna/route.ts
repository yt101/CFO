import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'scenarios'

    switch (type) {
      case 'scenarios':
        const scenarios = [
          {
            id: "1",
            name: "Base Case",
            description: "Current trajectory with no changes",
            created: "2025-01-15",
            status: "active",
            revenue: 2400000,
            ebitda: 480000
          },
          {
            id: "2", 
            name: "Optimistic",
            description: "Best case scenario with market growth",
            created: "2025-01-15",
            status: "draft",
            revenue: 3000000,
            ebitda: 750000
          },
          {
            id: "3",
            name: "Conservative",
            description: "Economic downturn scenario",
            created: "2025-01-14",
            status: "draft", 
            revenue: 1800000,
            ebitda: 270000
          }
        ]
        return NextResponse.json({ scenarios })

      case 'forecast':
        const scenarioId = searchParams.get('scenario_id')
        const forecast = {
          scenario_id: scenarioId || "1",
          currency: "USD",
          months: [
            {
              period: "2025-02",
              revenue: 800000,
              cogs: 320000,
              opex: 200000,
              ebitda: 280000,
              cash_end: 1200000
            },
            {
              period: "2025-03", 
              revenue: 850000,
              cogs: 340000,
              opex: 210000,
              ebitda: 300000,
              cash_end: 1500000
            },
            {
              period: "2025-04",
              revenue: 900000,
              cogs: 360000,
              opex: 220000,
              ebitda: 320000,
              cash_end: 1820000
            }
          ]
        }
        return NextResponse.json(forecast)

      case 'variance':
        const period = searchParams.get('period') || '2025-01'
        const dimension = searchParams.get('dimension') || 'account'
        
        const variance = {
          period,
          dimension,
          bridge: [
            {
              label: "Revenue Variance",
              amount: -50000,
              driver: "Lower conversion rate"
            },
            {
              label: "COGS Variance",
              amount: 20000,
              driver: "Better supplier pricing"
            },
            {
              label: "Marketing Variance",
              amount: -20000,
              driver: "Increased ad spend"
            }
          ],
          narrative: "Revenue below budget due to lower conversion rates, partially offset by better COGS performance from improved supplier negotiations."
        }
        return NextResponse.json(variance)

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error fetching FP&A data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch FP&A data' },
      { status: 500 }
    )
  }
}

// Base financial data for calculations
const baseFinancialData = {
  revenue: 2400000,
  cogs: 960000,
  opex: 720000,
  ebitda: 720000,
  cash_end: 1200000
}

// Driver mappings to financial line items
const driverMappings = {
  'revenue_growth': 'revenue',
  'customer_acquisition': 'revenue',
  'average_deal_size': 'revenue',
  'cogs_per_unit': 'cogs',
  'supplier_pricing': 'cogs',
  'marketing_spend': 'opex',
  'operational_efficiency': 'opex',
  'headcount': 'opex',
  'rent': 'opex',
  'utilities': 'opex'
}

function calculateFinancialImpact(baseValue: number, override: any) {
  switch (override.type) {
    case 'set':
      return override.value
    case 'inc':
      return baseValue + override.value
    case 'dec':
      return baseValue - override.value
    case 'mul':
      return baseValue * (1 + override.value / 100)
    default:
      return baseValue
  }
}

function calculateScenario(baseData: any, overrides: any[]) {
  const calculated = { ...baseData }
  
  overrides.forEach(override => {
    const driverName = override.name.toLowerCase().replace(/\s+/g, '_')
    const mappedField = driverMappings[driverName as keyof typeof driverMappings]
    
    if (mappedField && calculated[mappedField] !== undefined) {
      calculated[mappedField] = calculateFinancialImpact(calculated[mappedField], override)
    }
  })
  
  // Recalculate EBITDA (Revenue - COGS - OpEx)
  calculated.ebitda = calculated.revenue - calculated.cogs - calculated.opex
  
  // Adjust cash position based on EBITDA change
  const ebitdaChange = calculated.ebitda - baseData.ebitda
  calculated.cash_end = baseData.cash_end + ebitdaChange
  
  return calculated
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, data } = body

    switch (action) {
      case 'create_scenario':
        const calculatedFinancials = calculateScenario(baseFinancialData, data.overrides || [])
        
        const newScenario = {
          scenario_id: `scenario_${Date.now()}`,
          name: data.name,
          created_at: new Date().toISOString(),
          base: data.base || 'latest_actuals',
          overrides: data.overrides || [],
          calculated_financials: calculatedFinancials,
          impact_summary: {
            revenue_change: calculatedFinancials.revenue - baseFinancialData.revenue,
            ebitda_change: calculatedFinancials.ebitda - baseFinancialData.ebitda,
            cash_change: calculatedFinancials.cash_end - baseFinancialData.cash_end
          }
        }
        return NextResponse.json(newScenario)

      case 'update_scenario':
        return NextResponse.json({
          success: true,
          scenario_id: data.scenario_id,
          updated_at: new Date().toISOString()
        })

      case 'delete_scenario':
        return NextResponse.json({
          success: true,
          scenario_id: data.scenario_id,
          deleted_at: new Date().toISOString()
        })

      case 'run_forecast':
        return NextResponse.json({
          success: true,
          forecast_id: `forecast_${Date.now()}`,
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
    console.error('Error processing FP&A request:', error)
    return NextResponse.json(
      { error: 'Failed to process FP&A request' },
      { status: 500 }
    )
  }
}


