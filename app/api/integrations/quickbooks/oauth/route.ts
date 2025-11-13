import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin

    // Log all query parameters for debugging
    console.log('QuickBooks OAuth Callback:', {
      code: code ? 'present' : 'missing',
      state,
      error,
      allParams: Object.fromEntries(searchParams.entries())
    })

    if (error) {
      const errorDescription = searchParams.get('error_description') || error
      console.error('QuickBooks OAuth error from callback:', { error, errorDescription })
      return NextResponse.redirect(`${baseUrl}/dashboard/integrations?error=${encodeURIComponent(errorDescription || error)}`)
    }

    if (!code) {
      console.error('QuickBooks OAuth: No authorization code received')
      return NextResponse.redirect(`${baseUrl}/dashboard/integrations?error=No authorization code received`)
    }

    // Get QuickBooks configuration
    const supabase = createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.redirect(`${baseUrl}/auth/login`)
    }

    // Get company ID from user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user.id)
      .single()

    if (!profile?.company_id) {
      return NextResponse.redirect(`${baseUrl}/dashboard/integrations?error=No company found`)
    }

    // Extract company ID from state (optional, for logging)
    const stateCompanyId = state?.match(/company_(\d+)/)?.[1]

    // Get QuickBooks configuration from database
    const { data: qbConfig } = await supabase
      .from('service_configurations')
      .select('parameters')
      .eq('company_id', profile.company_id)
      .eq('service_id', 'quickbooks')
      .single()

    if (!qbConfig?.parameters) {
      return NextResponse.redirect(`${baseUrl}/dashboard/integrations?error=QuickBooks not configured. Please save your configuration first.`)
    }

    // Helper to extract parameter value
    const getParamValue = (key: string): string => {
      const param = qbConfig.parameters[key]
      if (!param) return ''
      if (typeof param === 'object' && param !== null && 'value' in param) {
        return param.value || ''
      }
      return typeof param === 'string' ? param : ''
    }

    // Extract credentials
    const clientId = getParamValue('clientId') || qbConfig.parameters.clientId || ''
    const clientSecret = getParamValue('clientSecret') || qbConfig.parameters.clientSecret || ''
    const redirectUri = getParamValue('redirectUri') || qbConfig.parameters.redirectUri || ''
    const environment = getParamValue('environment') || qbConfig.parameters.environment || 'sandbox'

    console.log('OAuth Token Exchange:', {
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret,
      hasRedirectUri: !!redirectUri,
      environment,
      redirectUri
    })

    if (!clientId || !clientSecret || !redirectUri) {
      console.error('Missing OAuth credentials:', { hasClientId: !!clientId, hasClientSecret: !!clientSecret, hasRedirectUri: !!redirectUri })
      return NextResponse.redirect(`${baseUrl}/dashboard/integrations?error=Missing QuickBooks credentials. Please configure Client ID, Client Secret, and Redirect URI.`)
    }

    // Exchange code for tokens - QuickBooks OAuth 2.0 token endpoint
    // QuickBooks OAuth 2.0 uses oauth.platform.intuit.com for token exchange
    const tokenUrl = environment === 'production'
      ? 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer'
      : 'https://sandbox-quickbooks.api.intuit.com/oauth2/v1/tokens/bearer'

    console.log('Exchanging authorization code for tokens:', {
      tokenUrl,
      environment,
      hasCode: !!code,
      redirectUri,
      clientIdLength: clientId.length
    })

    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri
      })
    })

    const responseText = await tokenResponse.text()
    console.log('Token exchange response:', {
      status: tokenResponse.status,
      statusText: tokenResponse.statusText,
      preview: responseText.substring(0, 200)
    })

    if (!tokenResponse.ok) {
      let errorMessage = 'Token exchange failed'
      try {
        const errorData = JSON.parse(responseText)
        errorMessage = errorData.error_description || errorData.error || errorMessage
        console.error('QuickBooks token exchange error details:', errorData)
      } catch {
        console.error('QuickBooks token exchange error (non-JSON):', responseText)
        errorMessage = responseText.substring(0, 200) || errorMessage
      }
      return NextResponse.redirect(`${baseUrl}/dashboard/integrations?error=${encodeURIComponent(errorMessage)}`)
    }

    let tokenData: any
    try {
      tokenData = JSON.parse(responseText)
      console.log('Token data received:', {
        hasAccessToken: !!tokenData.access_token,
        hasRefreshToken: !!tokenData.refresh_token,
        hasRealmId: !!tokenData.realmId,
        tokenType: tokenData.token_type,
        expiresIn: tokenData.expires_in
      })
    } catch (parseError) {
      console.error('Failed to parse token response:', parseError, responseText)
      return NextResponse.redirect(`${baseUrl}/dashboard/integrations?error=Invalid token response from QuickBooks`)
    }

    if (!tokenData.access_token || !tokenData.realmId) {
      console.error('Token response missing required fields:', {
        hasAccessToken: !!tokenData.access_token,
        hasRealmId: !!tokenData.realmId,
        response: tokenData
      })
      return NextResponse.redirect(`${baseUrl}/dashboard/integrations?error=Token response missing required fields`)
    }

    // Update QuickBooks configuration with tokens
    // Preserve existing parameter structure
    const updatedParameters: any = { ...qbConfig.parameters }
    
    // Update tokens - preserve structure if parameters are objects
    if (updatedParameters.accessToken && typeof updatedParameters.accessToken === 'object') {
      updatedParameters.accessToken.value = tokenData.access_token
    } else {
      updatedParameters.accessToken = tokenData.access_token
    }
    
    if (updatedParameters.refreshToken && typeof updatedParameters.refreshToken === 'object') {
      updatedParameters.refreshToken.value = tokenData.refresh_token
    } else {
      updatedParameters.refreshToken = tokenData.refresh_token
    }
    
    if (updatedParameters.realmId && typeof updatedParameters.realmId === 'object') {
      updatedParameters.realmId.value = tokenData.realmId
    } else {
      updatedParameters.realmId = tokenData.realmId
    }
    
    updatedParameters.tokenExpiresAt = Date.now() + (tokenData.expires_in * 1000)
    
    // Also update companyId if we got realmId from OAuth (realmId IS the company ID)
    if (tokenData.realmId) {
      if (updatedParameters.companyId && typeof updatedParameters.companyId === 'object') {
        updatedParameters.companyId.value = tokenData.realmId
      } else {
        updatedParameters.companyId = tokenData.realmId
      }
    }

    const { error: configError } = await supabase
      .from('service_configurations')
      .upsert({
        company_id: profile.company_id,
        service_id: 'quickbooks',
        parameters: updatedParameters,
        enabled: true,
        status: 'active',
        last_tested: new Date().toISOString(),
        test_result: { success: true, message: 'OAuth completed successfully' }
      })

    if (configError) {
      console.error('Error storing QuickBooks config:', configError)
      return NextResponse.redirect(`${baseUrl}/dashboard/integrations?error=Failed to save configuration`)
    }

    return NextResponse.redirect(`${baseUrl}/dashboard/integrations?success=QuickBooks connected successfully&companyId=${tokenData.realmId || stateCompanyId || 'N/A'}`)

  } catch (error) {
    console.error('QuickBooks OAuth error:', error)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin
    return NextResponse.redirect(`${baseUrl}/dashboard/integrations?error=OAuth process failed`)
  }
}
