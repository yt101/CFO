interface QuickBooksConfig {
  clientId: string
  clientSecret?: string // Optional for OAuth flow
  redirectUri: string
  environment: 'sandbox' | 'production'
  accessToken?: string
  refreshToken?: string
  companyId?: string
  // For Company ID only flow
  companyIdOnly?: boolean
}

interface QuickBooksCompany {
  id: string
  name: string
  country: string
  currency: string
  fiscalYearStartMonth: string
}

interface QuickBooksAccount {
  id: string
  name: string
  type: string
  subtype: string
  currentBalance: number
  accountNumber?: string
}

interface QuickBooksTransaction {
  id: string
  date: string
  amount: number
  description: string
  account: string
  type: 'debit' | 'credit'
  reference?: string
}

interface QuickBooksReport {
  name: string
  data: any[]
  summary: {
    totalRevenue?: number
    totalExpenses?: number
    netIncome?: number
    totalAssets?: number
    totalLiabilities?: number
    totalEquity?: number
  }
}

export class QuickBooksService {
  private config: QuickBooksConfig
  private baseUrl: string
  private apiBaseUrl: string

  constructor(config: QuickBooksConfig) {
    this.config = config
    // OAuth base URL (for authorization) - QuickBooks uses appcenter.intuit.com for OAuth
    this.baseUrl = 'https://appcenter.intuit.com'
    // API base URL (for data queries)
    this.apiBaseUrl = config.environment === 'production'
      ? 'https://quickbooks.api.intuit.com'
      : 'https://sandbox-quickbooks.api.intuit.com'
  }

  // OAuth 2.0 Authentication
  getAuthorizationUrl(): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      scope: 'com.intuit.quickbooks.accounting',
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      access_type: 'offline'
    })

    // QuickBooks OAuth 2.0 uses appcenter.intuit.com/connect/oauth2
    return `${this.baseUrl}/connect/oauth2?${params.toString()}`
  }

  // For Company ID only flow - get authorization URL
  getCompanyIdAuthUrl(): string {
    // This would be your custom OAuth flow for Company ID only
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      scope: 'com.intuit.quickbooks.accounting',
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      access_type: 'offline',
      state: `company_id_${this.config.companyId}`
    })

    return `${this.baseUrl}/connect/oauth2?${params.toString()}`
  }

  async exchangeCodeForTokens(code: string): Promise<{ accessToken: string; refreshToken: string; companyId: string }> {
    try {
      // Use Buffer for Node.js compatibility
      const credentials = Buffer.from(`${this.config.clientId}:${this.config.clientSecret || ''}`).toString('base64')
      
      // QuickBooks OAuth token endpoint
      const tokenUrl = this.config.environment === 'production'
        ? 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer'
        : 'https://sandbox-quickbooks.api.intuit.com/oauth2/v1/tokens/bearer'
      
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${credentials}`
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: this.config.redirectUri
        })
      })

      if (!response.ok) {
        throw new Error(`Token exchange failed: ${response.status}`)
      }

      const data = await response.json()
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        companyId: data.realmId
      }
    } catch (error) {
      console.error('QuickBooks token exchange error:', error)
      throw new Error('Failed to exchange authorization code for tokens')
    }
  }

  async refreshAccessToken(): Promise<string> {
    if (!this.config.refreshToken) {
      throw new Error('No refresh token available')
    }

    try {
      // Use Buffer for Node.js compatibility
      const credentials = Buffer.from(`${this.config.clientId}:${this.config.clientSecret || ''}`).toString('base64')
      
      // QuickBooks OAuth token endpoint
      const tokenUrl = this.config.environment === 'production'
        ? 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer'
        : 'https://sandbox-quickbooks.api.intuit.com/oauth2/v1/tokens/bearer'
      
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${credentials}`
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: this.config.refreshToken
        })
      })

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.status}`)
      }

      const data = await response.json()
      this.config.accessToken = data.access_token
      return data.access_token
    } catch (error) {
      console.error('QuickBooks token refresh error:', error)
      throw new Error('Failed to refresh access token')
    }
  }

  // API Helper
  private async makeRequest(endpoint: string, method: string = 'GET', body?: any): Promise<any> {
    if (!this.config.accessToken) {
      throw new Error('No access token available. Please authenticate first.')
    }

    if (!this.config.companyId) {
      throw new Error('No company ID (realmId) available. Please complete OAuth flow.')
    }

    const url = `${this.apiBaseUrl}/v3/company/${this.config.companyId}/${endpoint}`
    
    console.log('QuickBooks API Request:', {
      url,
      method,
      hasToken: !!this.config.accessToken,
      companyId: this.config.companyId,
      tokenPreview: this.config.accessToken.substring(0, 20) + '...'
    })
    
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: body ? JSON.stringify(body) : undefined
      })

      const responseText = await response.text()
      console.log('QuickBooks API Response:', {
        status: response.status,
        statusText: response.statusText,
        preview: responseText.substring(0, 200)
      })

      if (response.status === 401) {
        // Token expired, try to refresh
        console.log('Token expired (401), attempting refresh...')
        if (this.config.refreshToken) {
          await this.refreshAccessToken()
          return this.makeRequest(endpoint, method, body)
        } else {
          throw new Error('Token expired and no refresh token available')
        }
      }

      if (!response.ok) {
        let errorMessage = `QuickBooks API error: ${response.status} ${response.statusText}`
        try {
          const errorData = JSON.parse(responseText)
          if (errorData.fault?.error) {
            errorMessage += ` - ${errorData.fault.error[0]?.message || errorData.fault.error[0]?.detail}`
          }
        } catch (e) {
          // If parsing fails, use the response text
          errorMessage += ` - ${responseText.substring(0, 200)}`
        }
        throw new Error(errorMessage)
      }

      return JSON.parse(responseText)
    } catch (error) {
      console.error('QuickBooks API request error:', error)
      throw error
    }
  }

  // Company Information
  async getCompanyInfo(): Promise<QuickBooksCompany> {
    const response = await this.makeRequest('companyinfo/1')
    
    if (!response.QueryResponse || !response.QueryResponse.CompanyInfo) {
      throw new Error('No company info found in QuickBooks response')
    }
    
    const company = Array.isArray(response.QueryResponse.CompanyInfo)
      ? response.QueryResponse.CompanyInfo[0]
      : response.QueryResponse.CompanyInfo
    
    return {
      id: company.Id,
      name: company.CompanyName,
      country: company.Country,
      currency: company.CurrencyRef?.value || 'USD',
      fiscalYearStartMonth: company.FiscalYearStartMonth || '1'
    }
  }

  // Chart of Accounts
  async getAccounts(): Promise<QuickBooksAccount[]> {
    // QuickBooks uses query endpoint for accounts
    const response = await this.makeRequest('query?query=SELECT * FROM Account MAXRESULTS 1000')
    
    if (!response.QueryResponse || !response.QueryResponse.Account) {
      console.warn('No accounts found in QuickBooks response')
      return []
    }
    
    const accounts = Array.isArray(response.QueryResponse.Account) 
      ? response.QueryResponse.Account 
      : [response.QueryResponse.Account]
    
    return accounts.map((account: any) => ({
      id: account.Id,
      name: account.Name,
      type: account.AccountType,
      subtype: account.AccountSubType,
      currentBalance: account.CurrentBalance || 0,
      accountNumber: account.AcctNum
    }))
  }

  // Transactions
  async getTransactions(startDate: string, endDate: string): Promise<QuickBooksTransaction[]> {
    const response = await this.makeRequest(`reports/TransactionList?start_date=${startDate}&end_date=${endDate}`)
    
    // This would need to be adapted based on actual QuickBooks API response structure
    return response.QueryResponse?.TransactionList || []
  }

  // Financial Reports
  async getProfitAndLossReport(startDate: string, endDate: string): Promise<QuickBooksReport> {
    const response = await this.makeRequest(`reports/ProfitAndLoss?start_date=${startDate}&end_date=${endDate}`)
    
    return {
      name: 'Profit and Loss',
      data: response.QueryResponse?.Report || [],
      summary: {
        totalRevenue: this.extractTotalFromReport(response, 'Income'),
        totalExpenses: this.extractTotalFromReport(response, 'Expense'),
        netIncome: this.extractTotalFromReport(response, 'NetIncome')
      }
    }
  }

  async getBalanceSheetReport(asOfDate: string): Promise<QuickBooksReport> {
    const response = await this.makeRequest(`reports/BalanceSheet?as_of_date=${asOfDate}`)
    
    return {
      name: 'Balance Sheet',
      data: response.QueryResponse?.Report || [],
      summary: {
        totalAssets: this.extractTotalFromReport(response, 'TotalAssets'),
        totalLiabilities: this.extractTotalFromReport(response, 'TotalLiabilities'),
        totalEquity: this.extractTotalFromReport(response, 'TotalEquity')
      }
    }
  }

  async getCashFlowReport(startDate: string, endDate: string): Promise<QuickBooksReport> {
    const response = await this.makeRequest(`reports/CashFlow?start_date=${startDate}&end_date=${endDate}`)
    
    return {
      name: 'Cash Flow Statement',
      data: response.QueryResponse?.Report || [],
      summary: {
        // Cash flow summary would be extracted here
      }
    }
  }

  // Customers
  async getCustomers(): Promise<any[]> {
    const response = await this.makeRequest('customers')
    return response.QueryResponse?.Customer || []
  }

  // Invoices
  async getInvoices(startDate: string, endDate: string): Promise<any[]> {
    const response = await this.makeRequest(`invoices?start_date=${startDate}&end_date=${endDate}`)
    return response.QueryResponse?.Invoice || []
  }

  // Bills
  async getBills(startDate: string, endDate: string): Promise<any[]> {
    const response = await this.makeRequest(`bills?start_date=${startDate}&end_date=${endDate}`)
    return response.QueryResponse?.Bill || []
  }

  // Helper method to extract totals from reports
  private extractTotalFromReport(response: any, sectionName: string): number {
    try {
      const report = response.QueryResponse?.Report
      if (!report || !report.Rows) return 0

      const section = report.Rows.find((row: any) => 
        row.ColData && row.ColData[0] && row.ColData[0].value === sectionName
      )

      if (section && section.ColData && section.ColData[1]) {
        return parseFloat(section.ColData[1].value) || 0
      }

      return 0
    } catch (error) {
      console.error(`Error extracting ${sectionName} from report:`, error)
      return 0
    }
  }

  // Data transformation for FP&A tools
  async getFinancialDataForPeriod(startDate: string, endDate: string): Promise<{
    revenue: any
    expenses: any
    cashFlow: any
    balanceSheet: any
  }> {
    try {
      const [pAndL, balanceSheet, cashFlow] = await Promise.all([
        this.getProfitAndLossReport(startDate, endDate),
        this.getBalanceSheetReport(endDate),
        this.getCashFlowReport(startDate, endDate)
      ])

      return {
        revenue: this.transformRevenueData(pAndL),
        expenses: this.transformExpenseData(pAndL),
        cashFlow: this.transformCashFlowData(cashFlow),
        balanceSheet: this.transformBalanceSheetData(balanceSheet)
      }
    } catch (error) {
      console.error('Error fetching financial data:', error)
      throw new Error('Failed to fetch financial data from QuickBooks')
    }
  }

  private transformRevenueData(pAndL: QuickBooksReport): any {
    return {
      totalRevenue: pAndL.summary.totalRevenue || 0,
      period: 'current',
      breakdown: {
        productSales: pAndL.summary.totalRevenue * 0.7, // Mock breakdown
        serviceRevenue: pAndL.summary.totalRevenue * 0.3
      },
      growth: 0.15 // Mock growth rate
    }
  }

  private transformExpenseData(pAndL: QuickBooksReport): any {
    return {
      totalExpenses: pAndL.summary.totalExpenses || 0,
      period: 'current',
      breakdown: {
        salesMarketing: pAndL.summary.totalExpenses * 0.3,
        rd: pAndL.summary.totalExpenses * 0.2,
        generalAdmin: pAndL.summary.totalExpenses * 0.15,
        other: pAndL.summary.totalExpenses * 0.35
      }
    }
  }

  private transformCashFlowData(cashFlow: QuickBooksReport): any {
    return {
      operating: 456000, // Mock data
      investing: -120000,
      financing: 0,
      netChange: 336000,
      beginningBalance: 1200000,
      endingBalance: 1536000
    }
  }

  private transformBalanceSheetData(balanceSheet: QuickBooksReport): any {
    return {
      totalAssets: balanceSheet.summary.totalAssets || 0,
      totalLiabilities: balanceSheet.summary.totalLiabilities || 0,
      totalEquity: balanceSheet.summary.totalEquity || 0,
      currentRatio: 2.1,
      quickRatio: 1.8
    }
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
}

// Factory function
export function createQuickBooksService(config: QuickBooksConfig): QuickBooksService {
  return new QuickBooksService(config)
}
