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
      details: testResult.details,
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
          
          try {
          const response = await fetch(url, {
            headers: {
              'Authorization': `Bearer ${parameters.accessToken}`,
              'Accept': 'application/json'
            }
          })
            
          if (!response.ok) {
              const errorText = await response.text()
              let errorDetails = `HTTP ${response.status}: ${response.statusText}`
              
              try {
                const errorData = JSON.parse(errorText)
                if (errorData.Fault) {
                  errorDetails = `QuickBooks API Error: ${errorData.Fault.Error?.[0]?.Message || errorData.Fault.Error?.[0]?.Detail || errorText}`
                } else if (errorData.error_description) {
                  errorDetails = errorData.error_description
                }
              } catch {
                errorDetails = errorText.substring(0, 200) || errorDetails
              }
              
              if (response.status === 401) {
                return { 
                  success: false, 
                  message: 'QuickBooks authentication failed',
                  details: 'Access token is invalid or expired. Please reconnect by clicking "Connect" to refresh your OAuth tokens.'
                }
              } else if (response.status === 403) {
                return { 
                  success: false, 
                  message: 'QuickBooks access denied',
                  details: 'You do not have permission to access this QuickBooks company. Please check your permissions in QuickBooks.'
                }
              } else if (response.status === 404) {
                return { 
                  success: false, 
                  message: 'QuickBooks company not found',
                  details: `Company with ID ${parameters.realmId} was not found. Please verify your Company ID (realmId) is correct.`
                }
              }
              
              return { 
                success: false, 
                message: 'QuickBooks API connection failed',
                details: errorDetails
              }
            }
            
            const data = await response.json().catch(() => ({}))
            const companyName = data.CompanyInfo?.CompanyName || 'Unknown'
            const environment = parameters.environment === 'production' ? 'Production' : 'Sandbox'
            
            return { 
              success: true, 
              message: 'QuickBooks OAuth connection verified',
              details: `Successfully connected to ${companyName} (${environment} environment). Company ID: ${parameters.realmId}`
            }
          } catch (error: any) {
            return { 
              success: false, 
              message: 'QuickBooks connection test failed',
              details: `Network error: ${error.message || 'Unable to reach QuickBooks API. Please check your internet connection.'}`
            }
          }
        }

        // Demo/sandbox mode: validate configuration even without OAuth tokens
        const companyId = parameters?.companyId || parameters?.companyId?.value || ''
        const clientId = parameters?.clientId || parameters?.clientId?.value || ''
        const clientSecret = parameters?.clientSecret || parameters?.clientSecret?.value || ''
        const redirectUri = parameters?.redirectUri || parameters?.redirectUri?.value || ''
        const webhookUrl = parameters?.webhookUrl || parameters?.webhookUrl?.value || ''
        const environment = parameters?.environment || parameters?.environment?.value || 'sandbox'
        
        // If we have access tokens, the redirectUri in config is what QuickBooks accepted
        // This is the actual redirect URI that QuickBooks expects (from successful OAuth)
        const quickBooksAcceptedRedirectUri = (parameters?.accessToken && redirectUri) ? redirectUri : null
        
        // Debug logging - log ALL parameters received
        console.log('🔍 QuickBooks Test Connection - ALL Parameters received:', {
          hasCompanyId: !!companyId,
          hasClientId: !!clientId,
          hasClientSecret: !!clientSecret,
          redirectUri: redirectUri || 'MISSING',
          webhookUrl: webhookUrl || 'MISSING',
          environment,
          allParameters: Object.keys(parameters || {})
        })
        
        // Log the actual parameter values for debugging
        console.log('📋 Parameter values:', {
          companyId: companyId ? `${companyId.substring(0, 10)}...` : 'empty',
          clientId: clientId ? `${clientId.substring(0, 10)}...` : 'empty',
          hasClientSecret: !!clientSecret,
          redirectUri,
          webhookUrl,
          redirectUriDomain: redirectUri ? new URL(redirectUri).hostname : 'N/A',
          webhookUrlDomain: webhookUrl ? new URL(webhookUrl).hostname : 'N/A'
        })
        
        if (companyId) {
          // Validate required fields
          const missingFields: string[] = []
          if (!clientId) missingFields.push('Client ID')
          if (!clientSecret) missingFields.push('Client Secret')
          if (!redirectUri) missingFields.push('Redirect URI')
          
          if (missingFields.length > 0) {
            return { 
              success: false, 
              message: 'Incomplete QuickBooks configuration',
              details: `Missing required fields: ${missingFields.join(', ')}. Please configure all required fields before testing.`
            }
          }
          
          // Validate redirect URI format
          try {
            const redirectUrl = new URL(redirectUri)
            if (!redirectUrl.pathname.endsWith('/api/integrations/quickbooks/oauth')) {
              return {
                success: false,
                message: 'Invalid Redirect URI format',
                details: `Redirect URI must end with /api/integrations/quickbooks/oauth\n\nCurrent: ${redirectUri}\n\nPlease update it to match the expected format and ensure it matches what's configured in QuickBooks Developer Portal.`
              }
            }
            
            // Check if redirect URI is localhost (fail if not using tunnel)
            const isLocalhost = redirectUrl.hostname === 'localhost' || redirectUrl.hostname === '127.0.0.1'
            const isTunnel = redirectUrl.hostname.includes('ngrok') || redirectUrl.hostname.includes('localhost.run') || redirectUrl.hostname.includes('.loca.lt')
            
            if (isLocalhost && !isTunnel) {
              return {
                success: false,
                message: 'Redirect URI not publicly accessible',
                details: `Your redirect URI uses localhost: ${redirectUri}\n\nQuickBooks OAuth requires a publicly accessible URL. You need:\n1. A tunnel service (ngrok, localhost.run, etc.)\n2. The tunnel URL configured in QuickBooks Developer Portal\n3. The same URL in the Redirect URI field\n\nCurrent redirect URI will not work with QuickBooks OAuth.`
              }
            }
            
            // Check for potential URL mismatch (local vs production)
            const isProductionUrl = redirectUrl.hostname.includes('vercel.app') || 
                                   redirectUrl.hostname.includes('fingenieai.com') ||
                                   redirectUrl.hostname.includes('netlify.app') ||
                                   redirectUrl.hostname.includes('herokuapp.com') ||
                                   redirectUrl.hostname.includes('cfo-master')
            const isLocalTunnel = isTunnel && !isProductionUrl
            
            // CRITICAL: Always validate that redirect URI and webhook URL use the same domain
            // This is required because QuickBooks OAuth will fail if URLs don't match
            if (webhookUrl && webhookUrl.trim() !== '') {
              try {
                const webhookUrlObj = new URL(webhookUrl)
                const webhookIsTunnel = webhookUrlObj.hostname.includes('ngrok') || 
                                       webhookUrlObj.hostname.includes('localhost.run') ||
                                       webhookUrlObj.hostname.includes('.loca.lt')
                const webhookIsProduction = webhookUrlObj.hostname.includes('vercel.app') || 
                                            webhookUrlObj.hostname.includes('fingenieai.com') ||
                                            webhookUrlObj.hostname.includes('netlify.app') ||
                                            webhookUrlObj.hostname.includes('herokuapp.com') ||
                                            webhookUrlObj.hostname.includes('cfo-master')
                
                const redirectDomain = redirectUrl.hostname
                const webhookDomain = webhookUrlObj.hostname
                
                // Check if domains match - THIS IS CRITICAL FOR OAUTH SUCCESS
                const expectedQuickBooksRedirectUri = webhookUrl.replace('/webhooks', '/oauth')
                console.log('🔍 Comparing domains for OAuth validation:', {
                  yourRedirectUri: redirectUri,
                  yourRedirectDomain: redirectDomain,
                  quickbooksWebhookUrl: webhookUrl,
                  quickbooksWebhookDomain: webhookDomain,
                  expectedQuickBooksRedirectUri: expectedQuickBooksRedirectUri,
                  match: redirectDomain === webhookDomain,
                  willFail: redirectDomain !== webhookDomain
                })
                
                // FAIL if domains don't match - OAuth will definitely fail
                if (redirectDomain !== webhookDomain) {
                  // Determine the type of mismatch
                  const redirectType = isTunnel ? 'tunnel/local (ngrok)' : (isProductionUrl ? 'production (Vercel/Netlify)' : 'unknown')
                  const webhookType = webhookIsTunnel ? 'tunnel/local (ngrok)' : (webhookIsProduction ? 'production (Vercel/Netlify)' : 'unknown')
                  
                  console.log('❌ URL mismatch detected - OAuth will fail')
                  console.log('📋 Configuration Comparison:', {
                    yourRedirectUri: redirectUri,
                    yourRedirectDomain: redirectDomain,
                    quickbooksWebhookUrl: webhookUrl,
                    quickbooksWebhookDomain: webhookDomain,
                    expectedQuickBooksRedirectUri: expectedQuickBooksRedirectUri,
                    mismatch: 'Domains do not match - OAuth will fail'
                  })
                  
                  return {
                    success: false,
                    message: '❌ OAuth will fail - URL domain mismatch',
                    details: `⚠️ CRITICAL ERROR: URL Mismatch Detected\n\n📋 Your Configuration:\n• Your Redirect URI: ${redirectUri}\n• Your Redirect Domain: ${redirectDomain} (${redirectType})\n\n📋 QuickBooks Configuration (inferred from Webhook URL):\n• QuickBooks Webhook URL: ${webhookUrl}\n• QuickBooks Domain: ${webhookDomain} (${webhookType})\n• Expected QuickBooks Redirect URI: ${expectedQuickBooksRedirectUri}\n\n🚫 OAuth WILL FAIL because:\n1. Your Redirect URI uses domain: ${redirectDomain}\n2. QuickBooks expects Redirect URI with domain: ${webhookDomain}\n3. QuickBooks requires the Redirect URI to match EXACTLY what's registered in Developer Portal\n4. The mismatch will cause OAuth to be rejected\n\n✅ To fix:\n• Update your Redirect URI to match QuickBooks: ${expectedQuickBooksRedirectUri}\n• Or update QuickBooks Developer Portal to use: ${redirectUri}\n• Both URLs must use the SAME domain: ${webhookDomain}\n\nCurrent configuration will cause OAuth authentication to fail.`
                  }
                }
                
                // Additional check: if one is tunnel and other is production
                if ((isTunnel && webhookIsProduction) || (isProductionUrl && webhookIsTunnel)) {
                  console.log('❌ Environment mismatch detected')
                  return {
                    success: false,
                    message: '❌ OAuth will fail - Local/Production URL mismatch',
                    details: `Your Redirect URI and Webhook URL are from different environments:\n• Redirect URI: ${redirectUri} (${isTunnel ? 'local/tunnel' : 'production'})\n• Webhook URL: ${webhookUrl} (${webhookIsTunnel ? 'local/tunnel' : 'production'})\n\n🚫 OAuth WILL FAIL because you cannot mix local/tunnel URLs with production URLs.\n\nBoth must be from the same environment and match what's configured in QuickBooks Developer Portal.`
                  }
                }
                
                console.log('✅ Domain validation passed - URLs match')
              } catch (e) {
                console.error('Error validating webhook URL:', e)
                // Webhook URL validation will catch this separately below
              }
            } else {
              // Webhook URL not provided - this is okay for testing, but warn
              console.log('⚠️ Webhook URL not provided - skipping domain validation')
            }
          } catch (e) {
            return {
              success: false,
              message: 'Invalid Redirect URI format',
              details: `Redirect URI is not a valid URL: ${redirectUri}\n\nPlease enter a valid URL that matches what's configured in QuickBooks Developer Portal.`
            }
          }
          
          // Validate webhook URL format if provided
          if (webhookUrl) {
            try {
              const webhookUrlObj = new URL(webhookUrl)
              if (!webhookUrlObj.pathname.endsWith('/api/integrations/quickbooks/webhooks')) {
                return {
                  success: false,
                  message: 'Invalid Webhook URL format',
                  details: `Webhook URL must end with /api/integrations/quickbooks/webhooks\n\nCurrent: ${webhookUrl}\n\nPlease update it to match the expected format.`
                }
              }
            } catch (e) {
              return {
                success: false,
                message: 'Invalid Webhook URL format',
                details: `Webhook URL is not a valid URL: ${webhookUrl}\n\nPlease enter a valid URL.`
              }
            }
          }
          
          // Final validation: If webhook URL is provided, it must match redirect URI domain
          // This is a final check to ensure we didn't miss anything
          if (webhookUrl && webhookUrl.trim() !== '') {
            try {
              const finalRedirectUrl = new URL(redirectUri)
              const finalWebhookUrl = new URL(webhookUrl)
              
              console.log('🔍 FINAL CHECK: Comparing domains one more time', {
                redirect: finalRedirectUrl.hostname,
                webhook: finalWebhookUrl.hostname,
                match: finalRedirectUrl.hostname === finalWebhookUrl.hostname
              })
              
              if (finalRedirectUrl.hostname !== finalWebhookUrl.hostname) {
                console.log('❌ FINAL CHECK: Domain mismatch detected - FAILING')
                return {
                  success: false,
                  message: '❌ OAuth will fail - URL domain mismatch',
                  details: `Your Redirect URI and Webhook URL use different domains:\n• Redirect URI: ${redirectUri} (${finalRedirectUrl.hostname})\n• Webhook URL: ${webhookUrl} (${finalWebhookUrl.hostname})\n\n⚠️ CRITICAL: Both URLs must use the SAME domain/base URL.\n\nThis configuration will FAIL OAuth because QuickBooks requires matching URLs. Please update both URLs to use the same domain.`
                }
              }
              
              // Additional check: Warn if using local/tunnel URLs (ngrok) - these won't work if QuickBooks has production URLs
              const redirectIsNgrok = finalRedirectUrl.hostname.includes('ngrok')
              const webhookIsNgrok = finalWebhookUrl.hostname.includes('ngrok')
              const redirectIsProduction = finalRedirectUrl.hostname.includes('vercel.app') || 
                                          finalRedirectUrl.hostname.includes('cfo-master')
              const webhookIsProduction = finalWebhookUrl.hostname.includes('vercel.app') || 
                                         finalWebhookUrl.hostname.includes('cfo-master')
              
              // If both are ngrok but user mentioned QuickBooks has vercel, warn them
              if ((redirectIsNgrok || webhookIsNgrok) && !redirectIsProduction && !webhookIsProduction) {
                console.log('⚠️ WARNING: Using local/tunnel URLs - OAuth may fail if QuickBooks has production URLs')
                // Don't fail here, but this is a warning - OAuth will fail if QuickBooks has different URLs
              }
            } catch (e) {
              // If URL parsing fails here, it should have been caught earlier, but just in case
              console.error('Error in final URL validation:', e)
            }
          }
          
          // CRITICAL: OAuth failure detection
          // Check for scenarios where OAuth will definitely fail
          const redirectUrlObj = new URL(redirectUri)
          const redirectDomain = redirectUrlObj.hostname
          
          // Check if using ngrok but might need production URL
          const isNgrok = redirectDomain.includes('ngrok')
          const isProduction = redirectDomain.includes('vercel.app') || 
                              redirectDomain.includes('cfo-master') ||
                              redirectDomain.includes('fingenieai.com')
          
          // CRITICAL CHECK: If webhook URL is provided and different from redirect URI, OAuth WILL FAIL
          // The webhook URL likely represents what's configured in QuickBooks
          let oauthFailureReason = null
          if (webhookUrl && webhookUrl.trim() !== '') {
            try {
              const webhookUrlObj = new URL(webhookUrl)
              const webhookDomain = webhookUrlObj.hostname
              const expectedRedirectUri = webhookUrl.replace('/webhooks', '/oauth')
              
              if (redirectDomain !== webhookDomain) {
                oauthFailureReason = `🚫 OAuth WILL FAIL: URL Mismatch Detected\n\n📋 Your Configuration:\n• Your Redirect URI: ${redirectUri}\n• Your Redirect Domain: ${redirectDomain}\n\n📋 QuickBooks Configuration (inferred from Webhook URL):\n• QuickBooks Webhook URL: ${webhookUrl}\n• QuickBooks Domain: ${webhookDomain}\n• Expected QuickBooks Redirect URI: ${expectedRedirectUri}\n\n🚫 OAuth WILL FAIL because:\n1. Your Redirect URI (${redirectUri}) uses domain: ${redirectDomain}\n2. QuickBooks expects Redirect URI with domain: ${webhookDomain}\n3. QuickBooks requires the Redirect URI to match EXACTLY what's registered in Developer Portal\n4. The mismatch will cause OAuth to be rejected\n\n✅ To fix:\n• Update your Redirect URI to match QuickBooks: ${expectedRedirectUri}\n• Or update QuickBooks Developer Portal to use: ${redirectUri}\n• Both URLs must use the SAME domain: ${webhookDomain}`
              }
            } catch (e) {
              console.error('Error in OAuth failure detection:', e)
            }
          }
          
          // If OAuth will definitely fail, return failure immediately
          if (oauthFailureReason) {
            return {
              success: false,
              message: '❌ OAuth will fail - URL domain mismatch',
              details: oauthFailureReason
            }
          }
          
          // Add warning if using local/tunnel URLs
          let warningMessage = ''
          if (isNgrok && !isProduction) {
            warningMessage = `\n\n⚠️ WARNING: You're using a local/tunnel URL (${redirectDomain}). OAuth will FAIL if:\n• QuickBooks Developer Portal has a different URL configured\n• The URL in QuickBooks doesn't match ${redirectUri}\n\nMake sure your Redirect URI in QuickBooks Developer Portal matches EXACTLY: ${redirectUri}`
          }
          
          // Build redirect URI comparison message - ALWAYS include this section
          // This will always be populated since redirectUri is validated earlier
          let redirectUriDetails = ''
          
          // Determine QuickBooks expected redirect URI:
          // 1. If we have access tokens, use the stored redirectUri (this is what QuickBooks accepted)
          // 2. Otherwise, infer from webhook URL if available
          // 3. Otherwise, show that we can't verify
          let quickBooksExpectedRedirectUri: string | null = null
          let quickBooksRedirectUriSource = ''
          
          if (quickBooksAcceptedRedirectUri) {
            // Use the redirect URI that QuickBooks accepted (from successful OAuth)
            quickBooksExpectedRedirectUri = quickBooksAcceptedRedirectUri
            quickBooksRedirectUriSource = 'retrieved from QuickBooks (stored from successful OAuth)'
          } else if (webhookUrl && webhookUrl.trim() !== '') {
            // Infer from webhook URL
            try {
              quickBooksExpectedRedirectUri = webhookUrl.replace('/webhooks', '/oauth')
              quickBooksRedirectUriSource = 'inferred from webhook URL'
            } catch (e) {
              quickBooksExpectedRedirectUri = null
            }
          }
          
          if (quickBooksExpectedRedirectUri) {
            try {
              const expectedUriObj = new URL(quickBooksExpectedRedirectUri)
              const domainsMatch = redirectDomain === expectedUriObj.hostname
              const urisMatch = redirectUri === quickBooksExpectedRedirectUri
              
              redirectUriDetails = `\n\n📋 Redirect URI Configuration:\n• Your Redirect URI: ${redirectUri}\n• QuickBooks Expected Redirect URI: ${quickBooksExpectedRedirectUri} (${quickBooksRedirectUriSource})\n${urisMatch ? '✅ URLs match exactly - OAuth should work' : domainsMatch ? '⚠️ Domains match but paths differ - OAuth may fail if paths don\'t match exactly' : '⚠️ Domains differ - OAuth will fail if URLs don\'t match exactly'}`
            } catch (e) {
              redirectUriDetails = `\n\n📋 Redirect URI Configuration:\n• Your Redirect URI: ${redirectUri}\n• QuickBooks Expected Redirect URI: ${quickBooksExpectedRedirectUri} (${quickBooksRedirectUriSource})\n⚠️ Unable to verify URL match`
            }
          } else {
            redirectUriDetails = `\n\n📋 Redirect URI Configuration:\n• Your Redirect URI: ${redirectUri}\n• QuickBooks Redirect URI: Not available (cannot verify)\n⚠️ Make sure your Redirect URI matches EXACTLY what's in QuickBooks Developer Portal`
          }
          
          // Build the details message - append redirect URI details right after the main message
          const mainMessage = `Company ID verified (${environment} mode). To access real data, complete OAuth connection by clicking "Connect" button.`
          const fullDetails = `${mainMessage}${redirectUriDetails}\n\n• Company ID: ${companyId}\n• Environment: ${environment}${webhookUrl && webhookUrl.trim() !== '' ? `\n• Webhook URL: ${webhookUrl}` : '\n• Webhook URL: Not configured'}${warningMessage}\n\n⚠️ IMPORTANT: This only validates the format. OAuth will FAIL if:\n• Your Redirect URI doesn't match EXACTLY what's in QuickBooks Developer Portal\n• Your Webhook URL doesn't match what's configured in QuickBooks\n• The URLs in your local config don't match what QuickBooks expects\n\nTo test OAuth, click "Connect" - it will fail immediately if URLs don't match.`
          
          // Ensure redirectUriDetails is always included (should never be empty at this point)
          if (!redirectUriDetails || redirectUriDetails.trim() === '') {
            redirectUriDetails = `\n\n📋 Redirect URI Configuration:\n• Your Redirect URI: ${redirectUri || 'Not configured'}\n• QuickBooks Redirect URI: Not configured (cannot verify)`
            // Rebuild fullDetails with the fallback
            const fallbackDetails = `${mainMessage}${redirectUriDetails}\n\n• Company ID: ${companyId}\n• Environment: ${environment}${webhookUrl && webhookUrl.trim() !== '' ? `\n• Webhook URL: ${webhookUrl}` : '\n• Webhook URL: Not configured'}${warningMessage}\n\n⚠️ IMPORTANT: This only validates the format. OAuth will FAIL if:\n• Your Redirect URI doesn't match EXACTLY what's in QuickBooks Developer Portal\n• Your Webhook URL doesn't match what's configured in QuickBooks\n• The URLs in your local config don't match what QuickBooks expects\n\nTo test OAuth, click "Connect" - it will fail immediately if URLs don't match.`
            return { 
              success: true, 
              message: 'QuickBooks configuration format validated',
              details: fallbackDetails
            }
          }
          
          return { 
            success: true, 
            message: 'QuickBooks configuration format validated',
            details: fullDetails
          }
        }

        return { 
          success: false, 
          message: 'QuickBooks not configured',
          details: 'Please provide either a Company ID (for demo/sandbox mode) or complete OAuth connection with access tokens. Click "Connect" to initiate OAuth flow.'
        }
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
