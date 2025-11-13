// Bank Feeds Integration - Plaid/Yodlee API
export interface BankAccount {
  id: string
  name: string
  type: 'checking' | 'savings' | 'credit' | 'loan'
  balance: number
  currency: string
  institution: string
  lastUpdated: Date
}

export interface Transaction {
  id: string
  accountId: string
  amount: number
  description: string
  category: string
  subcategory: string
  date: Date
  merchant: string
  type: 'debit' | 'credit'
  pending: boolean
}

export interface BankFeedConfig {
  plaidClientId: string
  plaidSecret: string
  plaidEnvironment: 'sandbox' | 'development' | 'production'
  yodleeClientId?: string
  yodleeSecret?: string
}

export class BankFeedService {
  private config: BankFeedConfig

  constructor(config: BankFeedConfig) {
    this.config = config
  }

  // Plaid Integration
  async connectPlaidAccount(publicToken: string): Promise<BankAccount[]> {
    // In production, this would use Plaid API
    // For demo, return mock data
    return [
      {
        id: 'demo-checking-1',
        name: 'Business Checking',
        type: 'checking',
        balance: 125000,
        currency: 'USD',
        institution: 'Chase Bank',
        lastUpdated: new Date()
      },
      {
        id: 'demo-savings-1',
        name: 'Business Savings',
        type: 'savings',
        balance: 250000,
        currency: 'USD',
        institution: 'Chase Bank',
        lastUpdated: new Date()
      }
    ]
  }

  async fetchTransactions(accountId: string, startDate: Date, endDate: Date): Promise<Transaction[]> {
    // In production, this would fetch from Plaid API
    // For demo, return mock transactions
    const mockTransactions: Transaction[] = [
      {
        id: 'txn-1',
        accountId,
        amount: 5000,
        description: 'Client Payment - ABC Corp',
        category: 'Income',
        subcategory: 'Service Revenue',
        date: new Date('2024-01-15'),
        merchant: 'ABC Corp',
        type: 'credit',
        pending: false
      },
      {
        id: 'txn-2',
        accountId,
        amount: -1200,
        description: 'Office Rent',
        category: 'Expenses',
        subcategory: 'Rent',
        date: new Date('2024-01-01'),
        merchant: 'Property Management LLC',
        type: 'debit',
        pending: false
      },
      {
        id: 'txn-3',
        accountId,
        amount: -500,
        description: 'Software Subscription',
        category: 'Expenses',
        subcategory: 'Software',
        date: new Date('2024-01-05'),
        merchant: 'SaaS Provider',
        type: 'debit',
        pending: false
      }
    ]

    return mockTransactions.filter(t => 
      t.date >= startDate && t.date <= endDate
    )
  }

  // Yodlee Integration (alternative to Plaid)
  async connectYodleeAccount(credentials: any): Promise<BankAccount[]> {
    // In production, this would use Yodlee API
    return this.connectPlaidAccount('mock-token')
  }

  // Auto-categorization using AI
  async categorizeTransaction(transaction: Transaction): Promise<Transaction> {
    // In production, this would use AI/ML to categorize
    // For demo, return with enhanced categorization
    return {
      ...transaction,
      category: this.autoCategorize(transaction.description),
      subcategory: this.getSubcategory(transaction.description)
    }
  }

  private autoCategorize(description: string): string {
    const desc = description.toLowerCase()
    
    if (desc.includes('payment') || desc.includes('invoice') || desc.includes('client')) {
      return 'Income'
    }
    if (desc.includes('rent') || desc.includes('office')) {
      return 'Expenses'
    }
    if (desc.includes('software') || desc.includes('subscription')) {
      return 'Expenses'
    }
    if (desc.includes('salary') || desc.includes('payroll')) {
      return 'Expenses'
    }
    
    return 'Other'
  }

  private getSubcategory(description: string): string {
    const desc = description.toLowerCase()
    
    if (desc.includes('payment') || desc.includes('invoice')) {
      return 'Service Revenue'
    }
    if (desc.includes('rent')) {
      return 'Rent'
    }
    if (desc.includes('software')) {
      return 'Software'
    }
    if (desc.includes('salary')) {
      return 'Payroll'
    }
    
    return 'General'
  }
}

// Export singleton instance
export const bankFeedService = new BankFeedService({
  plaidClientId: process.env.PLAID_CLIENT_ID || 'demo',
  plaidSecret: process.env.PLAID_SECRET || 'demo',
  plaidEnvironment: 'sandbox'
})
































