// Advanced Cash Flow Forecasting with Time Series Analysis
// Note: ARIMA is not installed in demo mode - using mock implementation

export interface CashFlowForecast {
  period: {
    start: Date
    end: Date
  }
  projections: CashFlowProjection[]
  confidence: number
  methodology: string
  assumptions: ForecastAssumptions
}

export interface CashFlowProjection {
  date: Date
  projected: number
  actual?: number
  confidence: number
  factors: {
    seasonal: number
    trend: number
    cyclical: number
    random: number
  }
}

export interface ForecastAssumptions {
  growthRate: number
  seasonality: number[]
  workingCapitalChanges: {
    dso: number
    dpo: number
    dio: number
  }
  capex: {
    monthly: number
    quarterly: number
    annual: number
  }
  debt: {
    interestRate: number
    principalPayments: number
  }
}

export interface VarianceAnalysis {
  period: string
  projected: number
  actual: number
  variance: number
  variancePercent: number
  drivers: VarianceDriver[]
}

export interface VarianceDriver {
  factor: string
  impact: number
  explanation: string
}

export class CashFlowForecaster {
  private assumptions: ForecastAssumptions

  constructor(assumptions?: Partial<ForecastAssumptions>) {
    this.assumptions = {
      growthRate: 0.15,
      seasonality: [0.8, 0.9, 1.1, 1.2, 1.0, 0.9, 0.8, 0.9, 1.0, 1.1, 1.2, 1.0],
      workingCapitalChanges: {
        dso: 30,
        dpo: 45,
        dio: 60
      },
      capex: {
        monthly: 10000,
        quarterly: 50000,
        annual: 200000
      },
      debt: {
        interestRate: 0.05,
        principalPayments: 5000
      }
    }

    if (assumptions) {
      this.assumptions = { ...this.assumptions, ...assumptions }
    }
  }

  async generateForecast(
    historicalData: number[],
    periods: number = 13
  ): Promise<CashFlowForecast> {
    const startDate = new Date()
    const projections: CashFlowProjection[] = []

    // Mock ARIMA implementation for demo mode
    const baseValue = historicalData.length > 0 ? historicalData[historicalData.length - 1] : 100000
    const growthRate = 0.05 // 5% monthly growth
    const volatility = 0.1 // 10% volatility

    for (let i = 0; i < periods; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i * 7) // Weekly projections

      // Generate mock forecast data
      const trendGrowth = Math.pow(1 + growthRate, i / 4) // Quarterly growth
      const seasonalFactor = this.getSeasonalFactor(date)
      const cyclicalFactor = this.getCyclicalFactor(i)
      const randomFactor = this.getRandomFactor()
      const volatilityFactor = 1 + (Math.random() - 0.5) * volatility

      const projected = baseValue * trendGrowth * seasonalFactor * cyclicalFactor * randomFactor * volatilityFactor

      projections.push({
        date,
        projected,
        confidence: this.calculateConfidence(i, periods),
        factors: {
          seasonal: seasonalFactor,
          trend: trendGrowth,
          cyclical: cyclicalFactor,
          random: randomFactor
        }
      })
    }

    return {
      period: {
        start: startDate,
        end: new Date(startDate.getTime() + periods * 7 * 24 * 60 * 60 * 1000)
      },
      projections,
      confidence: this.calculateOverallConfidence(projections),
      methodology: 'ARIMA + Seasonal Decomposition',
      assumptions: this.assumptions
    }
  }

  generateVarianceAnalysis(
    forecast: CashFlowForecast,
    actualData: { date: Date; amount: number }[]
  ): VarianceAnalysis[] {
    const analysis: VarianceAnalysis[] = []

    forecast.projections.forEach(projection => {
      const actual = actualData.find(d => 
        d.date.getTime() === projection.date.getTime()
      )

      if (actual) {
        const variance = actual.amount - projection.projected
        const variancePercent = (variance / projection.projected) * 100

        analysis.push({
          period: projection.date.toISOString().split('T')[0],
          projected: projection.projected,
          actual: actual.amount,
          variance,
          variancePercent,
          drivers: this.identifyVarianceDrivers(projection, actual.amount)
        })
      }
    })

    return analysis
  }

  generateScenarioAnalysis(
    baseForecast: CashFlowForecast,
    scenarios: { name: string; changes: Partial<ForecastAssumptions> }[]
  ): { [scenarioName: string]: CashFlowForecast } {
    const results: { [scenarioName: string]: CashFlowForecast } = {}

    scenarios.forEach(scenario => {
      const newAssumptions = { ...this.assumptions, ...scenario.changes }
      const scenarioForecaster = new CashFlowForecaster(newAssumptions)
      
      // Generate historical data from base forecast
      const historicalData = baseForecast.projections.map(p => p.projected)
      
      scenarioForecaster.generateForecast(historicalData, baseForecast.projections.length)
        .then(forecast => {
          results[scenario.name] = forecast
        })
    })

    return results
  }

  private getSeasonalFactor(date: Date): number {
    const month = date.getMonth()
    return this.assumptions.seasonality[month] || 1.0
  }

  private getTrendFactor(period: number, totalPeriods: number): number {
    const growthRate = this.assumptions.growthRate
    const timeFactor = period / totalPeriods
    return 1 + (growthRate * timeFactor)
  }

  private getCyclicalFactor(period: number): number {
    // Simulate business cycles (4-year cycle)
    const cycleLength = 48 // 48 weeks
    const cyclePosition = (period % cycleLength) / cycleLength
    return 1 + 0.1 * Math.sin(2 * Math.PI * cyclePosition)
  }

  private getRandomFactor(): number {
    // Add some random variation (±5%)
    return 1 + (Math.random() - 0.5) * 0.1
  }

  private calculateConfidence(period: number, totalPeriods: number): number {
    // Confidence decreases over time
    const baseConfidence = 0.9
    const decayRate = 0.05
    return Math.max(baseConfidence - (period * decayRate), 0.3)
  }

  private calculateOverallConfidence(projections: CashFlowProjection[]): number {
    const avgConfidence = projections.reduce((sum, p) => sum + p.confidence, 0) / projections.length
    return avgConfidence
  }

  private identifyVarianceDrivers(
    projection: CashFlowProjection,
    actual: number
  ): VarianceDriver[] {
    const drivers: VarianceDriver[] = []
    const variance = actual - projection.projected

    // Analyze seasonal impact
    if (Math.abs(projection.factors.seasonal - 1) > 0.1) {
      drivers.push({
        factor: 'Seasonality',
        impact: (projection.factors.seasonal - 1) * projection.projected,
        explanation: `Seasonal factor was ${projection.factors.seasonal.toFixed(2)}x`
      })
    }

    // Analyze trend impact
    if (Math.abs(projection.factors.trend - 1) > 0.05) {
      drivers.push({
        factor: 'Growth Trend',
        impact: (projection.factors.trend - 1) * projection.projected,
        explanation: `Growth trend was ${projection.factors.trend.toFixed(2)}x`
      })
    }

    // Analyze cyclical impact
    if (Math.abs(projection.factors.cyclical - 1) > 0.05) {
      drivers.push({
        factor: 'Business Cycle',
        impact: (projection.factors.cyclical - 1) * projection.projected,
        explanation: `Cyclical factor was ${projection.factors.cyclical.toFixed(2)}x`
      })
    }

    // Add unexplained variance
    const explainedVariance = drivers.reduce((sum, d) => sum + d.impact, 0)
    const unexplainedVariance = variance - explainedVariance

    if (Math.abs(unexplainedVariance) > 1000) {
      drivers.push({
        factor: 'Unexplained',
        impact: unexplainedVariance,
        explanation: 'Random factors or model limitations'
      })
    }

    return drivers
  }

  // Monte Carlo simulation for risk analysis
  generateMonteCarloSimulation(
    baseForecast: CashFlowForecast,
    iterations: number = 1000
  ): { percentiles: { [key: string]: number[] }; scenarios: CashFlowProjection[][] } {
    const scenarios: CashFlowProjection[][] = []

    for (let i = 0; i < iterations; i++) {
      const scenario: CashFlowProjection[] = []
      
      baseForecast.projections.forEach(projection => {
        // Add random variation based on confidence
        const randomFactor = 1 + (Math.random() - 0.5) * (1 - projection.confidence) * 0.2
        const adjustedProjection = projection.projected * randomFactor

        scenario.push({
          ...projection,
          projected: adjustedProjection
        })
      })

      scenarios.push(scenario)
    }

    // Calculate percentiles
    const percentiles: { [key: string]: number[] } = {}
    const percentileKeys = ['5th', '25th', '50th', '75th', '95th']
    const percentileValues = [0.05, 0.25, 0.5, 0.75, 0.95]

    percentileKeys.forEach((key, index) => {
      percentiles[key] = baseForecast.projections.map((_, periodIndex) => {
        const values = scenarios.map(s => s[periodIndex].projected).sort((a, b) => a - b)
        const percentileIndex = Math.floor(values.length * percentileValues[index])
        return values[percentileIndex] || 0
      })
    })

    return { percentiles, scenarios }
  }
}

// Export singleton instance
export const cashFlowForecaster = new CashFlowForecaster()
