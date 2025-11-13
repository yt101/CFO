// Enhanced 1120 AI Advisor Engine with Import Capabilities
import { createClient } from "@/lib/supabase/server"
import type { AIResponse, Recommendation, ChartData } from "./advisor"

export interface Form1120Data {
  // Basic Company Info
  companyName: string
  ein: string
  taxYear: number
  entityType: string
  
  // Schedule L (Balance Sheet) Data
  scheduleL: {
    // Assets
    cash: { beginning: number; ending: number }
    accountsReceivable: { beginning: number; ending: number }
    allowanceForBadDebts: { beginning: number; ending: number }
    inventories: { beginning: number; ending: number }
    otherCurrentAssets: { beginning: number; ending: number }
    totalCurrentAssets: { beginning: number; ending: number }
    
    // Fixed Assets
    buildingsAndDepreciableAssets: { beginning: number; ending: number }
    accumulatedDepreciation: { beginning: number; ending: number }
    land: { beginning: number; ending: number }
    intangibleAssets: { beginning: number; ending: number }
    accumulatedAmortization: { beginning: number; ending: number }
    otherAssets: { beginning: number; ending: number }
    totalAssets: { beginning: number; ending: number }
    
    // Liabilities
    accountsPayable: { beginning: number; ending: number }
    shortTermDebt: { beginning: number; ending: number }
    otherCurrentLiabilities: { beginning: number; ending: number }
    totalCurrentLiabilities: { beginning: number; ending: number }
    longTermDebt: { beginning: number; ending: number }
    totalLiabilities: { beginning: number; ending: number }
    
    // Equity
    paidInCapital: { beginning: number; ending: number }
    retainedEarnings: { beginning: number; ending: number }
    totalEquity: { beginning: number; ending: number }
  }
  
  // P&L Data (Income Statement)
  profitLoss: {
    grossReceipts: number
    costOfGoodsSold: number
    grossProfit: number
    totalDeductions: number
    taxableIncome: number
    incomeTax: number
    netIncome: number
  }
  
  // Schedule M-1 (Reconciliation)
  scheduleM1: {
    incomePerBooks: number
    federalIncomeTaxPerBooks: number
    excessCapitalLosses: number
    incomeSubjectToTaxNotRecorded: number
    expensesRecordedNotDeducted: number
    depreciation: { book: number; tax: number; difference: number }
    charitableContributions: { book: number; tax: number; difference: number }
    mealsAndEntertainment: { book: number; tax: number; difference: number }
    otherDeductions: { book: number; tax: number; difference: number }
    totalAdditions: number
    totalSubtractions: number
    netIncome: number
  }
  
  // Schedule M-2 (Retained Earnings)
  scheduleM2: {
    beginningRetainedEarnings: number
    netIncome: number
    distributions: number
    otherAdjustments: number
    endingRetainedEarnings: number
  }
  
  // Financial Ratios
  financialRatios: {
    dso: number // Days Sales Outstanding
    dpo: number // Days Payable Outstanding
    dio: number // Days Inventory Outstanding
    currentRatio: number
    quickRatio: number
    debtToEquity: number
    grossMargin: number
    operatingMargin: number
    netMargin: number
    cashConversionCycle: number
    returnOnAssets: number
    returnOnEquity: number
  }
  
  // Optimization Opportunities
  optimizationOpportunities: {
    id: string
    category: 'deduction' | 'timing' | 'working_capital' | 'structure' | 'compliance'
    title: string
    description: string
    potentialSavings: number
    confidence: number
    irsReference: string
    sourceLine: string
    priority: 'high' | 'medium' | 'low'
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
    dueDate?: Date
    assignedTo?: string
  }[]
}

export class Form1120AdvisorEngine {
  private supabase: any
  private formData: Form1120Data | null = null

  constructor(supabase?: any) {
    this.supabase = supabase
  }

  setFormData(data: Form1120Data): void {
    this.formData = data
  }

  async importFromExcel(file: File | Buffer): Promise<Form1120Data> {
    // In production, this would use a library like xlsx to parse Excel files
    // For now, we'll simulate the import with structured data
    
    const mockData: Form1120Data = {
      companyName: "Sample Corporation",
      ein: "12-3456789",
      taxYear: 2024,
      entityType: "C-Corp",
      
      scheduleL: {
        cash: { beginning: 125000, ending: 150000 },
        accountsReceivable: { beginning: 450000, ending: 520000 },
        allowanceForBadDebts: { beginning: -25000, ending: -30000 },
        inventories: { beginning: 300000, ending: 350000 },
        otherCurrentAssets: { beginning: 50000, ending: 60000 },
        totalCurrentAssets: { beginning: 900000, ending: 1050000 },
        
        buildingsAndDepreciableAssets: { beginning: 800000, ending: 850000 },
        accumulatedDepreciation: { beginning: -200000, ending: -250000 },
        land: { beginning: 200000, ending: 200000 },
        intangibleAssets: { beginning: 150000, ending: 140000 },
        accumulatedAmortization: { beginning: -30000, ending: -40000 },
        otherAssets: { beginning: 75000, ending: 80000 },
        totalAssets: { beginning: 1700000, ending: 1840000 },
        
        accountsPayable: { beginning: 180000, ending: 200000 },
        shortTermDebt: { beginning: 100000, ending: 120000 },
        otherCurrentLiabilities: { beginning: 80000, ending: 90000 },
        totalCurrentLiabilities: { beginning: 360000, ending: 410000 },
        longTermDebt: { beginning: 400000, ending: 450000 },
        totalLiabilities: { beginning: 760000, ending: 860000 },
        
        paidInCapital: { beginning: 500000, ending: 500000 },
        retainedEarnings: { beginning: 440000, ending: 480000 },
        totalEquity: { beginning: 940000, ending: 980000 }
      },
      
      profitLoss: {
        grossReceipts: 2500000,
        costOfGoodsSold: 1500000,
        grossProfit: 1000000,
        totalDeductions: 750000,
        taxableIncome: 250000,
        incomeTax: 52500,
        netIncome: 197500
      },
      
      scheduleM1: {
        incomePerBooks: 250000,
        federalIncomeTaxPerBooks: 75000,
        excessCapitalLosses: 0,
        incomeSubjectToTaxNotRecorded: 0,
        expensesRecordedNotDeducted: 15000,
        depreciation: { book: 45000, tax: 60000, difference: 15000 },
        charitableContributions: { book: 10000, tax: 10000, difference: 0 },
        mealsAndEntertainment: { book: 5000, tax: 2500, difference: 2500 },
        otherDeductions: { book: 0, tax: 0, difference: 0 },
        totalAdditions: 17500,
        totalSubtractions: 0,
        netIncome: 250000
      },
      
      scheduleM2: {
        beginningRetainedEarnings: 440000,
        netIncome: 197500,
        distributions: 157500,
        otherAdjustments: 0,
        endingRetainedEarnings: 480000
      },
      
      financialRatios: {
        dso: 45,
        dpo: 30,
        dio: 60,
        currentRatio: 2.56,
        quickRatio: 1.71,
        debtToEquity: 0.88,
        grossMargin: 0.40,
        operatingMargin: 0.15,
        netMargin: 0.079,
        cashConversionCycle: 75,
        returnOnAssets: 0.107,
        returnOnEquity: 0.201
      },
      
      optimizationOpportunities: []
    }

    // Calculate financial ratios
    this.calculateFinancialRatios(mockData)
    
    // Identify optimization opportunities
    this.identifyOptimizationOpportunities(mockData)
    
    this.formData = mockData
    return mockData
  }

  private calculateFinancialRatios(data: Form1120Data): void {
    const { scheduleL, profitLoss } = data
    
    // Days Sales Outstanding (DSO)
    const avgAR = (scheduleL.accountsReceivable.beginning + scheduleL.accountsReceivable.ending) / 2
    data.financialRatios.dso = (avgAR / profitLoss.grossReceipts) * 365
    
    // Days Payable Outstanding (DPO)
    const avgAP = (scheduleL.accountsPayable.beginning + scheduleL.accountsPayable.ending) / 2
    data.financialRatios.dpo = (avgAP / profitLoss.costOfGoodsSold) * 365
    
    // Days Inventory Outstanding (DIO)
    const avgInventory = (scheduleL.inventories.beginning + scheduleL.inventories.ending) / 2
    data.financialRatios.dio = (avgInventory / profitLoss.costOfGoodsSold) * 365
    
    // Current Ratio
    data.financialRatios.currentRatio = scheduleL.totalCurrentAssets.ending / scheduleL.totalCurrentLiabilities.ending
    
    // Quick Ratio (excluding inventory)
    const quickAssets = scheduleL.totalCurrentAssets.ending - scheduleL.inventories.ending
    data.financialRatios.quickRatio = quickAssets / scheduleL.totalCurrentLiabilities.ending
    
    // Debt to Equity
    data.financialRatios.debtToEquity = scheduleL.totalLiabilities.ending / scheduleL.totalEquity.ending
    
    // Margins
    data.financialRatios.grossMargin = profitLoss.grossProfit / profitLoss.grossReceipts
    data.financialRatios.operatingMargin = (profitLoss.grossProfit - profitLoss.totalDeductions + profitLoss.incomeTax) / profitLoss.grossReceipts
    data.financialRatios.netMargin = profitLoss.netIncome / profitLoss.grossReceipts
    
    // Cash Conversion Cycle
    data.financialRatios.cashConversionCycle = data.financialRatios.dso + data.financialRatios.dio - data.financialRatios.dpo
    
    // Return on Assets
    data.financialRatios.returnOnAssets = profitLoss.netIncome / scheduleL.totalAssets.ending
    
    // Return on Equity
    data.financialRatios.returnOnEquity = profitLoss.netIncome / scheduleL.totalEquity.ending
  }

  private identifyOptimizationOpportunities(data: Form1120Data): void {
    const opportunities = []
    
    // Working Capital Optimization
    if (data.financialRatios.dso > 30) {
      const avgAR = (data.scheduleL.accountsReceivable.beginning + data.scheduleL.accountsReceivable.ending) / 2
      const potentialReduction = avgAR * ((data.financialRatios.dso - 30) / data.financialRatios.dso)
      
      opportunities.push({
        id: 'working_capital_dso',
        category: 'working_capital' as const,
        title: 'Optimize Accounts Receivable Collection',
        description: `DSO of ${data.financialRatios.dso.toFixed(0)} days is above industry average of 30 days. Reducing to 30 days could free up $${Math.round(potentialReduction).toLocaleString()} in working capital.`,
        potentialSavings: potentialReduction * 0.1, // 10% of freed capital as benefit
        confidence: 0.85,
        irsReference: 'N/A',
        sourceLine: 'Schedule L Line 2',
        priority: 'high' as const,
        status: 'pending' as const,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        assignedTo: 'CFO'
      })
    }
    
    // Inventory Optimization
    if (data.financialRatios.dio > 45) {
      const avgInventory = (data.scheduleL.inventories.beginning + data.scheduleL.inventories.ending) / 2
      const potentialReduction = avgInventory * 0.2 // 20% reduction
      
      opportunities.push({
        id: 'inventory_optimization',
        category: 'working_capital' as const,
        title: 'Implement Just-in-Time Inventory Management',
        description: `DIO of ${data.financialRatios.dio.toFixed(0)} days could be reduced through JIT inventory management, potentially freeing up $${Math.round(potentialReduction).toLocaleString()} in cash.`,
        potentialSavings: potentialReduction * 0.15,
        confidence: 0.75,
        irsReference: 'N/A',
        sourceLine: 'Schedule L Line 3',
        priority: 'medium' as const,
        status: 'pending' as const,
        dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
        assignedTo: 'Operations Manager'
      })
    }
    
    // Depreciation Optimization
    const depreciationDifference = data.scheduleM1.depreciation.difference
    if (depreciationDifference > 0) {
      opportunities.push({
        id: 'depreciation_optimization',
        category: 'timing' as const,
        title: 'Maximize Depreciation Deductions',
        description: `Tax depreciation is $${Math.round(depreciationDifference).toLocaleString()} higher than book depreciation. Consider bonus depreciation elections for qualifying assets.`,
        potentialSavings: depreciationDifference * 0.21, // 21% tax rate
        confidence: 0.90,
        irsReference: '§168(k)',
        sourceLine: 'Schedule M-1 Line 6',
        priority: 'high' as const,
        status: 'pending' as const,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        assignedTo: 'Tax Advisor'
      })
    }
    
    // Meals and Entertainment Optimization
    const mealsDifference = data.scheduleM1.mealsAndEntertainment.difference
    if (mealsDifference > 0) {
      opportunities.push({
        id: 'meals_entertainment',
        category: 'deduction' as const,
        title: 'Optimize Meals and Entertainment Deductions',
        description: `Implement proper tracking to maximize the 50% deductible portion of meals and entertainment expenses. Current limitation costs $${Math.round(mealsDifference * 0.21).toLocaleString()} in additional taxes.`,
        potentialSavings: mealsDifference * 0.21,
        confidence: 0.95,
        irsReference: '§274(n)(1)',
        sourceLine: 'Schedule M-1 Line 8',
        priority: 'medium' as const,
        status: 'pending' as const,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
        assignedTo: 'Controller'
      })
    }
    
    // Cash Flow Optimization
    if (data.financialRatios.cashConversionCycle > 60) {
      opportunities.push({
        id: 'cash_flow_optimization',
        category: 'working_capital' as const,
        title: 'Improve Cash Conversion Cycle',
        description: `Cash conversion cycle of ${data.financialRatios.cashConversionCycle.toFixed(0)} days is above optimal range of 45-60 days. Focus on reducing DSO and DIO while extending DPO.`,
        potentialSavings: data.scheduleL.totalCurrentAssets.ending * 0.05, // 5% of current assets
        confidence: 0.80,
        irsReference: 'N/A',
        sourceLine: 'Multiple Schedule L Lines',
        priority: 'high' as const,
        status: 'pending' as const,
        dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days
        assignedTo: 'CFO'
      })
    }
    
    data.optimizationOpportunities = opportunities
  }

  async answerQuestion(question: string): Promise<AIResponse> {
    if (!this.formData) {
      throw new Error("No form data loaded. Please import data first.")
    }

    if (!question || typeof question !== 'string') {
      throw new Error("Invalid question provided.")
    }

    const questionType = this.classifyQuestion(question)
    const context = this.extractContext(question)
    
    switch (questionType) {
      case 'schedule_l_analysis':
        return await this.analyzeScheduleL(question, context)
      case 'profit_loss_analysis':
        return await this.analyzeProfitLoss(question, context)
      case 'schedule_m1_analysis':
        return await this.analyzeScheduleM1(question, context)
      case 'schedule_m2_analysis':
        return await this.analyzeScheduleM2(question, context)
      case 'financial_ratios':
        return await this.analyzeFinancialRatios(question, context)
      case 'optimization_opportunities':
        return await this.analyzeOptimizationOpportunities(question, context)
      case 'working_capital':
        return await this.analyzeWorkingCapital(question, context)
      case 'tax_planning':
        return await this.analyzeTaxPlanning(question, context)
      default:
        return await this.generalAnalysis(question, context)
    }
  }

  private classifyQuestion(question: string): string {
    const lowerQuestion = question.toLowerCase()
    
    if (lowerQuestion.includes('schedule l') || lowerQuestion.includes('balance sheet') || lowerQuestion.includes('assets') || lowerQuestion.includes('liabilities')) {
      return 'schedule_l_analysis'
    }
    if (lowerQuestion.includes('profit') || lowerQuestion.includes('loss') || lowerQuestion.includes('income statement') || lowerQuestion.includes('revenue')) {
      return 'profit_loss_analysis'
    }
    if (lowerQuestion.includes('schedule m-1') || lowerQuestion.includes('m1') || lowerQuestion.includes('reconciliation')) {
      return 'schedule_m1_analysis'
    }
    if (lowerQuestion.includes('schedule m-2') || lowerQuestion.includes('m2') || lowerQuestion.includes('retained earnings')) {
      return 'schedule_m2_analysis'
    }
    if (lowerQuestion.includes('ratio') || lowerQuestion.includes('dso') || lowerQuestion.includes('dpo') || lowerQuestion.includes('margin')) {
      return 'financial_ratios'
    }
    if (lowerQuestion.includes('optimization') || lowerQuestion.includes('opportunity') || lowerQuestion.includes('savings') || lowerQuestion.includes('improvement')) {
      return 'optimization_opportunities'
    }
    if (lowerQuestion.includes('working capital') || lowerQuestion.includes('cash flow') || lowerQuestion.includes('liquidity')) {
      return 'working_capital'
    }
    if (lowerQuestion.includes('tax planning') || lowerQuestion.includes('deduction') || lowerQuestion.includes('strategy')) {
      return 'tax_planning'
    }
    
    return 'general'
  }

  private extractContext(question: string): any {
    return {
      question: question,
      formData: this.formData
    }
  }

  private async analyzeScheduleL(question: string, context: any): Promise<AIResponse> {
    const { scheduleL } = this.formData!
    
    const answer = `**Schedule L (Balance Sheet) Analysis**\n\n**Assets:**\n• Cash: $${scheduleL.cash.beginning.toLocaleString()} → $${scheduleL.cash.ending.toLocaleString()} (+${((scheduleL.cash.ending - scheduleL.cash.beginning) / scheduleL.cash.beginning * 100).toFixed(1)}%)\n• Accounts Receivable: $${scheduleL.accountsReceivable.beginning.toLocaleString()} → $${scheduleL.accountsReceivable.ending.toLocaleString()} (+${((scheduleL.accountsReceivable.ending - scheduleL.accountsReceivable.beginning) / scheduleL.accountsReceivable.beginning * 100).toFixed(1)}%)\n• Inventories: $${scheduleL.inventories.beginning.toLocaleString()} → $${scheduleL.inventories.ending.toLocaleString()} (+${((scheduleL.inventories.ending - scheduleL.inventories.beginning) / scheduleL.inventories.beginning * 100).toFixed(1)}%)\n• Total Assets: $${scheduleL.totalAssets.beginning.toLocaleString()} → $${scheduleL.totalAssets.ending.toLocaleString()}\n\n**Liabilities & Equity:**\n• Current Liabilities: $${scheduleL.totalCurrentLiabilities.ending.toLocaleString()}\n• Total Liabilities: $${scheduleL.totalLiabilities.ending.toLocaleString()}\n• Total Equity: $${scheduleL.totalEquity.ending.toLocaleString()}\n\n**Key Insights:**\n• Strong asset growth of ${((scheduleL.totalAssets.ending - scheduleL.totalAssets.beginning) / scheduleL.totalAssets.beginning * 100).toFixed(1)}%\n• Current ratio of ${this.formData!.financialRatios.currentRatio.toFixed(2)} indicates good liquidity\n• Debt-to-equity ratio of ${this.formData!.financialRatios.debtToEquity.toFixed(2)} shows balanced capital structure`

    const charts: ChartData[] = [{
      type: 'bar',
      title: 'Balance Sheet Composition',
      data: [
        { category: 'Current Assets', value: scheduleL.totalCurrentAssets.ending },
        { category: 'Fixed Assets', value: scheduleL.totalAssets.ending - scheduleL.totalCurrentAssets.ending },
        { category: 'Current Liabilities', value: scheduleL.totalCurrentLiabilities.ending },
        { category: 'Long-term Debt', value: scheduleL.longTermDebt.ending },
        { category: 'Equity', value: scheduleL.totalEquity.ending }
      ],
      xAxis: 'category',
      yAxis: 'value'
    }]

    const recommendations: Recommendation[] = [
      {
        title: 'Optimize Working Capital',
        description: 'Focus on reducing accounts receivable and inventory levels to improve cash flow',
        impact: 'high',
        timeline: '3-6 months',
        effort: 'medium',
        category: 'cash_flow'
      }
    ]

    return {
      answer,
      confidence: 0.92,
      sources: ['Schedule L', 'Balance Sheet Analysis'],
      charts,
      recommendations
    }
  }

  private async analyzeProfitLoss(question: string, context: any): Promise<AIResponse> {
    const { profitLoss } = this.formData!
    
    const answer = `**P&L (Income Statement) Analysis**\n\n**Revenue & Costs:**\n• Gross Receipts: $${profitLoss.grossReceipts.toLocaleString()}\n• Cost of Goods Sold: $${profitLoss.costOfGoodsSold.toLocaleString()}\n• Gross Profit: $${profitLoss.grossProfit.toLocaleString()} (${(profitLoss.grossProfit / profitLoss.grossReceipts * 100).toFixed(1)}% margin)\n\n**Profitability:**\n• Total Deductions: $${profitLoss.totalDeductions.toLocaleString()}\n• Taxable Income: $${profitLoss.taxableIncome.toLocaleString()}\n• Income Tax: $${profitLoss.incomeTax.toLocaleString()}\n• Net Income: $${profitLoss.netIncome.toLocaleString()} (${(profitLoss.netIncome / profitLoss.grossReceipts * 100).toFixed(1)}% margin)\n\n**Key Performance Indicators:**\n• Gross Margin: ${(this.formData!.financialRatios.grossMargin * 100).toFixed(1)}%\n• Operating Margin: ${(this.formData!.financialRatios.operatingMargin * 100).toFixed(1)}%\n• Net Margin: ${(this.formData!.financialRatios.netMargin * 100).toFixed(1)}%\n• Return on Assets: ${(this.formData!.financialRatios.returnOnAssets * 100).toFixed(1)}%\n• Return on Equity: ${(this.formData!.financialRatios.returnOnEquity * 100).toFixed(1)}%`

    const charts: ChartData[] = [{
      type: 'bar',
      title: 'Profitability Margins',
      data: [
        { metric: 'Gross Margin', value: this.formData!.financialRatios.grossMargin * 100 },
        { metric: 'Operating Margin', value: this.formData!.financialRatios.operatingMargin * 100 },
        { metric: 'Net Margin', value: this.formData!.financialRatios.netMargin * 100 }
      ],
      xAxis: 'metric',
      yAxis: 'value'
    }]

    const recommendations: Recommendation[] = [
      {
        title: 'Improve Gross Margin',
        description: 'Review pricing strategy and cost structure to enhance gross profitability',
        impact: 'high',
        timeline: '6-12 months',
        effort: 'high',
        category: 'revenue'
      }
    ]

    return {
      answer,
      confidence: 0.95,
      sources: ['Form 1120', 'Income Statement Analysis'],
      charts,
      recommendations
    }
  }

  private async analyzeScheduleM1(question: string, context: any): Promise<AIResponse> {
    const { scheduleM1 } = this.formData!
    
    const answer = `**Schedule M-1 (Reconciliation) Analysis**\n\n**Book vs Tax Differences:**\n• Income per Books: $${scheduleM1.incomePerBooks.toLocaleString()}\n• Federal Income Tax per Books: $${scheduleM1.federalIncomeTaxPerBooks.toLocaleString()}\n\n**Key Adjustments:**\n• Depreciation: Book $${scheduleM1.depreciation.book.toLocaleString()} vs Tax $${scheduleM1.depreciation.tax.toLocaleString()} (Difference: $${scheduleM1.depreciation.difference.toLocaleString()})\n• Meals & Entertainment: Book $${scheduleM1.mealsAndEntertainment.book.toLocaleString()} vs Tax $${scheduleM1.mealsAndEntertainment.tax.toLocaleString()} (Difference: $${scheduleM1.mealsAndEntertainment.difference.toLocaleString()})\n• Charitable Contributions: $${scheduleM1.charitableContributions.book.toLocaleString()} (No difference)\n\n**Total Additions: $${scheduleM1.totalAdditions.toLocaleString()}**\n**Total Subtractions: $${scheduleM1.totalSubtractions.toLocaleString()}**\n\n**Key Insights:**\n• Tax depreciation exceeds book depreciation by $${scheduleM1.depreciation.difference.toLocaleString()}, indicating accelerated depreciation methods\n• Meals & entertainment limited to 50% deduction per §274(n)(1)\n• No significant timing differences in charitable contributions`

    const charts: ChartData[] = [{
      type: 'bar',
      title: 'Book vs Tax Differences',
      data: [
        { item: 'Depreciation', book: scheduleM1.depreciation.book, tax: scheduleM1.depreciation.tax },
        { item: 'Meals & Entertainment', book: scheduleM1.mealsAndEntertainment.book, tax: scheduleM1.mealsAndEntertainment.tax },
        { item: 'Charitable Contributions', book: scheduleM1.charitableContributions.book, tax: scheduleM1.charitableContributions.tax }
      ],
      xAxis: 'item',
      yAxis: 'amount'
    }]

    const recommendations: Recommendation[] = [
      {
        title: 'Maximize Depreciation Deductions',
        description: 'Consider bonus depreciation elections for qualifying assets to accelerate tax benefits',
        impact: 'high',
        timeline: '1-3 months',
        effort: 'low',
        category: 'tax_optimization'
      }
    ]

    return {
      answer,
      confidence: 0.90,
      sources: ['Schedule M-1', 'Book-Tax Reconciliation'],
      charts,
      recommendations
    }
  }

  private async analyzeScheduleM2(question: string, context: any): Promise<AIResponse> {
    const { scheduleM2 } = this.formData!
    
    const answer = `**Schedule M-2 (Retained Earnings) Analysis**\n\n**Retained Earnings Movement:**\n• Beginning Retained Earnings: $${scheduleM2.beginningRetainedEarnings.toLocaleString()}\n• Net Income: $${scheduleM2.netIncome.toLocaleString()}\n• Distributions: $${scheduleM2.distributions.toLocaleString()}\n• Other Adjustments: $${scheduleM2.otherAdjustments.toLocaleString()}\n• Ending Retained Earnings: $${scheduleM2.endingRetainedEarnings.toLocaleString()}\n\n**Key Insights:**\n• Retained earnings increased by $${(scheduleM2.endingRetainedEarnings - scheduleM2.beginningRetainedEarnings).toLocaleString()}\n• Distribution ratio: ${(scheduleM2.distributions / scheduleM2.netIncome * 100).toFixed(1)}% of net income\n• Retained earnings growth rate: ${((scheduleM2.endingRetainedEarnings - scheduleM2.beginningRetainedEarnings) / scheduleM2.beginningRetainedEarnings * 100).toFixed(1)}%\n\n**Financial Health Indicators:**\n• Strong earnings retention supports future growth\n• Balanced distribution policy maintains shareholder returns\n• Healthy retained earnings position for reinvestment`

    const charts: ChartData[] = [{
      type: 'waterfall',
      title: 'Retained Earnings Movement',
      data: [
        { category: 'Beginning RE', value: scheduleM2.beginningRetainedEarnings },
        { category: 'Net Income', value: scheduleM2.netIncome },
        { category: 'Distributions', value: -scheduleM2.distributions },
        { category: 'Other Adjustments', value: scheduleM2.otherAdjustments },
        { category: 'Ending RE', value: scheduleM2.endingRetainedEarnings }
      ],
      xAxis: 'category',
      yAxis: 'value'
    }]

    const recommendations: Recommendation[] = [
      {
        title: 'Optimize Distribution Strategy',
        description: 'Consider tax-efficient distribution methods to minimize shareholder tax burden',
        impact: 'medium',
        timeline: '6-12 months',
        effort: 'medium',
        category: 'tax_optimization'
      }
    ]

    return {
      answer,
      confidence: 0.88,
      sources: ['Schedule M-2', 'Retained Earnings Analysis'],
      charts,
      recommendations
    }
  }

  private async analyzeFinancialRatios(question: string, context: any): Promise<AIResponse> {
    const { financialRatios } = this.formData!
    
    const answer = `**Financial Ratios Analysis**\n\n**Working Capital Metrics:**\n• Days Sales Outstanding (DSO): ${financialRatios.dso.toFixed(0)} days\n• Days Payable Outstanding (DPO): ${financialRatios.dpo.toFixed(0)} days\n• Days Inventory Outstanding (DIO): ${financialRatios.dio.toFixed(0)} days\n• Cash Conversion Cycle: ${financialRatios.cashConversionCycle.toFixed(0)} days\n\n**Liquidity Ratios:**\n• Current Ratio: ${financialRatios.currentRatio.toFixed(2)}\n• Quick Ratio: ${financialRatios.quickRatio.toFixed(2)}\n\n**Profitability Ratios:**\n• Gross Margin: ${(financialRatios.grossMargin * 100).toFixed(1)}%\n• Operating Margin: ${(financialRatios.operatingMargin * 100).toFixed(1)}%\n• Net Margin: ${(financialRatios.netMargin * 100).toFixed(1)}%\n• Return on Assets: ${(financialRatios.returnOnAssets * 100).toFixed(1)}%\n• Return on Equity: ${(financialRatios.returnOnEquity * 100).toFixed(1)}%\n\n**Leverage Ratios:**\n• Debt-to-Equity: ${financialRatios.debtToEquity.toFixed(2)}\n\n**Benchmark Analysis:**\n• DSO is ${financialRatios.dso > 30 ? 'above' : 'below'} industry average of 30 days\n• Cash conversion cycle is ${financialRatios.cashConversionCycle > 60 ? 'above' : 'within'} optimal range of 45-60 days\n• Current ratio indicates ${financialRatios.currentRatio > 2 ? 'strong' : 'adequate'} liquidity position`

    const charts: ChartData[] = [{
      type: 'radar',
      title: 'Financial Performance Dashboard',
      data: [
        { metric: 'Current Ratio', value: financialRatios.currentRatio, target: 2.0 },
        { metric: 'Quick Ratio', value: financialRatios.quickRatio, target: 1.0 },
        { metric: 'Gross Margin %', value: financialRatios.grossMargin * 100, target: 40 },
        { metric: 'Net Margin %', value: financialRatios.netMargin * 100, target: 10 },
        { metric: 'ROA %', value: financialRatios.returnOnAssets * 100, target: 8 },
        { metric: 'ROE %', value: financialRatios.returnOnEquity * 100, target: 15 }
      ],
      xAxis: 'metric',
      yAxis: 'value'
    }]

    const recommendations: Recommendation[] = [
      {
        title: 'Improve Working Capital Efficiency',
        description: 'Focus on reducing DSO and DIO while extending DPO to optimize cash conversion cycle',
        impact: 'high',
        timeline: '3-6 months',
        effort: 'medium',
        category: 'working_capital'
      }
    ]

    return {
      answer,
      confidence: 0.93,
      sources: ['Financial Ratios Analysis', 'Industry Benchmarks'],
      charts,
      recommendations
    }
  }

  private async analyzeOptimizationOpportunities(question: string, context: any): Promise<AIResponse> {
    const { optimizationOpportunities } = this.formData!
    
    const totalSavings = optimizationOpportunities.reduce((sum, opp) => sum + opp.potentialSavings, 0)
    const highPriorityOpps = optimizationOpportunities.filter(opp => opp.priority === 'high')
    
    const answer = `**Tax Optimization Opportunities Analysis**\n\n**Summary:**\n• Total Opportunities Identified: ${optimizationOpportunities.length}\n• Total Potential Savings: $${Math.round(totalSavings).toLocaleString()}\n• High Priority Items: ${highPriorityOpps.length}\n\n**Top Opportunities:**\n${optimizationOpportunities.map((opp, index) => {
      const dueDate = opp.dueDate ? new Date(opp.dueDate).toLocaleDateString() : 'TBD'
      return `${index + 1}. **${opp.title}** (${opp.category})\n   • Potential Savings: $${Math.round(opp.potentialSavings).toLocaleString()}\n   • Confidence: ${(opp.confidence * 100).toFixed(0)}%\n   • Priority: ${opp.priority.toUpperCase()}\n   • Status: ${opp.status}\n   • Due: ${dueDate}\n   • Assigned: ${opp.assignedTo || 'Unassigned'}\n   • Description: ${opp.description}\n   • IRS Reference: ${opp.irsReference}\n   • Source: ${opp.sourceLine}\n`
    }).join('\n')}\n\n**Implementation Priority:**\n1. **Immediate Actions** (Due within 30 days): Focus on high-impact, low-effort items\n2. **Strategic Planning** (30-90 days): Implement working capital optimizations\n3. **Long-term Initiatives** (90+ days): Structural and process improvements\n\n**Expected ROI:**\n• Investment Required: $${Math.round(totalSavings * 0.1).toLocaleString()} (estimated 10% of savings)\n• Expected Return: $${Math.round(totalSavings).toLocaleString()}\n• ROI: ${Math.round((totalSavings / (totalSavings * 0.1)) * 100)}%`

    const charts: ChartData[] = [{
      type: 'bar',
      title: 'Optimization Opportunities by Category',
      data: optimizationOpportunities.reduce((acc, opp) => {
        const existing = acc.find(item => item.category === opp.category)
        if (existing) {
          existing.value += opp.potentialSavings
        } else {
          acc.push({ category: opp.category, value: opp.potentialSavings })
        }
        return acc
      }, [] as { category: string; value: number }[]),
      xAxis: 'category',
      yAxis: 'value'
    }]

    const recommendations: Recommendation[] = optimizationOpportunities
      .filter(opp => opp.priority === 'high')
      .map(opp => {
        const dueDate = opp.dueDate ? new Date(opp.dueDate) : null
        const timeline = dueDate ? `${Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days` : 'TBD'
        return {
          title: opp.title,
          description: opp.description,
          impact: opp.potentialSavings > 10000 ? 'high' : opp.potentialSavings > 5000 ? 'medium' : 'low',
          timeline,
          effort: 'medium',
          category: 'tax_optimization' as const
        }
      })

    return {
      answer,
      confidence: 0.89,
      sources: ['Tax Optimization Analysis', 'IRS Code References'],
      charts,
      recommendations
    }
  }

  private async analyzeWorkingCapital(question: string, context: any): Promise<AIResponse> {
    const { financialRatios, scheduleL } = this.formData!
    
    const answer = `**Working Capital Analysis**\n\n**Current Position:**\n• Cash: $${scheduleL.cash.ending.toLocaleString()}\n• Accounts Receivable: $${scheduleL.accountsReceivable.ending.toLocaleString()}\n• Inventory: $${scheduleL.inventories.ending.toLocaleString()}\n• Accounts Payable: $${scheduleL.accountsPayable.ending.toLocaleString()}\n• Total Current Assets: $${scheduleL.totalCurrentAssets.ending.toLocaleString()}\n• Total Current Liabilities: $${scheduleL.totalCurrentLiabilities.ending.toLocaleString()}\n\n**Working Capital Metrics:**\n• Net Working Capital: $${(scheduleL.totalCurrentAssets.ending - scheduleL.totalCurrentLiabilities.ending).toLocaleString()}\n• Current Ratio: ${financialRatios.currentRatio.toFixed(2)}\n• Quick Ratio: ${financialRatios.quickRatio.toFixed(2)}\n\n**Efficiency Metrics:**\n• Days Sales Outstanding (DSO): ${financialRatios.dso.toFixed(0)} days\n• Days Payable Outstanding (DPO): ${financialRatios.dpo.toFixed(0)} days\n• Days Inventory Outstanding (DIO): ${financialRatios.dio.toFixed(0)} days\n• Cash Conversion Cycle: ${financialRatios.cashConversionCycle.toFixed(0)} days\n\n**Optimization Opportunities:**\n• **DSO Reduction**: Target 30 days (industry average) to free up $${Math.round((financialRatios.dso - 30) / financialRatios.dso * scheduleL.accountsReceivable.ending).toLocaleString()}\n• **DIO Reduction**: Target 45 days to free up $${Math.round((financialRatios.dio - 45) / financialRatios.dio * scheduleL.inventories.ending).toLocaleString()}\n• **DPO Extension**: Target 35 days to defer $${Math.round((35 - financialRatios.dpo) / financialRatios.dpo * scheduleL.accountsPayable.ending).toLocaleString()}\n\n**Total Potential Cash Flow Improvement: $${Math.round(((financialRatios.dso - 30) / financialRatios.dso * scheduleL.accountsReceivable.ending) + ((financialRatios.dio - 45) / financialRatios.dio * scheduleL.inventories.ending) + ((35 - financialRatios.dpo) / financialRatios.dpo * scheduleL.accountsPayable.ending)).toLocaleString()}**`

    const charts: ChartData[] = [{
      type: 'line',
      title: 'Working Capital Efficiency Trends',
      data: [
        { metric: 'DSO', current: financialRatios.dso, target: 30, industry: 30 },
        { metric: 'DPO', current: financialRatios.dpo, target: 35, industry: 28 },
        { metric: 'DIO', current: financialRatios.dio, target: 45, industry: 40 },
        { metric: 'CCC', current: financialRatios.cashConversionCycle, target: 50, industry: 45 }
      ],
      xAxis: 'metric',
      yAxis: 'days'
    }]

    const recommendations: Recommendation[] = [
      {
        title: 'Implement Stricter Credit Policies',
        description: 'Reduce DSO from 45 to 30 days through improved collection procedures',
        impact: 'high',
        timeline: '1-3 months',
        effort: 'medium',
        category: 'working_capital'
      },
      {
        title: 'Optimize Inventory Management',
        description: 'Implement JIT inventory to reduce DIO from 60 to 45 days',
        impact: 'high',
        timeline: '3-6 months',
        effort: 'high',
        category: 'working_capital'
      },
      {
        title: 'Extend Payment Terms',
        description: 'Negotiate with suppliers to extend DPO from 30 to 35 days',
        impact: 'medium',
        timeline: '1-2 months',
        effort: 'low',
        category: 'working_capital'
      }
    ]

    return {
      answer,
      confidence: 0.91,
      sources: ['Working Capital Analysis', 'Industry Benchmarks'],
      charts,
      recommendations
    }
  }

  private async analyzeTaxPlanning(question: string, context: any): Promise<AIResponse> {
    const { scheduleM1, profitLoss, optimizationOpportunities } = this.formData!
    
    const answer = `**Tax Planning Analysis**\n\n**Current Tax Position:**\n• Taxable Income: $${profitLoss.taxableIncome.toLocaleString()}\n• Income Tax: $${profitLoss.incomeTax.toLocaleString()}\n• Effective Tax Rate: ${(profitLoss.incomeTax / profitLoss.taxableIncome * 100).toFixed(1)}%\n\n**Key Tax Optimization Areas:**\n\n**1. Depreciation Strategy:**\n• Current tax depreciation exceeds book by $${scheduleM1.depreciation.difference.toLocaleString()}\n• Consider bonus depreciation elections for qualifying assets\n• Potential additional savings: $${Math.round(scheduleM1.depreciation.difference * 0.21).toLocaleString()}\n\n**2. Deduction Optimization:**\n• Meals & entertainment limited to 50% deduction\n• Current limitation: $${scheduleM1.mealsAndEntertainment.difference.toLocaleString()}\n• Implement proper tracking to maximize deductible portions\n\n**3. Working Capital Tax Benefits:**\n• Accelerate deductions through inventory method changes\n• Consider LIFO method for inventory costing\n• Defer income through timing of receivables\n\n**4. Entity Structure Optimization:**\n• Evaluate S-Corp election if distributions exceed salary\n• Consider QBI deduction opportunities\n• Review state tax implications\n\n**Strategic Recommendations:**\n• **Immediate**: Elect bonus depreciation before year-end\n• **Short-term**: Implement expense tracking systems\n• **Long-term**: Evaluate entity structure and state tax planning\n\n**Total Identified Tax Savings: $${Math.round(optimizationOpportunities.reduce((sum, opp) => sum + opp.potentialSavings, 0)).toLocaleString()}**`

    const charts: ChartData[] = [{
      type: 'pie',
      title: 'Tax Optimization Opportunities by Category',
      data: optimizationOpportunities.reduce((acc, opp) => {
        const existing = acc.find(item => item.name === opp.category)
        if (existing) {
          existing.value += opp.potentialSavings
        } else {
          acc.push({ name: opp.category, value: opp.potentialSavings })
        }
        return acc
      }, [] as { name: string; value: number }[]),
      xAxis: 'name',
      yAxis: 'value'
    }]

    const recommendations: Recommendation[] = [
      {
        title: 'Elect Bonus Depreciation',
        description: 'File Form 4562 to elect 100% bonus depreciation on qualifying assets',
        impact: 'high',
        timeline: '1 month',
        effort: 'low',
        category: 'tax_optimization'
      },
      {
        title: 'Implement Expense Tracking',
        description: 'Set up systems to properly track and categorize deductible expenses',
        impact: 'medium',
        timeline: '2-3 months',
        effort: 'medium',
        category: 'compliance'
      },
      {
        title: 'Review Entity Structure',
        description: 'Evaluate S-Corp election and QBI deduction opportunities',
        impact: 'high',
        timeline: '6-12 months',
        effort: 'high',
        category: 'structure'
      }
    ]

    return {
      answer,
      confidence: 0.87,
      sources: ['Tax Planning Analysis', 'IRS Code References'],
      charts,
      recommendations
    }
  }

  private async generalAnalysis(question: string, context: any): Promise<AIResponse> {
    const answer = `I can help you analyze your 1120 tax return data across multiple dimensions:\n\n**Available Analysis:**\n• **Schedule L**: Balance sheet analysis and asset/liability trends\n• **P&L**: Income statement analysis and profitability metrics\n• **Schedule M-1**: Book-to-tax reconciliation and timing differences\n• **Schedule M-2**: Retained earnings movement and distribution analysis\n• **Financial Ratios**: Working capital, profitability, and efficiency metrics\n• **Optimization Opportunities**: Tax savings and efficiency improvements\n• **Working Capital**: Cash flow and liquidity analysis\n• **Tax Planning**: Strategic tax optimization recommendations\n\n**Your Current Status:**\n• ${this.formData!.optimizationOpportunities.length} optimization opportunities identified\n• $${Math.round(this.formData!.optimizationOpportunities.reduce((sum, opp) => sum + opp.potentialSavings, 0)).toLocaleString()} in potential savings\n• ${this.formData!.financialRatios.cashConversionCycle.toFixed(0)}-day cash conversion cycle\n\nWhat specific area would you like to explore in detail?`

    return {
      answer,
      confidence: 0.85,
      sources: ['Form 1120 Analysis', 'Financial Data'],
      charts: [],
      recommendations: []
    }
  }

  async saveToDatabase(companyId: string): Promise<void> {
    if (!this.formData || !this.supabase) {
      throw new Error("No form data or database connection available")
    }

    // Save company tax profile
    const { data: taxProfile, error: profileError } = await this.supabase
      .from('company_tax_profiles')
      .insert({
        company_id: companyId,
        ein: this.formData.ein,
        fiscal_year: this.formData.taxYear,
        entity_type: this.formData.entityType,
        revenue_range: this.getRevenueRange(this.formData.profitLoss.grossReceipts)
      })
      .select()
      .single()

    if (profileError) throw profileError

    // Save Schedule L data
    await this.saveScheduleLData(taxProfile.id)
    
    // Save Schedule M-1 data
    await this.saveScheduleM1Data(taxProfile.id)
    
    // Save Schedule M-2 data
    await this.saveScheduleM2Data(taxProfile.id)
    
    // Save financial ratios
    await this.saveFinancialRatios(taxProfile.id)
    
    // Save optimization opportunities
    await this.saveOptimizationOpportunities(taxProfile.id)
  }

  private getRevenueRange(revenue: number): string {
    if (revenue < 1000000) return '<$1M'
    if (revenue < 5000000) return '$1M-$5M'
    if (revenue < 20000000) return '$5M-$20M'
    if (revenue < 100000000) return '$20M-$100M'
    return '>$100M'
  }

  private async saveScheduleLData(profileId: string): Promise<void> {
    const { scheduleL } = this.formData!
    
    const scheduleLData = [
      { line_number: 1, account_name: 'Cash', beginning_year: scheduleL.cash.beginning, end_year: scheduleL.cash.ending },
      { line_number: 2, account_name: 'Trade notes and accounts receivable', beginning_year: scheduleL.accountsReceivable.beginning, end_year: scheduleL.accountsReceivable.ending },
      { line_number: 3, account_name: 'Less allowance for bad debts', beginning_year: scheduleL.allowanceForBadDebts.beginning, end_year: scheduleL.allowanceForBadDebts.ending },
      { line_number: 4, account_name: 'Inventories', beginning_year: scheduleL.inventories.beginning, end_year: scheduleL.inventories.ending },
      { line_number: 5, account_name: 'Other current assets', beginning_year: scheduleL.otherCurrentAssets.beginning, end_year: scheduleL.otherCurrentAssets.ending },
      { line_number: 6, account_name: 'Total current assets', beginning_year: scheduleL.totalCurrentAssets.beginning, end_year: scheduleL.totalCurrentAssets.ending },
      { line_number: 11, account_name: 'Buildings and other depreciable assets', beginning_year: scheduleL.buildingsAndDepreciableAssets.beginning, end_year: scheduleL.buildingsAndDepreciableAssets.ending },
      { line_number: 12, account_name: 'Less accumulated depreciation', beginning_year: scheduleL.accumulatedDepreciation.beginning, end_year: scheduleL.accumulatedDepreciation.ending },
      { line_number: 15, account_name: 'Land', beginning_year: scheduleL.land.beginning, end_year: scheduleL.land.ending },
      { line_number: 16, account_name: 'Intangible assets', beginning_year: scheduleL.intangibleAssets.beginning, end_year: scheduleL.intangibleAssets.ending },
      { line_number: 17, account_name: 'Less accumulated amortization', beginning_year: scheduleL.accumulatedAmortization.beginning, end_year: scheduleL.accumulatedAmortization.ending },
      { line_number: 18, account_name: 'Other assets', beginning_year: scheduleL.otherAssets.beginning, end_year: scheduleL.otherAssets.ending },
      { line_number: 19, account_name: 'Total assets', beginning_year: scheduleL.totalAssets.beginning, end_year: scheduleL.totalAssets.ending },
      { line_number: 20, account_name: 'Accounts payable', beginning_year: scheduleL.accountsPayable.beginning, end_year: scheduleL.accountsPayable.ending },
      { line_number: 21, account_name: 'Mortgages, notes, bonds payable in less than 1 year', beginning_year: scheduleL.shortTermDebt.beginning, end_year: scheduleL.shortTermDebt.ending },
      { line_number: 22, account_name: 'Other current liabilities', beginning_year: scheduleL.otherCurrentLiabilities.beginning, end_year: scheduleL.otherCurrentLiabilities.ending },
      { line_number: 23, account_name: 'Total current liabilities', beginning_year: scheduleL.totalCurrentLiabilities.beginning, end_year: scheduleL.totalCurrentLiabilities.ending },
      { line_number: 24, account_name: 'Total liabilities', beginning_year: scheduleL.totalLiabilities.beginning, end_year: scheduleL.totalLiabilities.ending },
      { line_number: 25, account_name: 'Paid-in capital', beginning_year: scheduleL.paidInCapital.beginning, end_year: scheduleL.paidInCapital.ending },
      { line_number: 26, account_name: 'Retained earnings', beginning_year: scheduleL.retainedEarnings.beginning, end_year: scheduleL.retainedEarnings.ending },
      { line_number: 27, account_name: 'Total equity', beginning_year: scheduleL.totalEquity.beginning, end_year: scheduleL.totalEquity.ending }
    ]

    const { error } = await this.supabase
      .from('schedule_l_data')
      .insert(scheduleLData.map(item => ({
        company_tax_profile_id: profileId,
        ...item
      })))

    if (error) throw error
  }

  private async saveScheduleM1Data(profileId: string): Promise<void> {
    const { scheduleM1 } = this.formData!
    
    const m1Data = [
      { line_number: 1, item_description: 'Income per books', book_amount: scheduleM1.incomePerBooks, tax_amount: scheduleM1.incomePerBooks, difference: 0, difference_type: 'none', irs_code: '' },
      { line_number: 2, item_description: 'Federal income tax per books', book_amount: scheduleM1.federalIncomeTaxPerBooks, tax_amount: scheduleM1.federalIncomeTaxPerBooks, difference: 0, difference_type: 'none', irs_code: '' },
      { line_number: 3, item_description: 'Excess of capital losses over capital gains', book_amount: scheduleM1.excessCapitalLosses, tax_amount: scheduleM1.excessCapitalLosses, difference: 0, difference_type: 'none', irs_code: '' },
      { line_number: 4, item_description: 'Income subject to tax not recorded on books this year', book_amount: scheduleM1.incomeSubjectToTaxNotRecorded, tax_amount: scheduleM1.incomeSubjectToTaxNotRecorded, difference: 0, difference_type: 'none', irs_code: '' },
      { line_number: 5, item_description: 'Expenses recorded on books this year not deducted on this return', book_amount: scheduleM1.expensesRecordedNotDeducted, tax_amount: 0, difference: scheduleM1.expensesRecordedNotDeducted, difference_type: 'timing', irs_code: '§263A' },
      { line_number: 6, item_description: 'Depreciation', book_amount: scheduleM1.depreciation.book, tax_amount: scheduleM1.depreciation.tax, difference: scheduleM1.depreciation.difference, difference_type: 'timing', irs_code: '§168' },
      { line_number: 7, item_description: 'Charitable contributions', book_amount: scheduleM1.charitableContributions.book, tax_amount: scheduleM1.charitableContributions.tax, difference: scheduleM1.charitableContributions.difference, difference_type: 'none', irs_code: '' },
      { line_number: 8, item_description: 'Meals and entertainment', book_amount: scheduleM1.mealsAndEntertainment.book, tax_amount: scheduleM1.mealsAndEntertainment.tax, difference: scheduleM1.mealsAndEntertainment.difference, difference_type: 'permanent', irs_code: '§274' },
      { line_number: 9, item_description: 'Other deductions', book_amount: scheduleM1.otherDeductions.book, tax_amount: scheduleM1.otherDeductions.tax, difference: scheduleM1.otherDeductions.difference, difference_type: 'none', irs_code: '' },
      { line_number: 10, item_description: 'Total additions', book_amount: scheduleM1.totalAdditions, tax_amount: scheduleM1.totalAdditions, difference: 0, difference_type: 'none', irs_code: '' },
      { line_number: 11, item_description: 'Total subtractions', book_amount: scheduleM1.totalSubtractions, tax_amount: scheduleM1.totalSubtractions, difference: 0, difference_type: 'none', irs_code: '' },
      { line_number: 12, item_description: 'Net income', book_amount: scheduleM1.netIncome, tax_amount: scheduleM1.netIncome, difference: 0, difference_type: 'none', irs_code: '' }
    ]

    const { error } = await this.supabase
      .from('schedule_m1_data')
      .insert(m1Data.map(item => ({
        company_tax_profile_id: profileId,
        ...item
      })))

    if (error) throw error
  }

  private async saveScheduleM2Data(profileId: string): Promise<void> {
    const { scheduleM2 } = this.formData!
    
    const { error } = await this.supabase
      .from('schedule_m2_data')
      .insert({
        company_tax_profile_id: profileId,
        beginning_retained_earnings: scheduleM2.beginningRetainedEarnings,
        net_income: scheduleM2.netIncome,
        distributions: scheduleM2.distributions,
        other_adjustments: scheduleM2.otherAdjustments,
        ending_retained_earnings: scheduleM2.endingRetainedEarnings
      })

    if (error) throw error
  }

  private async saveFinancialRatios(profileId: string): Promise<void> {
    const { financialRatios } = this.formData!
    
    const { error } = await this.supabase
      .from('tax_financial_ratios')
      .insert({
        company_tax_profile_id: profileId,
        dso: financialRatios.dso,
        dpo: financialRatios.dpo,
        dio: financialRatios.dio,
        current_ratio: financialRatios.currentRatio,
        debt_to_equity: financialRatios.debtToEquity,
        gross_margin: financialRatios.grossMargin,
        operating_margin: financialRatios.operatingMargin,
        net_margin: financialRatios.netMargin,
        cash_conversion_cycle: financialRatios.cashConversionCycle
      })

    if (error) throw error
  }

  private async saveOptimizationOpportunities(profileId: string): Promise<void> {
    const { optimizationOpportunities } = this.formData!
    
    const { error } = await this.supabase
      .from('tax_optimization_actions')
      .insert(optimizationOpportunities.map(opp => ({
        company_tax_profile_id: profileId,
        focus_area: opp.category,
        finding_description: opp.description,
        recommended_action: opp.title,
        assigned_to: opp.assignedTo,
        due_date: opp.dueDate,
        estimated_benefit: opp.potentialSavings,
        confidence_score: opp.confidence,
        status: opp.status,
        irs_reference: opp.irsReference,
        source_line: opp.sourceLine
      })))

    if (error) throw error
  }
}

// Export singleton instance
export const form1120AdvisorEngine = new Form1120AdvisorEngine()
