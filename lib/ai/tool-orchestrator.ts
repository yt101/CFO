"use client"

import { FPA_TOOLS, FPAToolExecutor, ToolCall, ToolResult, ToolDefinition } from './tools/fpa-tools'
import { createQuickBooksIntegratedToolExecutor } from './tools/quickbooks-integrated-tools'
import { LLMService } from './llm-service'

interface ToolOrchestrationResult {
  answer: string
  toolCalls: ToolCall[]
  toolResults: ToolResult[]
  confidence: number
  reasoning?: string
}

interface ToolContext {
  availableTools: ToolDefinition[]
  recentResults: ToolResult[]
  userQuery: string
  conversationHistory: string
}

export class ToolOrchestrator {
  private toolExecutor: FPAToolExecutor
  private quickBooksToolExecutor: any
  private llmService: LLMService
  private useQuickBooks: boolean = false

  constructor(llmService: LLMService) {
    this.toolExecutor = new FPAToolExecutor()
    this.quickBooksToolExecutor = createQuickBooksIntegratedToolExecutor()
    this.llmService = llmService
  }

  // Enable QuickBooks integration
  enableQuickBooks() {
    this.useQuickBooks = true
  }

  // Disable QuickBooks integration
  disableQuickBooks() {
    this.useQuickBooks = false
  }

  async orchestrate(
    userQuery: string,
    context: {
      conversationHistory?: string
      recentResults?: ToolResult[]
    } = {}
  ): Promise<ToolOrchestrationResult> {
    try {
      // Step 1: Determine if tools should be used
      const shouldUseTools = await this.shouldUseTools(userQuery, context)
      
      if (!shouldUseTools) {
        // Use regular LLM without tools
        const response = await this.llmService.generateFinancialInsight(
          context.conversationHistory || '',
          userQuery
        )
        
        return {
          answer: response.content,
          toolCalls: [],
          toolResults: [],
          confidence: 0.7
        }
      }

      // Step 2: Select appropriate tools
      const toolCalls = await this.selectTools(userQuery, context)
      
      if (toolCalls.length === 0) {
        // Fallback to regular LLM
        const response = await this.llmService.generateFinancialInsight(
          context.conversationHistory || '',
          userQuery
        )
        
        return {
          answer: response.content,
          toolCalls: [],
          toolResults: [],
          confidence: 0.7
        }
      }

      // Step 3: Execute tools
      const toolResults = await this.executeTools(toolCalls)

      // Step 4: Generate final answer using tool results
      const answer = await this.generateAnswerWithTools(userQuery, toolCalls, toolResults, context)

      // Step 5: Calculate confidence
      const confidence = this.calculateConfidence(toolResults, answer)

      return {
        answer,
        toolCalls,
        toolResults,
        confidence,
        reasoning: this.generateReasoning(toolCalls, toolResults)
      }
    } catch (error) {
      console.error('Tool orchestration error:', error)
      
      // Fallback to regular LLM
      const response = await this.llmService.generateFinancialInsight(
        context.conversationHistory || '',
        userQuery
      )
      
      return {
        answer: response.content,
        toolCalls: [],
        toolResults: [],
        confidence: 0.5
      }
    }
  }

  private async shouldUseTools(userQuery: string, context: any): Promise<boolean> {
    // Simple heuristic to determine if tools should be used
    const toolKeywords = [
      'analyze', 'calculate', 'generate', 'report', 'forecast', 'variance',
      'cash flow', 'revenue', 'expenses', 'kpi', 'metrics', 'performance',
      'budget', 'actual', 'comparison', 'trend', 'projection'
    ]

    const queryLower = userQuery.toLowerCase()
    const hasToolKeywords = toolKeywords.some(keyword => queryLower.includes(keyword))
    
    // Check for specific patterns that suggest tool usage
    const toolPatterns = [
      /show me.*(?:revenue|cash|expense|kpi|metric)/i,
      /analyze.*(?:performance|trend|variance)/i,
      /generate.*(?:report|forecast|analysis)/i,
      /calculate.*(?:runway|burn|margin|ratio)/i,
      /what.*(?:our|the).*(?:revenue|cash|expense|performance)/i
    ]

    const hasToolPatterns = toolPatterns.some(pattern => pattern.test(userQuery))
    
    return hasToolKeywords || hasToolPatterns
  }

  private async selectTools(userQuery: string, context: any): Promise<ToolCall[]> {
    const selectedTools: ToolCall[] = []
    const queryLower = userQuery.toLowerCase()

    // Map query patterns to tools
    const toolMappings = [
      {
        patterns: ['cash flow', 'runway', 'burn rate', 'cash position'],
        tool: 'get_cash_flow_analysis',
        extractParams: (query: string) => this.extractPeriod(query)
      },
      {
        patterns: ['revenue', 'sales', 'mrr', 'growth'],
        tool: 'get_revenue_analysis',
        extractParams: (query: string) => this.extractPeriod(query)
      },
      {
        patterns: ['expense', 'cost', 'spending', 'budget'],
        tool: 'get_expense_analysis',
        extractParams: (query: string) => this.extractPeriod(query)
      },
      {
        patterns: ['report', 'generate', 'create', 'board pack'],
        tool: 'generate_financial_report',
        extractParams: (query: string) => this.extractReportParams(query)
      },
      {
        patterns: ['variance', 'compare', 'actual vs', 'budget vs'],
        tool: 'perform_variance_analysis',
        extractParams: (query: string) => this.extractPeriod(query)
      },
      {
        patterns: ['forecast', 'projection', 'predict', 'future'],
        tool: 'create_forecast',
        extractParams: (query: string) => this.extractForecastParams(query)
      },
      {
        patterns: ['kpi', 'metric', 'ratio', 'performance'],
        tool: 'calculate_kpis',
        extractParams: (query: string) => this.extractPeriod(query)
      },
      {
        patterns: ['customer', 'cac', 'ltv', 'churn', 'retention'],
        tool: 'analyze_customer_metrics',
        extractParams: (query: string) => this.extractPeriod(query)
      }
    ]

    // Select tools based on query patterns
    for (const mapping of toolMappings) {
      const hasPattern = mapping.patterns.some(pattern => queryLower.includes(pattern))
      if (hasPattern) {
        const params = mapping.extractParams(userQuery)
        selectedTools.push({
          name: mapping.tool,
          parameters: params,
          id: `tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        })
      }
    }

    // Remove duplicates and limit to 3 tools max
    const uniqueTools = selectedTools.filter((tool, index, self) => 
      index === self.findIndex(t => t.name === tool.name)
    ).slice(0, 3)

    return uniqueTools
  }

  private extractPeriod(query: string): any {
    const periodPatterns = [
      { pattern: /Q1 2025/i, value: "Q1 2025" },
      { pattern: /Q2 2025/i, value: "Q2 2025" },
      { pattern: /Q3 2025/i, value: "Q3 2025" },
      { pattern: /Q4 2025/i, value: "Q4 2025" },
      { pattern: /last 30 days/i, value: "last 30 days" },
      { pattern: /last 90 days/i, value: "last 90 days" },
      { pattern: /ytd/i, value: "YTD" },
      { pattern: /this quarter/i, value: "Q1 2025" },
      { pattern: /current/i, value: "Q1 2025" }
    ]

    for (const { pattern, value } of periodPatterns) {
      if (pattern.test(query)) {
        return { period: value }
      }
    }

    return { period: "Q1 2025" } // Default
  }

  private extractReportParams(query: string): any {
    const reportTypes = {
      'p&l': 'p_l',
      'profit': 'p_l',
      'income': 'p_l',
      'balance sheet': 'balance_sheet',
      'cash flow': 'cash_flow',
      'board': 'board_pack',
      'kpi': 'kpi_dashboard',
      'monthly': 'monthly_summary'
    }

    const queryLower = query.toLowerCase()
    let reportType = 'p_l' // Default

    for (const [keyword, type] of Object.entries(reportTypes)) {
      if (queryLower.includes(keyword)) {
        reportType = type
        break
      }
    }

    const period = this.extractPeriod(query).period

    return {
      report_type: reportType,
      period: period,
      format: 'executive'
    }
  }

  private extractForecastParams(query: string): any {
    const forecastTypes = {
      'revenue': 'revenue',
      'cash': 'cash_flow',
      'expense': 'expenses',
      'comprehensive': 'comprehensive'
    }

    const horizons = {
      '3 months': '3_months',
      '6 months': '6_months',
      '12 months': '12_months',
      '2 years': '24_months'
    }

    const queryLower = query.toLowerCase()
    let forecastType = 'revenue' // Default
    let horizon = '12_months' // Default

    for (const [keyword, type] of Object.entries(forecastTypes)) {
      if (queryLower.includes(keyword)) {
        forecastType = type
        break
      }
    }

    for (const [keyword, h] of Object.entries(horizons)) {
      if (queryLower.includes(keyword)) {
        horizon = h
        break
      }
    }

    return {
      forecast_type: forecastType,
      horizon: horizon,
      scenario: 'realistic'
    }
  }

  private async executeTools(toolCalls: ToolCall[]): Promise<ToolResult[]> {
    const results: ToolResult[] = []
    const executor = this.useQuickBooks ? this.quickBooksToolExecutor : this.toolExecutor

    for (const toolCall of toolCalls) {
      try {
        const result = await executor.executeTool(toolCall)
        results.push(result)
      } catch (error) {
        results.push({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          metadata: { tool: toolCall.name }
        })
      }
    }

    return results
  }

  private async generateAnswerWithTools(
    userQuery: string,
    toolCalls: ToolCall[],
    toolResults: ToolResult[],
    context: any
  ): Promise<string> {
    const successfulResults = toolResults.filter(r => r.success)
    
    if (successfulResults.length === 0) {
      // Fallback to regular LLM
      const response = await this.llmService.generateFinancialInsight(
        context.conversationHistory || '',
        userQuery
      )
      return response.content
    }

    // Prepare context with tool results
    const toolContext = this.formatToolResultsForLLM(toolCalls, successfulResults)
    const fullContext = `${context.conversationHistory || ''}\n\nTool Results:\n${toolContext}`

    const systemPrompt = `You are an AI CFO assistant with access to real-time financial data through tools. 
    Use the provided tool results to answer the user's question accurately and comprehensively.

    Guidelines:
    - Base your answer on the actual data from the tools
    - Explain the key insights and findings
    - Provide actionable recommendations when appropriate
    - Cite specific numbers and metrics from the tool results
    - If the data shows concerning trends, highlight them
    - Be specific and data-driven in your analysis

    Tool Results:
    ${toolContext}`

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: userQuery }
    ]

    const response = await this.llmService.generateResponse(messages, {
      temperature: 0.3,
      maxTokens: 2000
    })

    return response.content
  }

  private formatToolResultsForLLM(toolCalls: ToolCall[], results: ToolResult[]): string {
    let context = ''

    for (let i = 0; i < toolCalls.length; i++) {
      const toolCall = toolCalls[i]
      const result = results[i]

      if (result.success && result.data) {
        context += `\n${toolCall.name}:\n`
        context += JSON.stringify(result.data, null, 2)
        context += '\n'
      }
    }

    return context
  }

  private calculateConfidence(toolResults: ToolResult[], answer: string): number {
    if (toolResults.length === 0) return 0.5

    const successfulResults = toolResults.filter(r => r.success)
    const successRate = successfulResults.length / toolResults.length

    // Base confidence on success rate and answer length
    const baseConfidence = successRate * 0.8
    const lengthBonus = Math.min(answer.length / 1000, 0.2) // Up to 20% bonus for detailed answers

    return Math.min(baseConfidence + lengthBonus, 1.0)
  }

  private generateReasoning(toolCalls: ToolCall[], toolResults: ToolResult[]): string {
    const successfulTools = toolCalls.filter((_, i) => toolResults[i]?.success)
    const failedTools = toolCalls.filter((_, i) => !toolResults[i]?.success)

    let reasoning = `Executed ${toolCalls.length} tools: ${successfulTools.length} successful`

    if (successfulTools.length > 0) {
      reasoning += ` (${successfulTools.map(t => t.name).join(', ')})`
    }

    if (failedTools.length > 0) {
      reasoning += `, ${failedTools.length} failed (${failedTools.map(t => t.name).join(', ')})`
    }

    return reasoning
  }

  // Get available tools for UI display
  getAvailableTools(): ToolDefinition[] {
    return FPA_TOOLS
  }

  // Get tool by name
  getToolByName(name: string): ToolDefinition | undefined {
    return FPA_TOOLS.find(tool => tool.name === name)
  }
}

// Factory function
export function createToolOrchestrator(llmService: LLMService): ToolOrchestrator {
  return new ToolOrchestrator(llmService)
}
