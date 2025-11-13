"use client"

interface QuickBooksOAuthConfig {
  companyId: string
  clientId: string
  clientSecret?: string
  redirectUri: string
  environment: 'sandbox' | 'production'
}

interface QuickBooksTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
  tokenType: string
  realmId: string
}

interface QuickBooksCompany {
  id: string
  name: string
  country: string
  currency: string
  fiscalYearStartMonth: string
}

export class QuickBooksOAuthService {
  private config: QuickBooksOAuthConfig
  private tokens: QuickBooksTokens | null = null
  private baseUrl: string

  constructor(config: QuickBooksOAuthConfig) {
    this.config = config
    this.baseUrl = config.environment === 'production' 
      ? 'https://quickbooks.intuit.com'
      : 'https://sandbox-quickbooks.intuit.com'
  }

  // Generate OAuth authorization URL
  getAuthorizationUrl(): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      scope: 'com.intuit.quickbooks.accounting',
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      access_type: 'offline',
      state: `company_${this.config.companyId}_${Date.now()}`
    })

    return `${this.baseUrl}/oauth/v1/authorize?${params.toString()}`
  }

  // Exchange authorization code for tokens
  async exchangeCodeForTokens(code: string): Promise<QuickBooksTokens> {
    try {
      const response = await fetch(`${this.baseUrl}/oauth/v1/tokens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${this.config.clientId}:${this.config.clientSecret || ''}`)}`
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: this.config.redirectUri
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Token exchange failed: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      
      this.tokens = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
        tokenType: data.token_type,
        realmId: data.realmId
      }

      // Store tokens securely
      this.storeTokens()
      
      return this.tokens
    } catch (error) {
      console.error('QuickBooks token exchange error:', error)
      throw new Error('Failed to exchange authorization code for tokens')
    }
  }

  // Refresh access token
  async refreshAccessToken(): Promise<string> {
    if (!this.tokens?.refreshToken) {
      throw new Error('No refresh token available')
    }

    try {
      const response = await fetch(`${this.baseUrl}/oauth/v1/tokens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${this.config.clientId}:${this.config.clientSecret || ''}`)}`
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: this.tokens.refreshToken
        })
      })

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.status}`)
      }

      const data = await response.json()
      
      this.tokens.accessToken = data.access_token
      this.tokens.refreshToken = data.refresh_token || this.tokens.refreshToken
      this.tokens.expiresIn = data.expires_in
      
      this.storeTokens()
      
      return this.tokens.accessToken
    } catch (error) {
      console.error('QuickBooks token refresh error:', error)
      throw new Error('Failed to refresh access token')
    }
  }

  // Make authenticated API request
  private async makeRequest(endpoint: string, method: string = 'GET', body?: any): Promise<any> {
    if (!this.tokens?.accessToken) {
      throw new Error('No access token available. Please authenticate first.')
    }

    const url = `${this.baseUrl}/v3/company/${this.tokens.realmId}/${endpoint}`
    
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${this.tokens.accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: body ? JSON.stringify(body) : undefined
      })

      if (response.status === 401) {
        // Token expired, try to refresh
        await this.refreshAccessToken()
        return this.makeRequest(endpoint, method, body)
      }

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`QuickBooks API error: ${response.status} - ${errorText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('QuickBooks API request error:', error)
      throw error
    }
  }

  // Get company information
  async getCompanyInfo(): Promise<QuickBooksCompany> {
    const response = await this.makeRequest('companyinfo/1')
    const company = response.QueryResponse.CompanyInfo[0]
    
    return {
      id: company.Id,
      name: company.CompanyName,
      country: company.Country,
      currency: company.CurrencyRef.value,
      fiscalYearStartMonth: company.FiscalYearStartMonth
    }
  }

  // Get chart of accounts
  async getAccounts(): Promise<any[]> {
    const response = await this.makeRequest('accounts')
    return response.QueryResponse.Account.map((account: any) => ({
      id: account.Id,
      name: account.Name,
      type: account.AccountType,
      subtype: account.AccountSubType,
      currentBalance: account.CurrentBalance || 0,
      accountNumber: account.AcctNum
    }))
  }

  // Get profit and loss report
  async getProfitAndLossReport(startDate: string, endDate: string): Promise<any> {
    const response = await this.makeRequest(`reports/ProfitAndLoss?start_date=${startDate}&end_date=${endDate}`)
    return response.QueryResponse.Report
  }

  // Get balance sheet report
  async getBalanceSheetReport(asOfDate: string): Promise<any> {
    const response = await this.makeRequest(`reports/BalanceSheet?as_of_date=${asOfDate}`)
    return response.QueryResponse.Report
  }

  // Get cash flow report
  async getCashFlowReport(startDate: string, endDate: string): Promise<any> {
    const response = await this.makeRequest(`reports/CashFlow?start_date=${startDate}&end_date=${endDate}`)
    return response.QueryResponse.Report
  }

  // Test connection
  async testConnection(): Promise<{ success: boolean; message: string; companyInfo?: QuickBooksCompany }> {
    try {
      const companyInfo = await this.getCompanyInfo()
      return {
        success: true,
        message: `Successfully connected to ${companyInfo.name}`,
        companyInfo
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Connection failed'
      }
    }
  }

  // Store tokens securely
  private storeTokens(): void {
    if (this.tokens && typeof window !== 'undefined') {
      const tokenData = {
        ...this.tokens,
        expiresAt: Date.now() + (this.tokens.expiresIn * 1000),
        companyId: this.config.companyId
      }
      localStorage.setItem(`quickbooks-tokens-${this.config.companyId}`, JSON.stringify(tokenData))
    }
  }

  // Load stored tokens
  loadTokens(): boolean {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`quickbooks-tokens-${this.config.companyId}`)
      if (stored) {
        try {
          const tokenData = JSON.parse(stored)
          if (tokenData.expiresAt > Date.now()) {
            this.tokens = {
              accessToken: tokenData.accessToken,
              refreshToken: tokenData.refreshToken,
              expiresIn: tokenData.expiresIn,
              tokenType: tokenData.tokenType,
              realmId: tokenData.realmId
            }
            return true
          }
        } catch (error) {
          console.error('Error loading stored tokens:', error)
        }
      }
    }
    return false
  }

  // Check if tokens are valid
  isAuthenticated(): boolean {
    return this.tokens !== null && this.tokens.accessToken !== ''
  }

  // Get current tokens
  getTokens(): QuickBooksTokens | null {
    return this.tokens
  }
}

// Factory function
export function createQuickBooksOAuthService(config: QuickBooksOAuthConfig): QuickBooksOAuthService {
  return new QuickBooksOAuthService(config)
}












