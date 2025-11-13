import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createQuickBooksService } from '@/lib/integrations/quickbooks-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dataType = searchParams.get('type')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!dataType) {
      return NextResponse.json({ error: 'Data type is required' }, { status: 400 })
    }

    // Get current user and company
    const supabase = createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get company ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user.id)
      .single()

    if (!profile?.company_id) {
      return NextResponse.json({ error: 'No company found' }, { status: 400 })
    }

    // Get QuickBooks configuration
    const { data: config } = await supabase
      .from('service_configurations')
      .select('parameters')
      .eq('company_id', profile.company_id)
      .eq('service_id', 'quickbooks')
      .eq('enabled', true)
      .single()

    if (!config?.parameters) {
      return NextResponse.json({ error: 'QuickBooks not configured' }, { status: 400 })
    }

    // Create QuickBooks service
    const qbService = createQuickBooksService(config.parameters)

    // Fetch data based on type
    let data: any

    switch (dataType) {
      case 'company':
        data = await qbService.getCompanyInfo()
        break
      case 'accounts':
        data = await qbService.getAccounts()
        break
      case 'transactions':
        if (!startDate || !endDate) {
          return NextResponse.json({ error: 'Start date and end date are required for transactions' }, { status: 400 })
        }
        data = await qbService.getTransactions(startDate, endDate)
        break
      case 'profit-and-loss':
        if (!startDate || !endDate) {
          return NextResponse.json({ error: 'Start date and end date are required for P&L' }, { status: 400 })
        }
        data = await qbService.getProfitAndLossReport(startDate, endDate)
        break
      case 'balance-sheet':
        if (!endDate) {
          return NextResponse.json({ error: 'End date is required for balance sheet' }, { status: 400 })
        }
        data = await qbService.getBalanceSheetReport(endDate)
        break
      case 'cash-flow':
        if (!startDate || !endDate) {
          return NextResponse.json({ error: 'Start date and end date are required for cash flow' }, { status: 400 })
        }
        data = await qbService.getCashFlowReport(startDate, endDate)
        break
      case 'customers':
        data = await qbService.getCustomers()
        break
      case 'invoices':
        if (!startDate || !endDate) {
          return NextResponse.json({ error: 'Start date and end date are required for invoices' }, { status: 400 })
        }
        data = await qbService.getInvoices(startDate, endDate)
        break
      case 'bills':
        if (!startDate || !endDate) {
          return NextResponse.json({ error: 'Start date and end date are required for bills' }, { status: 400 })
        }
        data = await qbService.getBills(startDate, endDate)
        break
      case 'financial-summary':
        if (!startDate || !endDate) {
          return NextResponse.json({ error: 'Start date and end date are required for financial summary' }, { status: 400 })
        }
        data = await qbService.getFinancialDataForPeriod(startDate, endDate)
        break
      default:
        return NextResponse.json({ error: 'Invalid data type' }, { status: 400 })
    }

    return NextResponse.json({ success: true, data })

  } catch (error) {
    console.error('QuickBooks data fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch data from QuickBooks' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...params } = body

    // Get current user and company
    const supabase = createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get company ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user.id)
      .single()

    if (!profile?.company_id) {
      return NextResponse.json({ error: 'No company found' }, { status: 400 })
    }

    // Get QuickBooks configuration
    const { data: config } = await supabase
      .from('service_configurations')
      .select('parameters')
      .eq('company_id', profile.company_id)
      .eq('service_id', 'quickbooks')
      .eq('enabled', true)
      .single()

    if (!config?.parameters) {
      return NextResponse.json({ error: 'QuickBooks not configured' }, { status: 400 })
    }

    // Create QuickBooks service
    const qbService = createQuickBooksService(config.parameters)

    let result: any

    switch (action) {
      case 'test-connection':
        result = await qbService.testConnection()
        break
      case 'refresh-token':
        result = await qbService.refreshAccessToken()
        break
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json({ success: true, result })

  } catch (error) {
    console.error('QuickBooks action error:', error)
    return NextResponse.json(
      { error: 'Failed to perform action' },
      { status: 500 }
    )
  }
}












