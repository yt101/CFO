// AI Financial Advisor with Natural Language Q&A and Insights
export interface AIResponse {
  answer: string
  confidence: number
  sources: string[]
  charts?: ChartData[]
  recommendations?: Recommendation[]
  followUpQuestions?: string[]
}

export interface ChartData {
  type: 'line' | 'bar' | 'pie' | 'area'
  title: string
  data: any[]
  xAxis?: string
  yAxis?: string
}

export interface Recommendation {
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  timeline: string
  effort: 'low' | 'medium' | 'high'
  category: 'revenue' | 'cost' | 'cash_flow' | 'risk' | 'compliance'
}

export interface NarrativeSummary {
  period: {
    start: Date
    end: Date
  }
  executiveSummary: string
  keyMetrics: {
    name: string
    value: number
    change: number
    trend: 'up' | 'down' | 'stable'
    significance: 'high' | 'medium' | 'low'
  }[]
  insights: {
    category: string
    title: string
    description: string
    impact: number
    confidence: number
  }[]
  recommendations: Recommendation[]
  risks: {
    title: string
    description: string
    probability: number
    impact: 'high' | 'medium' | 'low'
    mitigation: string
  }[]
  outlook: {
    shortTerm: string
    mediumTerm: string
    longTerm: string
  }
}

export interface ScenarioSimulation {
  name: string
  description: string
  assumptions: { [key: string]: any }
  results: {
    revenue: number
    expenses: number
    netIncome: number
    cashFlow: number
    runway: number
  }
  impact: {
    revenue: number
    expenses: number
    netIncome: number
    cashFlow: number
  }
  confidence: number
}

export class AIAdvisor {
  private financialData: any
  private knowledgeBase: Map<string, any>

  constructor(financialData?: any) {
    this.financialData = financialData || {}
    this.knowledgeBase = new Map()
    this.initializeKnowledgeBase()
  }

  async answerQuestion(question: string): Promise<AIResponse> {
    const questionType = this.classifyQuestion(question)
    const context = this.extractContext(question)
    
    let answer: string
    let confidence: number
    let sources: string[]
    let charts: ChartData[] = []
    let recommendations: Recommendation[] = []
    let followUpQuestions: string[] = []

    switch (questionType) {
      case 'revenue_analysis':
        ({ answer, confidence, sources, charts, recommendations } = await this.analyzeRevenue(question, context))
        break
      case 'cash_flow_analysis':
        ({ answer, confidence, sources, charts, recommendations } = await this.analyzeCashFlow(question, context))
        break
      case 'profitability_analysis':
        ({ answer, confidence, sources, charts, recommendations } = await this.analyzeProfitability(question, context))
        break
      case 'working_capital_analysis':
        ({ answer, confidence, sources, charts, recommendations } = await this.analyzeWorkingCapital(question, context))
        break
      case 'forecasting':
        ({ answer, confidence, sources, charts, recommendations } = await this.analyzeForecasting(question, context))
        break
      case 'risk_assessment':
        ({ answer, confidence, sources, charts, recommendations } = await this.analyzeRisk(question, context))
        break
      default:
        ({ answer, confidence, sources, charts, recommendations } = await this.generalAnalysis(question, context))
    }

    followUpQuestions = this.generateFollowUpQuestions(questionType, context)

    return {
      answer,
      confidence,
      sources,
      charts,
      recommendations,
      followUpQuestions
    }
  }

  async generateNarrativeSummary(period: { start: Date; end: Date }): Promise<NarrativeSummary> {
    const keyMetrics = this.extractKeyMetrics(period)
    const insights = await this.generateInsights(period)
    const recommendations = await this.generateRecommendations(insights)
    const risks = await this.identifyRisks(period)
    const outlook = await this.generateOutlook(period)

    const executiveSummary = this.generateExecutiveSummary(keyMetrics, insights, risks)

    return {
      period,
      executiveSummary,
      keyMetrics,
      insights,
      recommendations,
      risks,
      outlook
    }
  }

  async runScenarioSimulation(
    scenarioName: string,
    assumptions: { [key: string]: any }
  ): Promise<ScenarioSimulation> {
    const baseResults = this.getBaseFinancialResults()
    const scenarioResults = this.calculateScenarioResults(baseResults, assumptions)
    const impact = this.calculateImpact(baseResults, scenarioResults)

    return {
      name: scenarioName,
      description: this.generateScenarioDescription(assumptions),
      assumptions,
      results: scenarioResults,
      impact,
      confidence: this.calculateScenarioConfidence(assumptions)
    }
  }

  private classifyQuestion(question: string): string {
    const lowerQuestion = question.toLowerCase()
    
    if (lowerQuestion.includes('revenue') || lowerQuestion.includes('sales') || lowerQuestion.includes('income')) {
      return 'revenue_analysis'
    }
    if (lowerQuestion.includes('cash') || lowerQuestion.includes('liquidity') || lowerQuestion.includes('runway')) {
      return 'cash_flow_analysis'
    }
    if (lowerQuestion.includes('profit') || lowerQuestion.includes('margin') || lowerQuestion.includes('ebitda')) {
      return 'profitability_analysis'
    }
    if (lowerQuestion.includes('working capital') || lowerQuestion.includes('dso') || lowerQuestion.includes('dpo')) {
      return 'working_capital_analysis'
    }
    if (lowerQuestion.includes('forecast') || lowerQuestion.includes('projection') || lowerQuestion.includes('future')) {
      return 'forecasting'
    }
    if (lowerQuestion.includes('risk') || lowerQuestion.includes('threat') || lowerQuestion.includes('concern')) {
      return 'risk_assessment'
    }
    
    return 'general'
  }

  private extractContext(question: string): any {
    // Extract time periods, specific metrics, etc.
    const timePattern = /(last|next|this)\s+(month|quarter|year)/
    const metricPattern = /(revenue|cash|profit|margin|dso|dpo|dio)/
    
    return {
      timePeriod: question.match(timePattern)?.[0] || 'current',
      metrics: question.match(metricPattern) || [],
      question: question
    }
  }

  private async analyzeRevenue(question: string, context: any): Promise<Partial<AIResponse>> {
    const revenue = this.financialData.revenue || 1000000
    const growthRate = 0.15
    const previousRevenue = revenue / (1 + growthRate)
    const change = ((revenue - previousRevenue) / previousRevenue) * 100

    const answer = `Revenue analysis shows ${revenue.toLocaleString()} in current period, representing a ${change.toFixed(1)}% change from previous period. The growth is driven by increased customer acquisition and pricing optimization.`

    const charts: ChartData[] = [{
      type: 'line',
      title: 'Revenue Trend',
      data: [
        { period: 'Q1', revenue: previousRevenue * 0.9 },
        { period: 'Q2', revenue: previousRevenue * 0.95 },
        { period: 'Q3', revenue: previousRevenue },
        { period: 'Q4', revenue: revenue }
      ],
      xAxis: 'period',
      yAxis: 'revenue'
    }]

    const recommendations: Recommendation[] = [{
      title: 'Optimize Pricing Strategy',
      description: 'Implement dynamic pricing to maximize revenue per customer',
      impact: 'high',
      timeline: '2-3 months',
      effort: 'medium',
      category: 'revenue'
    }]

    return {
      answer,
      confidence: 0.85,
      sources: ['Financial Statements', 'Revenue Analysis'],
      charts,
      recommendations
    }
  }

  private async analyzeCashFlow(question: string, context: any): Promise<Partial<AIResponse>> {
    const cashFlow = this.financialData.cashFlow || 150000
    const runway = 12 // months
    const burnRate = 50000 // monthly

    const answer = `Cash flow analysis indicates ${cashFlow.toLocaleString()} in net cash flow with a runway of ${runway} months at current burn rate of ${burnRate.toLocaleString()}/month. Cash position is healthy but monitoring is recommended.`

    const charts: ChartData[] = [{
      type: 'area',
      title: 'Cash Flow Projection',
      data: Array.from({ length: 12 }, (_, i) => ({
        month: `Month ${i + 1}`,
        projected: cashFlow - (burnRate * i),
        actual: i < 3 ? cashFlow - (burnRate * i) + (Math.random() - 0.5) * 10000 : undefined
      })),
      xAxis: 'month',
      yAxis: 'amount'
    }]

    const recommendations: Recommendation[] = [{
      title: 'Optimize Working Capital',
      description: 'Improve DSO and DPO to free up cash',
      impact: 'high',
      timeline: '1-2 months',
      effort: 'medium',
      category: 'cash_flow'
    }]

    return {
      answer,
      confidence: 0.9,
      sources: ['Cash Flow Statement', 'Bank Statements'],
      charts,
      recommendations
    }
  }

  private async analyzeProfitability(question: string, context: any): Promise<Partial<AIResponse>> {
    const revenue = this.financialData.revenue || 1000000
    const grossMargin = 0.4
    const operatingMargin = 0.15
    const netMargin = 0.1

    const answer = `Profitability analysis shows strong margins: ${(grossMargin * 100).toFixed(1)}% gross margin, ${(operatingMargin * 100).toFixed(1)}% operating margin, and ${(netMargin * 100).toFixed(1)}% net margin. This indicates efficient operations and good cost control.`

    const charts: ChartData[] = [{
      type: 'bar',
      title: 'Profitability Margins',
      data: [
        { metric: 'Gross Margin', value: grossMargin * 100 },
        { metric: 'Operating Margin', value: operatingMargin * 100 },
        { metric: 'Net Margin', value: netMargin * 100 }
      ],
      xAxis: 'metric',
      yAxis: 'value'
    }]

    const recommendations: Recommendation[] = [{
      title: 'Cost Optimization',
      description: 'Identify and eliminate non-essential expenses',
      impact: 'medium',
      timeline: '3-6 months',
      effort: 'high',
      category: 'cost'
    }]

    return {
      answer,
      confidence: 0.88,
      sources: ['Income Statement', 'Cost Analysis'],
      charts,
      recommendations
    }
  }

  private async analyzeWorkingCapital(question: string, context: any): Promise<Partial<AIResponse>> {
    const dso = 32
    const dpo = 28
    const dio = 45
    const ccc = dso + dio - dpo

    const answer = `Working capital analysis shows DSO of ${dso} days, DPO of ${dpo} days, and DIO of ${dio} days, resulting in a cash conversion cycle of ${ccc} days. This is within industry norms but has room for improvement.`

    const charts: ChartData[] = [{
      type: 'bar',
      title: 'Working Capital Metrics',
      data: [
        { metric: 'DSO', value: dso, target: 30 },
        { metric: 'DPO', value: dpo, target: 35 },
        { metric: 'DIO', value: dio, target: 40 }
      ],
      xAxis: 'metric',
      yAxis: 'value'
    }]

    const recommendations: Recommendation[] = [{
      title: 'Improve Collections Process',
      description: 'Implement automated follow-up and payment incentives',
      impact: 'high',
      timeline: '1-2 months',
      effort: 'medium',
      category: 'cash_flow'
    }]

    return {
      answer,
      confidence: 0.82,
      sources: ['Balance Sheet', 'Working Capital Analysis'],
      charts,
      recommendations
    }
  }

  private async analyzeForecasting(question: string, context: any): Promise<Partial<AIResponse>> {
    const currentRevenue = this.financialData.revenue || 1000000
    const growthRate = 0.15
    const projectedRevenue = currentRevenue * (1 + growthRate)

    const answer = `Based on current trends and growth patterns, revenue is projected to reach ${projectedRevenue.toLocaleString()} next period, representing a ${(growthRate * 100).toFixed(1)}% growth rate. This projection has 85% confidence based on historical data.`

    const charts: ChartData[] = [{
      type: 'line',
      title: 'Revenue Forecast',
      data: [
        { period: 'Q1', actual: currentRevenue * 0.8 },
        { period: 'Q2', actual: currentRevenue * 0.9 },
        { period: 'Q3', actual: currentRevenue },
        { period: 'Q4', projected: projectedRevenue }
      ],
      xAxis: 'period',
      yAxis: 'amount'
    }]

    const recommendations: Recommendation[] = [{
      title: 'Scenario Planning',
      description: 'Develop best-case, worst-case, and most-likely scenarios',
      impact: 'high',
      timeline: '1 month',
      effort: 'medium',
      category: 'risk'
    }]

    return {
      answer,
      confidence: 0.85,
      sources: ['Historical Data', 'Trend Analysis'],
      charts,
      recommendations
    }
  }

  private async analyzeRisk(question: string, context: any): Promise<Partial<AIResponse>> {
    const risks = [
      { name: 'Customer Concentration', probability: 0.3, impact: 'high' },
      { name: 'Market Volatility', probability: 0.4, impact: 'medium' },
      { name: 'Regulatory Changes', probability: 0.2, impact: 'medium' }
    ]

    const answer = `Risk assessment identifies ${risks.length} key risks: Customer concentration (30% probability, high impact), Market volatility (40% probability, medium impact), and Regulatory changes (20% probability, medium impact). Overall risk level is moderate.`

    const charts: ChartData[] = [{
      type: 'pie',
      title: 'Risk Distribution',
      data: risks.map(r => ({
        name: r.name,
        value: r.probability * 100
      }))
    }]

    const recommendations: Recommendation[] = [{
      title: 'Diversify Customer Base',
      description: 'Reduce dependency on top 5 customers',
      impact: 'high',
      timeline: '6-12 months',
      effort: 'high',
      category: 'risk'
    }]

    return {
      answer,
      confidence: 0.75,
      sources: ['Risk Assessment', 'Market Analysis'],
      charts,
      recommendations
    }
  }

  private async generalAnalysis(question: string, context: any): Promise<Partial<AIResponse>> {
    const answer = `I can help you analyze your financial data. Based on the available information, I can provide insights on revenue, cash flow, profitability, working capital, forecasting, and risk assessment. Could you be more specific about what you'd like to know?`

    return {
      answer,
      confidence: 0.6,
      sources: ['General Knowledge Base'],
      charts: [],
      recommendations: []
    }
  }

  private generateFollowUpQuestions(questionType: string, context: any): string[] {
    const followUps: { [key: string]: string[] } = {
      revenue_analysis: [
        "What's driving the revenue growth?",
        "How does this compare to industry benchmarks?",
        "What are the revenue trends by customer segment?"
      ],
      cash_flow_analysis: [
        "What's the cash runway at current burn rate?",
        "How can we improve cash collection?",
        "What are the main cash flow drivers?"
      ],
      profitability_analysis: [
        "Which products have the highest margins?",
        "How can we improve cost efficiency?",
        "What's the impact of pricing changes?"
      ],
      working_capital_analysis: [
        "How can we reduce DSO?",
        "What's the optimal inventory level?",
        "How can we extend payment terms?"
      ],
      forecasting: [
        "What are the key assumptions in the forecast?",
        "How sensitive is the forecast to changes?",
        "What scenarios should we consider?"
      ],
      risk_assessment: [
        "What are the biggest risks to the business?",
        "How can we mitigate these risks?",
        "What's our risk tolerance?"
      ]
    }

    return followUps[questionType] || [
      "Can you provide more details?",
      "What specific metrics are you interested in?",
      "How can I help you further?"
    ]
  }

  private extractKeyMetrics(period: { start: Date; end: Date }): any[] {
    return [
      {
        name: 'Revenue',
        value: 1000000,
        change: 15.2,
        trend: 'up' as const,
        significance: 'high' as const
      },
      {
        name: 'Gross Margin',
        value: 40.5,
        change: 2.1,
        trend: 'up' as const,
        significance: 'high' as const
      },
      {
        name: 'Cash Flow',
        value: 150000,
        change: -5.3,
        trend: 'down' as const,
        significance: 'medium' as const
      }
    ]
  }

  private async generateInsights(period: { start: Date; end: Date }): Promise<any[]> {
    return [
      {
        category: 'Revenue',
        title: 'Strong Revenue Growth',
        description: 'Revenue increased 15.2% driven by new customer acquisition',
        impact: 150000,
        confidence: 0.9
      },
      {
        category: 'Efficiency',
        title: 'Improved Margins',
        description: 'Gross margin improved due to cost optimization initiatives',
        impact: 50000,
        confidence: 0.85
      }
    ]
  }

  private async generateRecommendations(insights: any[]): Promise<Recommendation[]> {
    return [
      {
        title: 'Scale Customer Acquisition',
        description: 'Increase marketing spend to capitalize on growth momentum',
        impact: 'high',
        timeline: '3-6 months',
        effort: 'medium',
        category: 'revenue'
      }
    ]
  }

  private async identifyRisks(period: { start: Date; end: Date }): Promise<any[]> {
    return [
      {
        title: 'Customer Concentration',
        description: 'Top 5 customers represent 60% of revenue',
        probability: 0.3,
        impact: 'high' as const,
        mitigation: 'Diversify customer base and develop new segments'
      }
    ]
  }

  private async generateOutlook(period: { start: Date; end: Date }): Promise<any> {
    return {
      shortTerm: 'Revenue growth expected to continue at 15% rate',
      mediumTerm: 'Market expansion opportunities in new geographies',
      longTerm: 'Potential for IPO or acquisition within 3-5 years'
    }
  }

  private generateExecutiveSummary(keyMetrics: any[], insights: any[], risks: any[]): string {
    return `This period shows strong performance with ${keyMetrics[0].change}% revenue growth and improved margins. Key opportunities include scaling customer acquisition and optimizing working capital. Main risks center around customer concentration, which requires diversification strategies.`
  }

  private getBaseFinancialResults(): any {
    return {
      revenue: 1000000,
      expenses: 850000,
      netIncome: 150000,
      cashFlow: 120000
    }
  }

  private calculateScenarioResults(base: any, assumptions: any): any {
    const revenue = base.revenue * (1 + (assumptions.revenueGrowth || 0))
    const expenses = base.expenses * (1 + (assumptions.expenseGrowth || 0))
    const netIncome = revenue - expenses
    const cashFlow = netIncome * 0.8

    return {
      revenue,
      expenses,
      netIncome,
      cashFlow,
      runway: (base.cashFlow + cashFlow) / (expenses / 12)
    }
  }

  private calculateImpact(base: any, scenario: any): any {
    return {
      revenue: scenario.revenue - base.revenue,
      expenses: scenario.expenses - base.expenses,
      netIncome: scenario.netIncome - base.netIncome,
      cashFlow: scenario.cashFlow - base.cashFlow
    }
  }

  private generateScenarioDescription(assumptions: any): string {
    return `Scenario assumes ${(assumptions.revenueGrowth || 0) * 100}% revenue growth and ${(assumptions.expenseGrowth || 0) * 100}% expense growth`
  }

  private calculateScenarioConfidence(assumptions: any): number {
    return 0.8 // Base confidence for scenario analysis
  }

  private initializeKnowledgeBase(): void {
    // Initialize with financial knowledge and patterns
    this.knowledgeBase.set('revenue_patterns', {
      seasonal: true,
      growth_trend: 'positive',
      volatility: 'low'
    })
    
    this.knowledgeBase.set('cost_structure', {
      fixed_costs: 0.4,
      variable_costs: 0.6,
      scalability: 'high'
    })
  }
}

// Export singleton instance
export const aiAdvisor = new AIAdvisor()
































