"use client"

export interface ToolDefinition {
  name: string
  description: string
  parameters: {
    type: "object"
    properties: { [key: string]: any }
    required: string[]
  }
  category: 'cash_flow' | 'revenue' | 'expenses' | 'reporting' | 'analysis' | 'forecasting'
}

export interface ToolCall {
  name: string
  parameters: { [key: string]: any }
  id: string
}

export interface ToolResult {
  success: boolean
  data?: any
  error?: string
  executionTime?: number
  metadata?: {
    source?: string
    timestamp?: string
    [key: string]: any
  }
}

// FP&A Tool Definitions
export const FPA_TOOLS: ToolDefinition[] = [
  {
    name: "get_cash_flow_analysis",
    description: "Analyze current cash flow position, runway, and burn rate",
    parameters: {
      type: "object",
      properties: {
        period: {
          type: "string",
          description: "Time period for analysis (e.g., 'Q1 2025', 'last 30 days')",
          enum: ["Q1 2025", "Q2 2025", "Q3 2025", "Q4 2025", "last 30 days", "last 90 days", "YTD"]
        },
        include_forecast: {
          type: "boolean",
          description: "Include cash flow forecast",
          default: true
        }
      },
      required: ["period"]
    },
    category: "cash_flow"
  },
  {
    name: "get_revenue_analysis",
    description: "Analyze revenue performance, trends, and drivers",
    parameters: {
      type: "object",
      properties: {
        period: {
          type: "string",
          description: "Time period for analysis",
          enum: ["Q1 2025", "Q2 2025", "Q3 2025", "Q4 2025", "last 30 days", "last 90 days", "YTD"]
        },
        breakdown: {
          type: "string",
          description: "Revenue breakdown type",
          enum: ["by_source", "by_customer", "by_product", "by_region"],
          default: "by_source"
        }
      },
      required: ["period"]
    },
    category: "revenue"
  },
  {
    name: "get_expense_analysis",
    description: "Analyze expense trends, categories, and optimization opportunities",
    parameters: {
      type: "object",
      properties: {
        period: {
          type: "string",
          description: "Time period for analysis",
          enum: ["Q1 2025", "Q2 2025", "Q3 2025", "Q4 2025", "last 30 days", "last 90 days", "YTD"]
        },
        category: {
          type: "string",
          description: "Expense category to focus on",
          enum: ["all", "operating", "sales_marketing", "rd", "general_admin"],
          default: "all"
        }
      },
      required: ["period"]
    },
    category: "expenses"
  },
  {
    name: "generate_financial_report",
    description: "Generate comprehensive financial reports",
    parameters: {
      type: "object",
      properties: {
        report_type: {
          type: "string",
          description: "Type of financial report",
          enum: ["p_l", "balance_sheet", "cash_flow", "kpi_dashboard", "board_pack", "monthly_summary"]
        },
        period: {
          type: "string",
          description: "Reporting period",
          enum: ["Q1 2025", "Q2 2025", "Q3 2025", "Q4 2025", "last 30 days", "last 90 days", "YTD"]
        },
        format: {
          type: "string",
          description: "Output format",
          enum: ["summary", "detailed", "executive"],
          default: "executive"
        }
      },
      required: ["report_type", "period"]
    },
    category: "reporting"
  },
  {
    name: "perform_variance_analysis",
    description: "Compare actual vs budget/forecast performance",
    parameters: {
      type: "object",
      properties: {
        period: {
          type: "string",
          description: "Analysis period",
          enum: ["Q1 2025", "Q2 2025", "Q3 2025", "Q4 2025", "last 30 days", "last 90 days", "YTD"]
        },
        metric: {
          type: "string",
          description: "Metric to analyze",
          enum: ["revenue", "expenses", "cash_flow", "all"],
          default: "all"
        },
        threshold: {
          type: "number",
          description: "Variance threshold percentage",
          default: 5
        }
      },
      required: ["period"]
    },
    category: "analysis"
  },
  {
    name: "create_forecast",
    description: "Generate financial forecasts and projections",
    parameters: {
      type: "object",
      properties: {
        forecast_type: {
          type: "string",
          description: "Type of forecast",
          enum: ["revenue", "cash_flow", "expenses", "comprehensive"]
        },
        horizon: {
          type: "string",
          description: "Forecast horizon",
          enum: ["3_months", "6_months", "12_months", "24_months"],
          default: "12_months"
        },
        scenario: {
          type: "string",
          description: "Forecast scenario",
          enum: ["conservative", "realistic", "optimistic"],
          default: "realistic"
        }
      },
      required: ["forecast_type", "horizon"]
    },
    category: "forecasting"
  },
  {
    name: "calculate_kpis",
    description: "Calculate key financial performance indicators",
    parameters: {
      type: "object",
      properties: {
        period: {
          type: "string",
          description: "Calculation period",
          enum: ["Q1 2025", "Q2 2025", "Q3 2025", "Q4 2025", "last 30 days", "last 90 days", "YTD"]
        },
        kpi_group: {
          type: "string",
          description: "KPI group to calculate",
          enum: ["profitability", "liquidity", "efficiency", "growth", "all"],
          default: "all"
        }
      },
      required: ["period"]
    },
    category: "analysis"
  },
  {
    name: "analyze_customer_metrics",
    description: "Analyze customer acquisition, retention, and lifetime value",
    parameters: {
      type: "object",
      properties: {
        period: {
          type: "string",
          description: "Analysis period",
          enum: ["Q1 2025", "Q2 2025", "Q3 2025", "Q4 2025", "last 30 days", "last 90 days", "YTD"]
        },
        metric: {
          type: "string",
          description: "Customer metric to analyze",
          enum: ["cac", "ltv", "churn", "retention", "all"],
          default: "all"
        }
      },
      required: ["period"]
    },
    category: "analysis"
  }
]

// Tool execution functions
export class FPAToolExecutor {
  private mockData: any

  constructor() {
    this.mockData = this.initializeMockData()
  }

  private initializeMockData() {
    return {
      cashFlow: {
        "Q1 2025": {
          operating: 456000,
          investing: -120000,
          financing: 0,
          netChange: 336000,
          beginningBalance: 1200000,
          endingBalance: 1536000,
          burnRate: 150000,
          runway: 10.2
        }
      },
      revenue: {
        "Q1 2025": {
          total: 2400000,
          newCustomers: 1200000,
          expansion: 720000,
          renewal: 480000,
          growthRate: 0.15,
          mrr: 800000
        }
      },
      expenses: {
        "Q1 2025": {
          total: 1968000,
          salesMarketing: 720000,
          rd: 480000,
          generalAdmin: 360000,
          customerSuccess: 240000,
          other: 168000
        }
      },
      kpis: {
        "Q1 2025": {
          grossMargin: 0.68,
          operatingMargin: 0.18,
          netMargin: 0.15,
          currentRatio: 2.1,
          quickRatio: 1.8,
          roe: 0.12,
          roa: 0.08
        }
      },
      customers: {
        "Q1 2025": {
          cac: 180,
          ltv: 2400,
          churnRate: 0.032,
          retentionRate: 0.968,
          totalCustomers: 1250,
          newCustomers: 125
        }
      }
    }
  }

  async executeTool(toolCall: ToolCall): Promise<ToolResult> {
    const startTime = Date.now()
    
    try {
      let result: any

      switch (toolCall.name) {
        case "get_cash_flow_analysis":
          result = await this.getCashFlowAnalysis(toolCall.parameters)
          break
        case "get_revenue_analysis":
          result = await this.getRevenueAnalysis(toolCall.parameters)
          break
        case "get_expense_analysis":
          result = await this.getExpenseAnalysis(toolCall.parameters)
          break
        case "generate_financial_report":
          result = await this.generateFinancialReport(toolCall.parameters)
          break
        case "perform_variance_analysis":
          result = await this.performVarianceAnalysis(toolCall.parameters)
          break
        case "create_forecast":
          result = await this.createForecast(toolCall.parameters)
          break
        case "calculate_kpis":
          result = await this.calculateKPIs(toolCall.parameters)
          break
        case "analyze_customer_metrics":
          result = await this.analyzeCustomerMetrics(toolCall.parameters)
          break
        default:
          throw new Error(`Unknown tool: ${toolCall.name}`)
      }

      return {
        success: true,
        data: result,
        executionTime: Date.now() - startTime,
        metadata: {
          source: "fpa_tools",
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
          source: "fpa_tools",
          timestamp: new Date().toISOString(),
          tool: toolCall.name
        }
      }
    }
  }

  private async getCashFlowAnalysis(params: any) {
    const period = params.period
    const data = this.mockData.cashFlow[period] || this.mockData.cashFlow["Q1 2025"]
    
    return {
      period,
      operatingCashFlow: data.operating,
      investingCashFlow: data.investing,
      financingCashFlow: data.financing,
      netChange: data.netChange,
      beginningBalance: data.beginningBalance,
      endingBalance: data.endingBalance,
      burnRate: data.burnRate,
      runway: data.runway,
      analysis: {
        status: data.runway > 12 ? "healthy" : data.runway > 6 ? "monitor" : "critical",
        recommendations: this.getCashFlowRecommendations(data)
      }
    }
  }

  private async getRevenueAnalysis(params: any) {
    const period = params.period
    const breakdown = params.breakdown || "by_source"
    const data = this.mockData.revenue[period] || this.mockData.revenue["Q1 2025"]
    
    return {
      period,
      totalRevenue: data.total,
      growthRate: data.growthRate,
      mrr: data.mrr,
      breakdown: this.getRevenueBreakdown(data, breakdown),
      analysis: {
        trend: data.growthRate > 0.1 ? "positive" : "stable",
        drivers: this.getRevenueDrivers(data),
        recommendations: this.getRevenueRecommendations(data)
      }
    }
  }

  private async getExpenseAnalysis(params: any) {
    const period = params.period
    const category = params.category || "all"
    const data = this.mockData.expenses[period] || this.mockData.expenses["Q1 2025"]
    
    return {
      period,
      totalExpenses: data.total,
      category: category,
      breakdown: this.getExpenseBreakdown(data, category),
      analysis: {
        efficiency: this.calculateExpenseEfficiency(data),
        trends: this.getExpenseTrends(data),
        recommendations: this.getExpenseRecommendations(data)
      }
    }
  }

  private async generateFinancialReport(params: any) {
    const { report_type, period, format } = params
    
    // This would generate different types of reports
    return {
      reportType: report_type,
      period,
      format,
      generatedAt: new Date().toISOString(),
      content: `Generated ${report_type} report for ${period} in ${format} format`,
      sections: this.getReportSections(report_type, period)
    }
  }

  private async performVarianceAnalysis(params: any) {
    const { period, metric, threshold } = params
    
    return {
      period,
      metric,
      threshold,
      variances: this.calculateVariances(period, metric, threshold),
      analysis: this.getVarianceAnalysis(period, metric, threshold)
    }
  }

  private async createForecast(params: any) {
    const { forecast_type, horizon, scenario } = params
    
    return {
      forecastType: forecast_type,
      horizon,
      scenario,
      projections: this.generateProjections(forecast_type, horizon, scenario),
      assumptions: this.getForecastAssumptions(forecast_type, scenario),
      confidence: this.calculateForecastConfidence(scenario)
    }
  }

  private async calculateKPIs(params: any) {
    const { period, kpi_group } = params
    const data = this.mockData.kpis[period] || this.mockData.kpis["Q1 2025"]
    
    return {
      period,
      kpiGroup: kpi_group,
      kpis: this.getKPIsByGroup(data, kpi_group),
      analysis: this.getKPIAnalysis(data, kpi_group)
    }
  }

  private async analyzeCustomerMetrics(params: any) {
    const { period, metric } = params
    const data = this.mockData.customers[period] || this.mockData.customers["Q1 2025"]
    
    return {
      period,
      metric,
      metrics: this.getCustomerMetrics(data, metric),
      analysis: this.getCustomerAnalysis(data, metric)
    }
  }

  // Helper methods for data processing
  private getCashFlowRecommendations(data: any): string[] {
    const recommendations = []
    if (data.runway < 6) {
      recommendations.push("Consider raising additional funding")
    }
    if (data.burnRate > 200000) {
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
        return {
          newCustomers: data.newCustomers,
          expansion: data.expansion,
          renewal: data.renewal
        }
      default:
        return data
    }
  }

  private getRevenueDrivers(data: any): string[] {
    return [
      "New customer acquisition (+20%)",
      "Expansion revenue (+12%)",
      "Price optimization (+5%)"
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
      return {
        salesMarketing: data.salesMarketing,
        rd: data.rd,
        generalAdmin: data.generalAdmin,
        customerSuccess: data.customerSuccess,
        other: data.other
      }
    }
    return { [category]: data[category] }
  }

  private calculateExpenseEfficiency(data: any): string {
    const salesMarketingRatio = data.salesMarketing / data.total
    if (salesMarketingRatio > 0.4) return "high"
    if (salesMarketingRatio > 0.3) return "moderate"
    return "low"
  }

  private getExpenseTrends(data: any): string[] {
    return [
      "Sales & Marketing: 30% of total expenses",
      "R&D: 20% of total expenses",
      "General & Admin: 15% of total expenses"
    ]
  }

  private getExpenseRecommendations(data: any): string[] {
    return [
      "Optimize sales and marketing spend",
      "Invest in R&D efficiency",
      "Streamline administrative processes"
    ]
  }

  private getReportSections(reportType: string, period: string): string[] {
    const baseSections = ["Executive Summary", "Financial Highlights", "Key Metrics"]
    
    switch (reportType) {
      case "p_l":
        return [...baseSections, "Revenue Analysis", "Expense Breakdown", "Profitability"]
      case "balance_sheet":
        return [...baseSections, "Assets", "Liabilities", "Equity"]
      case "cash_flow":
        return [...baseSections, "Operating Cash Flow", "Investing Activities", "Financing Activities"]
      case "board_pack":
        return [...baseSections, "Strategic Initiatives", "Risk Assessment", "Forward Outlook"]
      default:
        return baseSections
    }
  }

  private calculateVariances(period: string, metric: string, threshold: number) {
    // Mock variance calculations
    return {
      revenue: { actual: 2400000, budget: 2200000, variance: 9.1, status: "favorable" },
      expenses: { actual: 1968000, budget: 2000000, variance: -1.6, status: "favorable" },
      cashFlow: { actual: 456000, budget: 400000, variance: 14.0, status: "favorable" }
    }
  }

  private getVarianceAnalysis(period: string, metric: string, threshold: number) {
    return {
      summary: "Overall performance exceeds budget expectations",
      keyInsights: [
        "Revenue 9.1% above budget",
        "Expenses 1.6% below budget",
        "Strong cash flow performance"
      ],
      recommendations: [
        "Maintain current growth trajectory",
        "Continue cost optimization efforts",
        "Consider strategic investments"
      ]
    }
  }

  private generateProjections(forecastType: string, horizon: string, scenario: string) {
    const multipliers = {
      conservative: 0.8,
      realistic: 1.0,
      optimistic: 1.2
    }
    
    const multiplier = multipliers[scenario as keyof typeof multipliers] || 1.0
    
    return {
      monthly: Array.from({ length: 12 }, (_, i) => ({
        month: `Month ${i + 1}`,
        value: 2000000 * multiplier * (1 + i * 0.05)
      })),
      quarterly: Array.from({ length: 4 }, (_, i) => ({
        quarter: `Q${i + 1}`,
        value: 6000000 * multiplier * (1 + i * 0.15)
      }))
    }
  }

  private getForecastAssumptions(forecastType: string, scenario: string) {
    return [
      "Current growth trends continue",
      "Market conditions remain stable",
      "No major economic disruptions",
      "Customer acquisition costs remain consistent"
    ]
  }

  private calculateForecastConfidence(scenario: string) {
    const confidence = {
      conservative: 0.85,
      realistic: 0.75,
      optimistic: 0.65
    }
    return confidence[scenario as keyof typeof confidence] || 0.75
  }

  private getKPIsByGroup(data: any, group: string) {
    if (group === "all") return data
    
    const groups = {
      profitability: { grossMargin: data.grossMargin, operatingMargin: data.operatingMargin, netMargin: data.netMargin },
      liquidity: { currentRatio: data.currentRatio, quickRatio: data.quickRatio },
      efficiency: { roe: data.roe, roa: data.roa }
    }
    
    return groups[group as keyof typeof groups] || data
  }

  private getKPIAnalysis(data: any, group: string) {
    return {
      performance: "Strong financial performance across key metrics",
      trends: "Positive trends in profitability and efficiency",
      benchmarks: "Above industry averages in most categories"
    }
  }

  private getCustomerMetrics(data: any, metric: string) {
    if (metric === "all") return data
    
    return { [metric]: data[metric] }
  }

  private getCustomerAnalysis(data: any, metric: string) {
    return {
      performance: "Healthy customer metrics with room for improvement",
      trends: "Stable customer acquisition and retention",
      recommendations: [
        "Optimize customer acquisition cost",
        "Improve customer lifetime value",
        "Reduce churn rate"
      ]
    }
  }
}

// Factory function
export function createFPAToolExecutor(): FPAToolExecutor {
  return new FPAToolExecutor()
}












