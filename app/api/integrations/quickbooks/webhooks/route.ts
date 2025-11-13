import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { registerQuickBooksWebhook } from '@/lib/integrations/quickbooks-webhook-service'

/**
 * Register QuickBooks Webhook
 * This endpoint registers your webhook URL with QuickBooks
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { webhookUrl, entities } = body

    // Get current user and company
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get company ID from user profile
    let company_id: string | null = null
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single()
      
      company_id = profile?.company_id || null
    }

    // Use demo company ID if no user company found
    if (!company_id) {
      company_id = '550e8400-e29b-41d4-a716-446655440001'
    }

    // Get QuickBooks configuration
    const { data: config } = await supabase
      .from('service_configurations')
      .select('parameters')
      .eq('company_id', company_id)
      .eq('service_id', 'quickbooks')
      .single()

    if (!config?.parameters) {
      return NextResponse.json({ error: 'QuickBooks not configured' }, { status: 400 })
    }

    // Extract tokens and config
    const accessToken = config.parameters.accessToken?.value || config.parameters.accessToken
    const refreshToken = config.parameters.refreshToken?.value || config.parameters.refreshToken
    const realmId = config.parameters.realmId?.value || config.parameters.realmId
    const environment = config.parameters.environment?.value || config.parameters.environment || 'sandbox'

    if (!accessToken || !realmId) {
      return NextResponse.json(
        { error: 'QuickBooks OAuth tokens required. Please complete OAuth flow first.' },
        { status: 400 }
      )
    }

    // Use provided webhook URL or default
    const finalWebhookUrl = webhookUrl || config.parameters.webhookUrl?.value || 
      `${process.env.NEXT_PUBLIC_APP_URL || 'https://fingenieai.com'}/api/integrations/quickbooks/webhooks`

    // Register webhook with QuickBooks
    try {
      // Note: QuickBooks webhook registration might use a different API endpoint
      // This is a general implementation - adjust based on QuickBooks API docs
      const baseUrl = environment === 'production'
        ? 'https://quickbooks.api.intuit.com'
        : 'https://sandbox-quickbooks.api.intuit.com'

      // Register webhook (this endpoint might vary - check QuickBooks API docs)
      const response = await fetch(`${baseUrl}/v3/company/${realmId}/webhooks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          webhookUrl: finalWebhookUrl,
          entities: entities || [
            'Account',
            'Invoice',
            'Payment',
            'Bill',
            'Purchase',
            'JournalEntry',
            'Customer',
            'Vendor'
          ]
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Webhook registration error:', errorText)
        
        // Return a helpful message even if registration fails
        // (QuickBooks webhook setup might need to be done in Developer Portal)
        return NextResponse.json({
          success: false,
          message: 'Webhook registration via API may not be available. Please register in QuickBooks Developer Portal.',
          webhookUrl: finalWebhookUrl,
          instructions: [
            '1. Go to https://developer.intuit.com/app/developer/dashboard',
            '2. Select your app',
            '3. Navigate to Webhooks section',
            `4. Add webhook URL: ${finalWebhookUrl}`,
            '5. Select entities to monitor',
            '6. Save the verifier token provided'
          ]
        })
      }

      const webhookData = await response.json()

      // Update configuration with webhook URL and verifier token
      const updatedParameters = {
        ...config.parameters,
        webhookUrl: finalWebhookUrl,
        webhookVerifierToken: webhookData.verifierToken || config.parameters.webhookVerifierToken,
        webhookRegistered: true,
        webhookRegisteredAt: new Date().toISOString()
      }

      await supabase
        .from('service_configurations')
        .update({
          parameters: updatedParameters,
          updated_at: new Date().toISOString()
        })
        .eq('company_id', company_id)
        .eq('service_id', 'quickbooks')

      return NextResponse.json({
        success: true,
        message: 'Webhook registered successfully',
        webhookUrl: finalWebhookUrl,
        verifierToken: webhookData.verifierToken,
        data: webhookData
      })

    } catch (error: any) {
      console.error('Webhook registration error:', error)
      
      // Provide manual setup instructions
      return NextResponse.json({
        success: false,
        message: 'Automatic webhook registration failed. Please set up manually in Developer Portal.',
        webhookUrl: finalWebhookUrl,
        manualSetupRequired: true,
        instructions: [
          '1. Log in to QuickBooks Developer Portal: https://developer.intuit.com/app/developer/dashboard',
          '2. Select your QuickBooks app',
          '3. Go to "Webhooks" or "Event Subscriptions" section',
          `4. Add webhook URL: ${finalWebhookUrl}`,
          '5. Select entities: Account, Invoice, Payment, Bill, Purchase, JournalEntry, Customer, Vendor',
          '6. Save the webhook and copy the "Verifier Token"',
          '7. Paste the verifier token in the QuickBooks configuration',
          '8. Save configuration'
        ],
        error: error.message
      })
    }

  } catch (error: any) {
    console.error('Webhook registration endpoint error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to register webhook' },
      { status: 500 }
    )
  }
}

/**
 * Get webhook status
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
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

    const company_id = profile?.company_id || '550e8400-e29b-41d4-a716-446655440001'

    // Get QuickBooks configuration
    const { data: config } = await supabase
      .from('service_configurations')
      .select('parameters')
      .eq('company_id', company_id)
      .eq('service_id', 'quickbooks')
      .single()

    if (!config?.parameters) {
      return NextResponse.json({ error: 'QuickBooks not configured' }, { status: 400 })
    }

    const webhookUrl = config.parameters.webhookUrl?.value || config.parameters.webhookUrl
    const webhookRegistered = config.parameters.webhookRegistered || false

    return NextResponse.json({
      webhookUrl: webhookUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'https://fingenieai.com'}/api/integrations/quickbooks/webhooks`,
      registered: webhookRegistered,
      hasVerifierToken: !!(config.parameters.webhookVerifierToken?.value || config.parameters.webhookVerifierToken),
      registeredAt: config.parameters.webhookRegisteredAt
    })

  } catch (error: any) {
    console.error('Get webhook status error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get webhook status' },
      { status: 500 }
    )
  }
}



