import { NextRequest, NextResponse } from "next/server"
import { createClient } from '@/lib/supabase/server'
import { createQuickBooksService } from '@/lib/integrations/quickbooks-service'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
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
      .single()

    if (!config?.parameters) {
      return NextResponse.json({ error: 'QuickBooks not configured. Please configure QuickBooks first.' }, { status: 400 })
    }

    // Create QuickBooks service with configuration
    const qbService = createQuickBooksService(config.parameters)
    
    // Get authorization URL
    const authUrl = qbService.getAuthorizationUrl()

    return NextResponse.json({
      success: true,
      authUrl,
      message: "Redirect to QuickBooks for authorization"
    })
  } catch (error) {
    console.error("QuickBooks OAuth initiation error:", error)
    return NextResponse.json(
      { error: "Failed to initiate QuickBooks OAuth" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json({ error: "Authorization code is required" }, { status: 400 })
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
      .single()

    if (!config?.parameters) {
      return NextResponse.json({ error: 'QuickBooks not configured' }, { status: 400 })
    }

    // Create QuickBooks service
    const qbService = createQuickBooksService(config.parameters)

    // Exchange code for tokens
    const tokens = await qbService.exchangeCodeForTokens(code)

    // Update configuration with tokens
    const updatedParameters = {
      ...config.parameters,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      companyId: tokens.companyId
    }

    const { error: updateError } = await supabase
      .from('service_configurations')
      .update({
        parameters: updatedParameters,
        enabled: true,
        status: 'active'
      })
      .eq('company_id', profile.company_id)
      .eq('service_id', 'quickbooks')

    if (updateError) {
      console.error('Error updating QuickBooks config:', updateError)
      return NextResponse.json({ error: 'Failed to save tokens' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      tokens,
      message: "QuickBooks connected successfully"
    })
  } catch (error) {
    console.error("QuickBooks token exchange error:", error)
    return NextResponse.json(
      { error: "Failed to connect QuickBooks" },
      { status: 500 }
    )
  }
}



























