"use client"

interface QuickBooksDemoConfig {
  companyId: string
  clientId: string
  environment: 'sandbox' | 'production'
}

interface QuickBooksDemoData {
  company: {
    id: string
    name: string
    country: string
    currency: string
  }
  accounts: any[]
  transactions: any[]
  reports: {
    profitAndLoss: any
    balanceSheet: any
    cashFlow: any
  }
}

export class QuickBooksDemoService {
  private config: QuickBooksDemoConfig
  private demoData: QuickBooksDemoData

  constructor(config: QuickBooksDemoConfig) {
    this.config = config
    this.demoData = this.generateDemoData()
  }

  private generateDemoData(): QuickBooksDemoData {
    return {
      company: {
        id: this.config.companyId,
        name: `Demo Company ${this.config.companyId}`,
        country: 'US',
        currency: 'USD'
      },
      accounts: [
        { id: '1', name: 'Cash', type: 'Bank', currentBalance: 1250000 },
        { id: '2', name: 'Accounts Receivable', type: 'Other Current Asset', currentBalance: 450000 },
        { id: '3', name: 'Inventory', type: 'Other Current Asset', currentBalance: 200000 },
        { id: '4', name: 'Equipment', type: 'Fixed Asset', currentBalance: 500000 },
        { id: '5', name: 'Accounts Payable', type: 'Accounts Payable', currentBalance: 150000 },
        { id: '6', name: 'Revenue', type: 'Income', currentBalance: 2400000 },
        { id: '7', name: 'Cost of Goods Sold', type: 'Cost of Goods Sold', currentBalance: 800000 },
        { id: '8', name: 'Operating Expenses', type: 'Expense', currentBalance: 1200000 }
      ],
      transactions: [
        { id: '1', date: '2025-01-15', amount: 50000, description: 'Customer Payment', type: 'credit' },
        { id: '2', date: '2025-01-14', amount: 25000, description: 'Office Rent', type: 'debit' },
        { id: '3', date: '2025-01-13', amount: 15000, description: 'Software Subscription', type: 'debit' },
        { id: '4', date: '2025-01-12', amount: 75000, description: 'Product Sales', type: 'credit' }
      ],
      reports: {
        profitAndLoss: {
          revenue: 2400000,
          costOfGoodsSold: 800000,
          grossProfit: 1600000,
          operatingExpenses: 1200000,
          netIncome: 400000
        },
        balanceSheet: {
          totalAssets: 2400000,
          totalLiabilities: 150000,
          totalEquity: 2250000
        },
        cashFlow: {
          operatingCashFlow: 350000,
          investingCashFlow: -100000,
          financingCashFlow: 0,
          netChange: 250000
        }
      }
    }
  }

  async getCompanyInfo() {
    return this.demoData.company
  }

  async getAccounts() {
    return this.demoData.accounts
  }

  async getTransactions(startDate: string, endDate: string) {
    return this.demoData.transactions.filter(t => 
      t.date >= startDate && t.date <= endDate
    )
  }

  async getProfitAndLossReport(startDate: string, endDate: string) {
    return {
      name: 'Profit and Loss',
      data: this.demoData.reports.profitAndLoss,
      summary: {
        totalRevenue: this.demoData.reports.profitAndLoss.revenue,
        totalExpenses: this.demoData.reports.profitAndLoss.operatingExpenses,
        netIncome: this.demoData.reports.profitAndLoss.netIncome
      }
    }
  }

  async getBalanceSheetReport(asOfDate: string) {
    return {
      name: 'Balance Sheet',
      data: this.demoData.reports.balanceSheet,
      summary: {
        totalAssets: this.demoData.reports.balanceSheet.totalAssets,
        totalLiabilities: this.demoData.reports.balanceSheet.totalLiabilities,
        totalEquity: this.demoData.reports.balanceSheet.totalEquity
      }
    }
  }

  async getCashFlowReport(startDate: string, endDate: string) {
    return {
      name: 'Cash Flow Statement',
      data: this.demoData.reports.cashFlow,
      summary: {
        operatingCashFlow: this.demoData.reports.cashFlow.operatingCashFlow,
        investingCashFlow: this.demoData.reports.cashFlow.investingCashFlow,
        financingCashFlow: this.demoData.reports.cashFlow.financingCashFlow,
        netChange: this.demoData.reports.cashFlow.netChange
      }
    }
  }

  async getFinancialDataForPeriod(startDate: string, endDate: string) {
    return {
      revenue: {
        totalRevenue: this.demoData.reports.profitAndLoss.revenue,
        period: 'current',
        breakdown: {
          productSales: this.demoData.reports.profitAndLoss.revenue * 0.7,
          serviceRevenue: this.demoData.reports.profitAndLoss.revenue * 0.3
        },
        growth: 0.15
      },
      expenses: {
        totalExpenses: this.demoData.reports.profitAndLoss.operatingExpenses,
        period: 'current',
        breakdown: {
          salesMarketing: this.demoData.reports.profitAndLoss.operatingExpenses * 0.3,
          rd: this.demoData.reports.profitAndLoss.operatingExpenses * 0.2,
          generalAdmin: this.demoData.reports.profitAndLoss.operatingExpenses * 0.15,
          other: this.demoData.reports.profitAndLoss.operatingExpenses * 0.35
        }
      },
      cashFlow: {
        operating: this.demoData.reports.cashFlow.operatingCashFlow,
        investing: this.demoData.reports.cashFlow.investingCashFlow,
        financing: this.demoData.reports.cashFlow.financingCashFlow,
        netChange: this.demoData.reports.cashFlow.netChange,
        beginningBalance: 1000000,
        endingBalance: 1250000
      },
      balanceSheet: {
        totalAssets: this.demoData.reports.balanceSheet.totalAssets,
        totalLiabilities: this.demoData.reports.balanceSheet.totalLiabilities,
        totalEquity: this.demoData.reports.balanceSheet.totalEquity,
        currentRatio: 2.1,
        quickRatio: 1.8
      }
    }
  }

  async testConnection() {
    return {
      success: true,
      message: `Successfully connected to ${this.demoData.company.name}`,
      companyInfo: this.demoData.company
    }
  }
}

// Factory function
export function createQuickBooksDemoService(config: QuickBooksDemoConfig): QuickBooksDemoService {
  return new QuickBooksDemoService(config)
}












