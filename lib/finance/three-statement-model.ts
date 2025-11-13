// 3-Statement Financial Model Generator
export interface IncomeStatement {
  period: {
    start: Date
    end: Date
  }
  revenue: {
    grossRevenue: number
    returns: number
    netRevenue: number
  }
  costOfGoodsSold: {
    materials: number
    labor: number
    overhead: number
    total: number
  }
  grossProfit: number
  operatingExpenses: {
    sales: number
    marketing: number
    general: number
    administrative: number
    total: number
  }
  operatingIncome: number
  otherIncome: number
  ebitda: number
  depreciation: number
  interestExpense: number
  ebit: number
  taxes: number
  netIncome: number
}

export interface BalanceSheet {
  period: Date
  assets: {
    currentAssets: {
      cash: number
      accountsReceivable: number
      inventory: number
      prepaidExpenses: number
      other: number
      total: number
    }
    fixedAssets: {
      property: number
      equipment: number
      accumulatedDepreciation: number
      netFixedAssets: number
    }
    otherAssets: {
      intangibleAssets: number
      goodwill: number
      other: number
      total: number
    }
    totalAssets: number
  }
  liabilities: {
    currentLiabilities: {
      accountsPayable: number
      accruedExpenses: number
      shortTermDebt: number
      other: number
      total: number
    }
    longTermLiabilities: {
      longTermDebt: number
      deferredTaxes: number
      other: number
      total: number
    }
    totalLiabilities: number
  }
  equity: {
    commonStock: number
    retainedEarnings: number
    additionalPaidInCapital: number
    total: number
  }
  totalLiabilitiesAndEquity: number
}

export interface CashFlowStatement {
  period: {
    start: Date
    end: Date
  }
  operatingActivities: {
    netIncome: number
    depreciation: number
    changesInWorkingCapital: {
      accountsReceivable: number
      inventory: number
      accountsPayable: number
      other: number
      total: number
    }
    otherOperating: number
    netOperatingCashFlow: number
  }
  investingActivities: {
    capitalExpenditures: number
    assetPurchases: number
    assetSales: number
    other: number
    netInvestingCashFlow: number
  }
  financingActivities: {
    debtIssuance: number
    debtRepayment: number
    equityIssuance: number
    dividends: number
    other: number
    netFinancingCashFlow: number
  }
  netCashFlow: number
  beginningCash: number
  endingCash: number
}

export interface FinancialModel {
  incomeStatement: IncomeStatement
  balanceSheet: BalanceSheet
  cashFlowStatement: CashFlowStatement
  assumptions: ModelAssumptions
  metadata: {
    created: Date
    version: string
    confidence: number
  }
}

export interface ModelAssumptions {
  revenue: {
    growthRate: number
    seasonality: number[]
    customerRetention: number
  }
  costs: {
    cogsAsPercentOfRevenue: number
    operatingExpenseGrowth: number
    depreciationRate: number
  }
  workingCapital: {
    dso: number
    dpo: number
    dio: number
  }
  capital: {
    capexAsPercentOfRevenue: number
    debtToEquityRatio: number
    dividendPayoutRatio: number
  }
}

export class ThreeStatementModel {
  private assumptions: ModelAssumptions

  constructor(assumptions?: Partial<ModelAssumptions>) {
    this.assumptions = {
      revenue: {
        growthRate: 0.15,
        seasonality: [0.8, 0.9, 1.1, 1.2, 1.0, 0.9, 0.8, 0.9, 1.0, 1.1, 1.2, 1.0],
        customerRetention: 0.85
      },
      costs: {
        cogsAsPercentOfRevenue: 0.6,
        operatingExpenseGrowth: 0.1,
        depreciationRate: 0.1
      },
      workingCapital: {
        dso: 30,
        dpo: 45,
        dio: 60
      },
      capital: {
        capexAsPercentOfRevenue: 0.05,
        debtToEquityRatio: 0.3,
        dividendPayoutRatio: 0.2
      }
    }

    if (assumptions) {
      this.assumptions = { ...this.assumptions, ...assumptions }
    }
  }

  generateModel(
    historicalData: any,
    periods: number = 12
  ): FinancialModel {
    const startDate = new Date()
    const incomeStatement = this.generateIncomeStatement(historicalData, startDate, periods)
    const balanceSheet = this.generateBalanceSheet(historicalData, startDate, periods)
    const cashFlowStatement = this.generateCashFlowStatement(historicalData, startDate, periods)

    return {
      incomeStatement,
      balanceSheet,
      cashFlowStatement,
      assumptions: this.assumptions,
      metadata: {
        created: new Date(),
        version: '1.0.0',
        confidence: this.calculateConfidence(historicalData)
      }
    }
  }

  private generateIncomeStatement(
    historicalData: any,
    startDate: Date,
    periods: number
  ): IncomeStatement {
    const baseRevenue = historicalData?.revenue || 1000000
    const monthlyGrowth = this.assumptions.revenue.growthRate / 12

    // Calculate monthly revenue with seasonality
    const monthlyRevenue = Array.from({ length: periods }, (_, i) => {
      const month = (startDate.getMonth() + i) % 12
      const growthFactor = Math.pow(1 + monthlyGrowth, i)
      const seasonalityFactor = this.assumptions.revenue.seasonality[month]
      return baseRevenue * growthFactor * seasonalityFactor / 12
    })

    const totalRevenue = monthlyRevenue.reduce((sum, rev) => sum + rev, 0)
    const cogs = totalRevenue * this.assumptions.costs.cogsAsPercentOfRevenue
    const grossProfit = totalRevenue - cogs

    const operatingExpenses = totalRevenue * 0.2 // 20% of revenue
    const operatingIncome = grossProfit - operatingExpenses

    const depreciation = totalRevenue * this.assumptions.costs.depreciationRate
    const ebitda = operatingIncome + depreciation

    const interestExpense = totalRevenue * 0.02 // 2% of revenue
    const ebit = operatingIncome - interestExpense

    const taxes = ebit * 0.25 // 25% tax rate
    const netIncome = ebit - taxes

    return {
      period: {
        start: startDate,
        end: new Date(startDate.getTime() + periods * 30 * 24 * 60 * 60 * 1000)
      },
      revenue: {
        grossRevenue: totalRevenue,
        returns: totalRevenue * 0.02,
        netRevenue: totalRevenue * 0.98
      },
      costOfGoodsSold: {
        materials: cogs * 0.4,
        labor: cogs * 0.35,
        overhead: cogs * 0.25,
        total: cogs
      },
      grossProfit,
      operatingExpenses: {
        sales: operatingExpenses * 0.3,
        marketing: operatingExpenses * 0.25,
        general: operatingExpenses * 0.25,
        administrative: operatingExpenses * 0.2,
        total: operatingExpenses
      },
      operatingIncome,
      otherIncome: totalRevenue * 0.01,
      ebitda,
      depreciation,
      interestExpense,
      ebit,
      taxes,
      netIncome
    }
  }

  private generateBalanceSheet(
    historicalData: any,
    startDate: Date,
    periods: number
  ): BalanceSheet {
    const baseRevenue = historicalData?.revenue || 1000000
    const totalRevenue = baseRevenue * (1 + this.assumptions.revenue.growthRate)

    // Current Assets
    const cash = totalRevenue * 0.1 // 10% of revenue
    const accountsReceivable = (totalRevenue / 12) * (this.assumptions.workingCapital.dso / 30)
    const inventory = (totalRevenue * this.assumptions.costs.cogsAsPercentOfRevenue / 12) * (this.assumptions.workingCapital.dio / 30)
    const prepaidExpenses = totalRevenue * 0.02
    const currentAssets = cash + accountsReceivable + inventory + prepaidExpenses

    // Fixed Assets
    const property = totalRevenue * 0.15
    const equipment = totalRevenue * 0.1
    const accumulatedDepreciation = equipment * 0.3
    const netFixedAssets = property + equipment - accumulatedDepreciation

    // Other Assets
    const intangibleAssets = totalRevenue * 0.05
    const goodwill = totalRevenue * 0.02
    const otherAssets = intangibleAssets + goodwill

    const totalAssets = currentAssets + netFixedAssets + otherAssets

    // Liabilities
    const accountsPayable = (totalRevenue * this.assumptions.costs.cogsAsPercentOfRevenue / 12) * (this.assumptions.workingCapital.dpo / 30)
    const accruedExpenses = totalRevenue * 0.05
    const shortTermDebt = totalRevenue * 0.1
    const currentLiabilities = accountsPayable + accruedExpenses + shortTermDebt

    const longTermDebt = totalAssets * this.assumptions.capital.debtToEquityRatio
    const totalLiabilities = currentLiabilities + longTermDebt

    // Equity
    const retainedEarnings = totalRevenue * 0.1
    const commonStock = totalAssets * 0.2
    const additionalPaidInCapital = totalAssets * 0.1
    const totalEquity = retainedEarnings + commonStock + additionalPaidInCapital

    return {
      period: startDate,
      assets: {
        currentAssets: {
          cash,
          accountsReceivable,
          inventory,
          prepaidExpenses,
          other: 0,
          total: currentAssets
        },
        fixedAssets: {
          property,
          equipment,
          accumulatedDepreciation,
          netFixedAssets
        },
        otherAssets: {
          intangibleAssets,
          goodwill,
          other: 0,
          total: otherAssets
        },
        totalAssets
      },
      liabilities: {
        currentLiabilities: {
          accountsPayable,
          accruedExpenses,
          shortTermDebt,
          other: 0,
          total: currentLiabilities
        },
        longTermLiabilities: {
          longTermDebt,
          deferredTaxes: 0,
          other: 0,
          total: longTermDebt
        },
        totalLiabilities
      },
      equity: {
        commonStock,
        retainedEarnings,
        additionalPaidInCapital,
        total: totalEquity
      },
      totalLiabilitiesAndEquity: totalLiabilities + totalEquity
    }
  }

  private generateCashFlowStatement(
    historicalData: any,
    startDate: Date,
    periods: number
  ): CashFlowStatement {
    const baseRevenue = historicalData?.revenue || 1000000
    const totalRevenue = baseRevenue * (1 + this.assumptions.revenue.growthRate)
    const netIncome = totalRevenue * 0.1 // 10% net margin
    const depreciation = totalRevenue * this.assumptions.costs.depreciationRate

    // Working capital changes
    const arChange = (totalRevenue / 12) * (this.assumptions.workingCapital.dso / 30) * 0.1
    const inventoryChange = (totalRevenue * this.assumptions.costs.cogsAsPercentOfRevenue / 12) * (this.assumptions.workingCapital.dio / 30) * 0.1
    const apChange = (totalRevenue * this.assumptions.costs.cogsAsPercentOfRevenue / 12) * (this.assumptions.workingCapital.dpo / 30) * 0.1

    const netOperatingCashFlow = netIncome + depreciation - arChange - inventoryChange + apChange

    const capex = totalRevenue * this.assumptions.capital.capexAsPercentOfRevenue
    const netInvestingCashFlow = -capex

    const debtIssuance = totalRevenue * 0.05
    const dividends = netIncome * this.assumptions.capital.dividendPayoutRatio
    const netFinancingCashFlow = debtIssuance - dividends

    const netCashFlow = netOperatingCashFlow + netInvestingCashFlow + netFinancingCashFlow
    const beginningCash = totalRevenue * 0.08
    const endingCash = beginningCash + netCashFlow

    return {
      period: {
        start: startDate,
        end: new Date(startDate.getTime() + periods * 30 * 24 * 60 * 60 * 1000)
      },
      operatingActivities: {
        netIncome,
        depreciation,
        changesInWorkingCapital: {
          accountsReceivable: -arChange,
          inventory: -inventoryChange,
          accountsPayable: apChange,
          other: 0,
          total: -arChange - inventoryChange + apChange
        },
        otherOperating: 0,
        netOperatingCashFlow
      },
      investingActivities: {
        capitalExpenditures: -capex,
        assetPurchases: 0,
        assetSales: 0,
        other: 0,
        netInvestingCashFlow
      },
      financingActivities: {
        debtIssuance,
        debtRepayment: 0,
        equityIssuance: 0,
        dividends: -dividends,
        other: 0,
        netFinancingCashFlow
      },
      netCashFlow,
      beginningCash,
      endingCash
    }
  }

  private calculateConfidence(historicalData: any): number {
    // Simple confidence calculation based on data completeness
    let confidence = 0.5 // Base confidence

    if (historicalData?.revenue) confidence += 0.2
    if (historicalData?.expenses) confidence += 0.15
    if (historicalData?.assets) confidence += 0.1
    if (historicalData?.liabilities) confidence += 0.05

    return Math.min(confidence, 1.0)
  }

  // Scenario analysis
  generateScenario(
    baseModel: FinancialModel,
    scenarioName: string,
    changes: Partial<ModelAssumptions>
  ): FinancialModel {
    const newAssumptions = { ...this.assumptions, ...changes }
    const scenarioModel = new ThreeStatementModel(newAssumptions)
    
    return scenarioModel.generateModel(
      {
        revenue: baseModel.incomeStatement.revenue.netRevenue,
        expenses: baseModel.incomeStatement.operatingExpenses.total
      },
      12
    )
  }
}

// Export singleton instance
export const threeStatementModel = new ThreeStatementModel()
































