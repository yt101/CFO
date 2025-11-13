import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createQuickBooksService } from '@/lib/integrations/quickbooks-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { companyId, clientId, clientSecret, redirectUri, environment } = body

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

    // Require a valid company ID
    if (!company_id) {
      return NextResponse.json(
        { 
          success: false,
          error: 'No company found. Please ensure you are logged in and have a company profile.'
        },
        { status: 400 }
      )
    }

    // Try to get existing QuickBooks configuration with tokens
    let qbConfig: any = null
    const { data: existingConfig } = await supabase
      .from('service_configurations')
      .select('parameters')
      .eq('company_id', company_id)
      .eq('service_id', 'quickbooks')
      .single()

    if (existingConfig?.parameters) {
      // Log the raw parameters structure to debug
      console.log('Raw QuickBooks parameters from database:', JSON.stringify(existingConfig.parameters, null, 2))
      
      // Helper function to extract value from nested structure
      const getValue = (key: string): string => {
        const param = existingConfig.parameters[key]
        if (!param) return ''
        // Handle both formats: {value: "..."} or direct value
        if (typeof param === 'object' && param !== null && 'value' in param) {
          return param.value || ''
        }
        return typeof param === 'string' ? param : ''
      }
      
      // Extract values from the parameters object structure
      // IMPORTANT: realmId from OAuth IS the companyId for API calls
      const realmId = getValue('realmId') || existingConfig.parameters.realmId
      const manualCompanyId = getValue('companyId') || existingConfig.parameters.companyId
      
      // Try multiple possible keys for access token
      const accessToken = 
        getValue('accessToken') || 
        existingConfig.parameters.accessToken || 
        getValue('access_token') || 
        existingConfig.parameters.access_token ||
        ''
      
      // Try multiple possible keys for refresh token
      const refreshToken = 
        getValue('refreshToken') || 
        existingConfig.parameters.refreshToken || 
        getValue('refresh_token') || 
        existingConfig.parameters.refresh_token ||
        ''
      
      qbConfig = {
        // Use realmId from OAuth as companyId (this is the actual QuickBooks company ID)
        // Fall back to manually entered companyId if realmId not available
        companyId: realmId || manualCompanyId || '',
        clientId: getValue('clientId') || existingConfig.parameters.clientId || '',
        clientSecret: getValue('clientSecret') || existingConfig.parameters.clientSecret || '',
        redirectUri: getValue('redirectUri') || existingConfig.parameters.redirectUri || '',
        environment: getValue('environment') || existingConfig.parameters.environment || 'sandbox',
        accessToken: accessToken,
        refreshToken: refreshToken,
        realmId: realmId || ''
      }
      
      // Debug logging
      console.log('QuickBooks Config Extracted:', {
        hasAccessToken: !!qbConfig.accessToken,
        hasRefreshToken: !!qbConfig.refreshToken,
        hasCompanyId: !!qbConfig.companyId,
        hasRealmId: !!realmId,
        companyId: qbConfig.companyId,
        realmId: qbConfig.realmId,
        tokenLength: qbConfig.accessToken?.length || 0,
        refreshTokenLength: qbConfig.refreshToken?.length || 0,
        environment: qbConfig.environment,
        allParameterKeys: Object.keys(existingConfig.parameters)
      })
    } else {
      // Use provided parameters (from request body)
      qbConfig = {
        companyId: companyId || '',
        clientId: clientId || '',
        clientSecret: clientSecret || '',
        redirectUri: redirectUri || '',
        environment: environment || 'sandbox'
      }
    }

    // Validate we have required credentials for real QuickBooks API calls
    // First, try to use realmId if companyId is missing
    if (qbConfig.realmId && !qbConfig.companyId) {
      qbConfig.companyId = qbConfig.realmId
      console.log('Using realmId as companyId:', qbConfig.companyId)
    }
    
    // REQUIRE access token - no demo data fallback
    if (!qbConfig.accessToken) {
      console.error('Missing QuickBooks access token:', {
        hasToken: !!qbConfig.accessToken,
        hasClientId: !!qbConfig.clientId,
        hasCompanyId: !!qbConfig.companyId,
        hasRealmId: !!qbConfig.realmId,
        allKeys: Object.keys(qbConfig)
      })
      return NextResponse.json(
        { 
          success: false,
          error: 'QuickBooks access token is required. Please complete OAuth connection first.',
          details: 'No access token found. Please click "Connect" in the QuickBooks integration settings to authenticate with QuickBooks.'
        },
        { status: 401 }
      )
    }
    
    if (!qbConfig.companyId && !qbConfig.realmId) {
      console.error('Missing company ID (realmId):', {
        hasCompanyId: !!qbConfig.companyId,
        hasRealmId: !!qbConfig.realmId,
        extractedKeys: Object.keys(qbConfig)
      })
      return NextResponse.json(
        { 
          success: false,
          error: 'QuickBooks company ID (realmId) is required. Please complete OAuth connection.',
          details: 'The OAuth connection will provide the realmId (company ID) automatically.'
        },
        { status: 400 }
      )
    }

    // Create QuickBooks service
    const qbService = createQuickBooksService(qbConfig)

    // Import company information
    let companyInfo: any = null
    let accounts: any[] = []

    try {
      console.log('Attempting to fetch real QuickBooks data...')
      console.log('QuickBooks Config:', {
        hasAccessToken: !!qbConfig.accessToken,
        hasRefreshToken: !!qbConfig.refreshToken,
        companyId: qbConfig.companyId,
        realmId: qbConfig.realmId,
        environment: qbConfig.environment,
        tokenPreview: qbConfig.accessToken?.substring(0, 20) + '...'
      })
      
      try {
        companyInfo = await qbService.getCompanyInfo()
        console.log('✅ Company info retrieved:', companyInfo?.name || 'N/A')
        
        // Import accounts
        accounts = await qbService.getAccounts()
        console.log('✅ Accounts retrieved:', accounts.length)
      } catch (apiError: any) {
        console.error('❌ QuickBooks API call failed:', apiError.message)
        console.error('Full error:', apiError)
        
        // Check if token is expired and try to refresh
        if (apiError.message?.includes('401') || apiError.message?.includes('Unauthorized') || apiError.message?.includes('expired')) {
          console.log('Token appears expired, attempting refresh...')
          if (qbConfig.refreshToken) {
            try {
              const newToken = await qbService.refreshAccessToken()
              console.log('✅ Token refreshed successfully')
              
              // Update token in config for retry
              qbConfig.accessToken = newToken
              const refreshedService = createQuickBooksService(qbConfig)
              
              // Retry with new token
              companyInfo = await refreshedService.getCompanyInfo()
              accounts = await refreshedService.getAccounts()
              console.log('✅ Data retrieved after token refresh')
            } catch (refreshError: any) {
              console.error('❌ Token refresh failed:', refreshError.message)
              throw new Error(`Token expired and refresh failed: ${refreshError.message}. Please re-authenticate.`)
            }
          } else {
            throw new Error('Token expired and no refresh token available. Please re-authenticate.')
          }
        } else {
          // Re-throw with more context
          throw new Error(`QuickBooks API error: ${apiError.message}`)
        }
      }
    } catch (error: any) {
      console.error('Import error caught:', error.message)
      console.error('Error details:', {
        hasAccessToken: !!qbConfig.accessToken,
        hasCompanyId: !!qbConfig.companyId,
        hasRealmId: !!qbConfig.realmId,
        hasRefreshToken: !!qbConfig.refreshToken,
        errorMessage: error.message
      })
      
      // NO DEMO DATA FALLBACK - Always throw error if we can't get real data
      const errorMessage = error.message || 'Unknown error occurred while fetching QuickBooks data'
      console.error('QuickBooks API import failed:', errorMessage)
      
      return NextResponse.json(
        { 
          success: false,
          error: `Failed to import QuickBooks data: ${errorMessage}`,
          details: 'Please ensure your OAuth connection is valid and your QuickBooks company is accessible.',
          suggestion: 'Try disconnecting and reconnecting QuickBooks, or check if your access token needs to be refreshed.'
        },
        { status: 500 }
      )
    }

    // Prepare response data - all data from here is real QuickBooks data
    if (!companyInfo || !companyInfo.id) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to retrieve company information from QuickBooks',
          details: 'The API call succeeded but no company data was returned.'
        },
        { status: 500 }
      )
    }
    
    console.log('✅ Successfully imported real QuickBooks data:', {
      companyName: companyInfo.name,
      accountCount: accounts.length,
      companyId: companyInfo.id
    })
    
    const responseData: any = {
      companyId: companyInfo.id,
      companyName: companyInfo.name,
      accounts: accounts.map(acc => ({
        id: acc.id,
        name: acc.name,
        type: acc.type,
        subtype: acc.subtype,
        currentBalance: acc.currentBalance,
        accountNumber: acc.accountNumber
      })),
      totalAccounts: accounts.length,
      importDate: new Date().toISOString(),
      isRealData: true,
      dataSource: 'QuickBooks API'
    }

    // If we have full company info, include it
    if (companyInfo.country) {
      responseData.companyDetails = {
        country: companyInfo.country,
        currency: companyInfo.currency,
        fiscalYearStartMonth: companyInfo.fiscalYearStartMonth
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${accounts.length} accounts from QuickBooks`,
      data: responseData,
      isRealData: true
    })

  } catch (error: any) {
    console.error('QuickBooks import error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to import QuickBooks data',
        details: error.toString()
      },
      { status: 500 }
    )
  }
}

