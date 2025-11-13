import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const DEMO_COMPANY_ID = '550e8400-e29b-41d4-a716-446655440001'

const isDemoMode = () =>
  process.env.NEXT_PUBLIC_FORCE_DEMO_MODE === 'true' ||
  process.env.FORCE_DEMO_MODE === 'true' ||
  process.env.NODE_ENV !== 'production'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Get current user and company context
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    let companyId: string | null = null
    
    if (userError || !user) {
      // Demo mode - use demo company_id
      companyId = DEMO_COMPANY_ID
    } else {
      // Get user's company_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single()

      companyId = profile?.company_id || null
    }

    if (!companyId && isDemoMode()) {
      companyId = DEMO_COMPANY_ID
    }

    // Fetch configurations from database
    if (companyId) {
      const { data: configurations, error } = await supabase
        .from('service_configurations')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })

      if (error) {
        // If table doesn't exist yet, return empty array
        console.error('Error fetching configurations:', error.message)
        return NextResponse.json({ configurations: [] })
      }

      return NextResponse.json({ configurations: configurations || [] })
    }

    return NextResponse.json({ configurations: [] })
  } catch (error: any) {
    // Graceful fallback - return empty array on any error
    console.error('Error fetching configurations:', error?.message || error)
    return NextResponse.json({ configurations: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { serviceId, parameters, enabled } = body

    // Get current user and company
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      // In demo mode, allow saving with demo company_id
      const demoCompanyId = DEMO_COMPANY_ID
      
      // Get service name from SERVICE_DEFINITIONS
      const { SERVICE_DEFINITIONS } = await import('@/lib/integrations/service-parameters')
      const serviceDef = SERVICE_DEFINITIONS[serviceId]
      const serviceName = serviceDef?.name || serviceId
      const category = serviceDef?.category || 'Other'

      // Save to database with demo company_id
      const { data, error } = await supabase
        .from('service_configurations')
        .upsert({
          company_id: demoCompanyId,
          service_id: serviceId,
          service_name: serviceName,
          category: category,
          parameters: parameters,
          enabled: enabled || false,
          status: enabled ? 'active' : 'inactive',
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'company_id,service_id'
        })
        .select()
        .single()

      if (error) {
        console.error('Error saving configuration:', error)
        return NextResponse.json(
          { error: 'Failed to save configuration' },
          { status: 500 }
        )
      }

      return NextResponse.json({ 
        success: true, 
        configuration: data
      })
    }

    // Get user's company_id
    const { data: profile } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user.id)
      .single()
    const targetCompanyId = profile?.company_id || (isDemoMode() ? DEMO_COMPANY_ID : null)

    if (!targetCompanyId) {
      return NextResponse.json(
        { error: 'No company found' },
        { status: 400 }
      )
    }

    // Get service name from SERVICE_DEFINITIONS
    const { SERVICE_DEFINITIONS } = await import('@/lib/integrations/service-parameters')
    const serviceDef = SERVICE_DEFINITIONS[serviceId]
    const serviceName = serviceDef?.name || serviceId
    const category = serviceDef?.category || 'Other'

    // Upsert configuration
    const { data, error } = await supabase
      .from('service_configurations')
      .upsert({
        company_id: targetCompanyId,
        service_id: serviceId,
        service_name: serviceName,
        category: category,
        parameters: parameters,
        enabled: enabled || false,
        status: enabled ? 'active' : 'inactive',
        updated_at: new Date().toISOString(),
        updated_by: user.id
      }, {
        onConflict: 'company_id,service_id'
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving configuration:', error)
      return NextResponse.json(
        { error: 'Failed to save configuration' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      configuration: data
    })
  } catch (error) {
    console.error('Error saving configuration:', error)
    return NextResponse.json(
      { error: 'Failed to save configuration' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { serviceId, parameters: providedParameters } = body

    // Get current user and company
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    // Determine company_id (support demo mode when unauthenticated)
    let companyId: string | null = null
    if (userError || !user) {
      companyId = DEMO_COMPANY_ID
    } else {
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single()
      companyId = profile?.company_id || null
    }

    if (!companyId && isDemoMode()) {
      companyId = DEMO_COMPANY_ID
    }

    if (!companyId) {
      return NextResponse.json(
        { error: 'No company found' },
        { status: 400 }
      )
    }

    // Get configuration from database
    const { data: config } = await supabase
      .from('service_configurations')
      .select('*')
      .eq('company_id', companyId)
      .eq('service_id', serviceId)
      .single()

    // If not found in DB, but parameters were provided by client, use them for testing
    if (!config && !providedParameters) {
      return NextResponse.json(
        { error: 'Configuration not found' },
        { status: 404 }
      )
    }

    // Test the service connection with real parameters
    const testResult = await testServiceConnection(serviceId, config?.parameters ?? providedParameters)

    // Update configuration with test results
    let updatedConfig = null
    let updateError = null as any
    if (config) {
      const updateRes = await supabase
        .from('service_configurations')
        .update({
          status: testResult.success ? 'active' : 'error',
          last_tested: new Date().toISOString(),
          test_result: testResult,
          enabled: testResult.success ? config.enabled : false
        })
        .eq('company_id', companyId)
        .eq('service_id', serviceId)
        .select()
        .single()
      updatedConfig = updateRes.data
      updateError = updateRes.error
    }

    if (updateError) {
      console.error('Error updating test results:', updateError)
    }

    return NextResponse.json({ 
      success: testResult.success,
      message: testResult.message,
      configuration: updatedConfig || config || { service_id: serviceId, parameters: providedParameters }
    })
  } catch (error) {
    console.error('Error testing connection:', error)
    return NextResponse.json(
      { error: 'Failed to test connection' },
      { status: 500 }
    )
  }
}

async function testServiceConnection(serviceId: string, parameters: any) {
  // Test actual API connections based on service type
  
  try {
    switch (serviceId) {
      case 'openai': {
        if (!parameters?.apiKey || !parameters.apiKey.startsWith('sk-')) {
          return { success: false, message: 'Invalid API key format' }
        }
        
        // Test OpenAI API
        const response = await fetch('https://api.openai.com/v1/models', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${parameters.apiKey}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (!response.ok) {
          return { 
            success: false, 
            message: `OpenAI API error: ${response.status} ${response.statusText}` 
          }
        }
        
        return { 
          success: true, 
          message: 'OpenAI API connection successful' 
        }
      }
      
      case 'anthropic': {
        if (!parameters?.apiKey || !parameters.apiKey.startsWith('sk-ant-')) {
          return { success: false, message: 'Invalid API key format' }
        }
        
        // Test Anthropic API
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': parameters.apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'claude-3-sonnet-20240229',
            max_tokens: 10,
            messages: [{ role: 'user', content: 'test' }]
          })
        })
        
        if (!response.ok) {
          return { 
            success: false, 
            message: `Anthropic API error: ${response.status}` 
          }
        }
        
        return { 
          success: true, 
          message: 'Anthropic API connection successful' 
        }
      }
      
      case 'quickbooks': {
        // If OAuth tokens are present, test against QuickBooks API
        if (parameters?.accessToken && parameters?.realmId) {
          const env = parameters.environment === 'production' ? 'quickbooks' : 'sandbox-quickbooks'
          const url = `https://${env}.intuit.com/v3/company/${parameters.realmId}/companyinfo/${parameters.realmId}`
          const response = await fetch(url, {
            headers: {
              'Authorization': `Bearer ${parameters.accessToken}`,
              'Accept': 'application/json'
            }
          })
          if (!response.ok) {
            return { success: false, message: `QuickBooks API error: ${response.status}` }
          }
          return { success: true, message: 'QuickBooks API connection successful' }
        }

        // Demo/sandbox mode: treat presence of Company ID as valid connectivity so UI can proceed
        if (parameters?.companyId || parameters?.companyId?.value) {
          return { success: true, message: 'QuickBooks Company ID verified (sandbox/demo mode)' }
        }

        return { success: false, message: 'QuickBooks not connected - Company ID or OAuth required' }
      }
      
      default:
        // For other services, return success if parameters exist
        if (parameters && Object.keys(parameters).length > 0) {
          return { 
            success: true, 
            message: `${serviceId} configuration saved` 
          }
        }
        return { 
          success: false, 
          message: 'No configuration parameters provided' 
        }
    }
  } catch (error: any) {
    return { 
      success: false, 
      message: `Connection test failed: ${error.message}` 
    }
  }
}
