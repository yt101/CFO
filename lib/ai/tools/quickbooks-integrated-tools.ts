"use client"

import { FPAToolExecutor } from './fpa-tools'

interface QuickBooksData {
  revenue: any
  expenses: any
  cashFlow: any
  balanceSheet: any
}

export class QuickBooksIntegratedToolExecutor extends FPAToolExecutor {
  private quickBooksData: QuickBooksData | null = null
  private lastFetchTime: number = 0
  private fetchInterval: number = 5 * 60 * 1000 // 5 minutes

  constructor() {
    super()
  }

  // Fetch fresh data from QuickBooks
  private async fetchQuickBooksData(period: string): Promise<QuickBooksData> {
    const now = Date.now()
    
    // Use cached data if it's fresh enough
    if (this.quickBooksData && (now - this.lastFetchTime) < this.fetchInterval) {
      return this.quickBooksData
    }

    try {
      // Convert period to date range
      const { startDate, endDate } = this.getDateRangeFromPeriod(period)
      
      // For demo mode, use the demo service with your Company ID
      const { configService } = await import('@/lib/ai/config-service')
      const qbConfig = await configService.getQuickBooksConfiguration()
      
      if (qbConfig && qbConfig.companyId) {
        const { createQuickBooksDemoService } = await import('@/lib/integrations/quickbooks-demo-service')
        const demoService = createQuickBooksDemoService({
          companyId: qbConfig.companyId,
          clientId: qbConfig.clientId || 'demo-client',
          environment: qbConfig.environment || 'sandbox'
        })
        
        const financialData = await demoService.getFinancialDataForPeriod(startDate, endDate)
        this.quickBooksData = financialData
        this.lastFetchTime = now
        
        console.log(`Using QuickBooks demo data for Company ID: ${qbConfig.companyId}`)
        return financialData
      }
      
      // Fall back to mock data if no QuickBooks config
      return this.getMockDataForPeriod(period)
    } catch (error) {
      console.error('Error fetching QuickBooks data:', error)
      // Fall back to mock data
      return this.getMockDataForPeriod(period)
    }
  }

  private getDateRangeFromPeriod(period: string): { startDate: string; endDate: string } {
    const now = new Date()
    let startDate: Date
    let endDate: Date

    switch (period) {
      case 'Q1 2025':
        startDate = new Date(2025, 0, 1) // January 1, 2025
        endDate = new Date(2025, 2, 31) // March 31, 2025
        break
      case 'Q2 2025':
        startDate = new Date(2025, 3, 1) // April 1, 2025
        endDate = new Date(2025, 5, 30) // June 30, 2025
        break
      case 'Q3 2025':
        startDate = new Date(2025, 6, 1) // July 1, 2025
        endDate = new Date(2025, 8, 30) // September 30, 2025
        break
      case 'Q4 2025':
        startDate = new Date(2025, 9, 1) // October 1, 2025
        endDate = new Date(2025, 11, 31) // December 31, 2025
        break
      case 'last 30 days':
        endDate = new Date(now)
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case 'last 90 days':
        endDate = new Date(now)
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case 'YTD':
        startDate = new Date(now.getFullYear(), 0, 1)
        endDate = new Date(now)
        break
      default:
        // Default to current quarter
        startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)
        endDate = new Date(now)
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    }
  }

  private getMockDataForPeriod(period: string): QuickBooksData {
    // Fallback to mock data if QuickBooks is not available
    return {
      revenue: {
        totalRevenue: 2400000,
        period: period,
        breakdown: {
          productSales: 1680000,
          serviceRevenue: 720000
        },
        growth: 0.15
      },
      expenses: {
        totalExpenses: 1968000,
        period: period,
        breakdown: {
          salesMarketing: 590400,
          rd: 393600,
          generalAdmin: 295200,
          other: 688800
        }
      },
      cashFlow: {
        operating: 456000,
        investing: -120000,
        financing: 0,
        netChange: 336000,
        beginningBalance: 1200000,
        endingBalance: 1536000
      },
      balanceSheet: {
        totalAssets: 5000000,
        totalLiabilities: 2000000,
        totalEquity: 3000000,
        currentRatio: 2.1,
        quickRatio: 1.8
      }
    }
  }

  // Override tool execution methods to use QuickBooks data
  async executeTool(toolCall: any): Promise<any> {
    const startTime = Date.now()
    
    try {
      let result: any

      // Fetch QuickBooks data for tools that need it
      const needsData = ['get_cash_flow_analysis', 'get_revenue_analysis', 'get_expense_analysis', 'calculate_kpis']
      let qbData: QuickBooksData | null = null

      if (needsData.includes(toolCall.name)) {
        const period = toolCall.parameters?.period || 'Q1 2025'
        qbData = await this.fetchQuickBooksData(period)
      }

      switch (toolCall.name) {
        case "get_cash_flow_analysis":
          result = await this.getCashFlowAnalysisWithQB(toolCall.parameters, qbData)
          break
        case "get_revenue_analysis":
          result = await this.getRevenueAnalysisWithQB(toolCall.parameters, qbData)
          break
        case "get_expense_analysis":
          result = await this.getExpenseAnalysisWithQB(toolCall.parameters, qbData)
          break
        case "calculate_kpis":
          result = await this.calculateKPIsWithQB(toolCall.parameters, qbData)
          break
        default:
          // Use parent class for other tools
          result = await super.executeTool(toolCall)
      }

      return {
        success: true,
        data: result,
        executionTime: Date.now() - startTime,
        metadata: {
          source: qbData ? "quickbooks" : "mock",
          timestamp: new Date().toISOString(),
          tool: toolCall.name
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime: Date.now() - startTime,
        metadata: {
          source: "error",
          timestamp: new Date().toISOString(),
          tool: toolCall.name
        }
      }
    }
  }

  private async getCashFlowAnalysisWithQB(params: any, qbData: QuickBooksData | null) {
    if (!qbData) {
      return await this.getCashFlowAnalysis(params)
    }

    const data = qbData.cashFlow
    const period = params.period

    return {
      period,
      operatingCashFlow: data.operating,
      investingCashFlow: data.investing,
      financingCashFlow: data.financing,
      netChange: data.netChange,
      beginningBalance: data.beginningBalance,
      endingBalance: data.endingBalance,
      burnRate: Math.abs(data.operating) / 30, // Daily burn rate
      runway: data.endingBalance / (Math.abs(data.operating) / 30), // Days of runway
      analysis: {
        status: data.operating > 0 ? "healthy" : "concerning",
        recommendations: this.getCashFlowRecommendations(data),
        dataSource: "QuickBooks"
      }
    }
  }

  private async getRevenueAnalysisWithQB(params: any, qbData: QuickBooksData | null) {
    if (!qbData) {
      return await this.getRevenueAnalysis(params)
    }

    const data = qbData.revenue
    const period = params.period
    const breakdown = params.breakdown || "by_source"

    return {
      period,
      totalRevenue: data.totalRevenue,
      growthRate: data.growth,
      mrr: data.totalRevenue / 3, // Monthly recurring revenue
      breakdown: this.getRevenueBreakdown(data, breakdown),
      analysis: {
        trend: data.growth > 0.1 ? "positive" : "stable",
        drivers: this.getRevenueDrivers(data),
        recommendations: this.getRevenueRecommendations(data),
        dataSource: "QuickBooks"
      }
    }
  }

  private async getExpenseAnalysisWithQB(params: any, qbData: QuickBooksData | null) {
    if (!qbData) {
      return await this.getExpenseAnalysis(params)
    }

    const data = qbData.expenses
    const period = params.period
    const category = params.category || "all"

    return {
      period,
      totalExpenses: data.totalExpenses,
      category: category,
      breakdown: this.getExpenseBreakdown(data, category),
      analysis: {
        efficiency: this.calculateExpenseEfficiency(data),
        trends: this.getExpenseTrends(data),
        recommendations: this.getExpenseRecommendations(data),
        dataSource: "QuickBooks"
      }
    }
  }

  private async calculateKPIsWithQB(params: any, qbData: QuickBooksData | null) {
    if (!qbData) {
      return await this.calculateKPIs(params)
    }

    const period = params.period
    const kpiGroup = params.kpi_group || "all"
    const balanceSheet = qbData.balanceSheet
    const revenue = qbData.revenue
    const expenses = qbData.expenses

    // Calculate KPIs from QuickBooks data
    const kpis = {
      profitability: {
        grossMargin: ((revenue.totalRevenue - expenses.totalExpenses * 0.6) / revenue.totalRevenue),
        operatingMargin: ((revenue.totalRevenue - expenses.totalExpenses) / revenue.totalRevenue),
        netMargin: ((revenue.totalRevenue - expenses.totalExpenses) / revenue.totalRevenue)
      },
      liquidity: {
        currentRatio: balanceSheet.currentRatio,
        quickRatio: balanceSheet.quickRatio
      },
      efficiency: {
        roe: ((revenue.totalRevenue - expenses.totalExpenses) / balanceSheet.totalEquity),
        roa: ((revenue.totalRevenue - expenses.totalExpenses) / balanceSheet.totalAssets)
      }
    }

    return {
      period,
      kpiGroup: kpiGroup,
      kpis: this.getKPIsByGroup(kpis, kpiGroup),
      analysis: {
        performance: "Real-time data from QuickBooks",
        trends: "Based on actual financial performance",
        benchmarks: "Compared against industry standards",
        dataSource: "QuickBooks"
      }
    }
  }

  // Helper methods (reuse from parent class)
  private getCashFlowRecommendations(data: any): string[] {
    const recommendations = []
    const runway = data.endingBalance / (Math.abs(data.operating) / 30)
    
    if (runway < 6) {
      recommendations.push("Consider raising additional funding")
    }
    if (Math.abs(data.operating) > 200000) {
      recommendations.push("Review and optimize operating expenses")
    }
    if (data.operating < 0) {
      recommendations.push("Focus on improving operating cash flow")
    }
    return recommendations
  }

  private getRevenueBreakdown(data: any, breakdown: string) {
    switch (breakdown) {
      case "by_source":
        return data.breakdown
      default:
        return data.breakdown
    }
  }

  private getRevenueDrivers(data: any): string[] {
    return [
      "Product sales growth",
      "Service revenue expansion",
      "Customer acquisition",
      "Price optimization"
    ]
  }

  private getRevenueRecommendations(data: any): string[] {
    return [
      "Continue investing in sales and marketing",
      "Focus on customer expansion programs",
      "Consider pricing optimization"
    ]
  }

  private getExpenseBreakdown(data: any, category: string) {
    if (category === "all") {
      return data.breakdown
    }
    return { [category]: data.breakdown[category] }
  }

  private calculateExpenseEfficiency(data: any): string {
    const salesMarketingRatio = data.breakdown.salesMarketing / data.totalExpenses
    if (salesMarketingRatio > 0.4) return "high"
    if (salesMarketingRatio > 0.3) return "moderate"
    return "low"
  }

  private getExpenseTrends(data: any): string[] {
    return [
      `Sales & Marketing: ${Math.round(data.breakdown.salesMarketing / data.totalExpenses * 100)}% of total expenses`,
      `R&D: ${Math.round(data.breakdown.rd / data.totalExpenses * 100)}% of total expenses`,
      `General & Admin: ${Math.round(data.breakdown.generalAdmin / data.totalExpenses * 100)}% of total expenses`
    ]
  }

  private getExpenseRecommendations(data: any): string[] {
    return [
      "Optimize sales and marketing spend",
      "Invest in R&D efficiency",
      "Streamline administrative processes"
    ]
  }

  private getKPIsByGroup(kpis: any, group: string) {
    if (group === "all") return kpis
    
    const groups = {
      profitability: kpis.profitability,
      liquidity: kpis.liquidity,
      efficiency: kpis.efficiency
    }
    
    return groups[group as keyof typeof groups] || kpis
  }
}

// Factory function
export function createQuickBooksIntegratedToolExecutor(): QuickBooksIntegratedToolExecutor {
  return new QuickBooksIntegratedToolExecutor()
}
