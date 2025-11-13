"use client"

interface LLMConfig {
  provider: 'openai' | 'anthropic'
  apiKey: string
  model: string
  maxTokens?: number
  temperature?: number
}

interface LLMMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface LLMResponse {
  content: string
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
  model: string
}

export class LLMService {
  private config: LLMConfig

  constructor(config: LLMConfig) {
    this.config = config
  }

  async generateResponse(
    messages: LLMMessage[],
    options?: {
      maxTokens?: number
      temperature?: number
      stream?: boolean
    }
  ): Promise<LLMResponse> {
    const { provider } = this.config
    
    if (provider === 'openai') {
      return this.callOpenAI(messages, options)
    } else if (provider === 'anthropic') {
      return this.callAnthropic(messages, options)
    } else {
      throw new Error(`Unsupported LLM provider: ${provider}`)
    }
  }

  private async callOpenAI(
    messages: LLMMessage[],
    options?: {
      maxTokens?: number
      temperature?: number
      stream?: boolean
    }
  ): Promise<LLMResponse> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: messages,
        max_tokens: options?.maxTokens || this.config.maxTokens || 4000,
        temperature: options?.temperature || this.config.temperature || 0.7,
        stream: options?.stream || false,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`OpenAI API error: ${response.status} - ${error}`)
    }

    const data = await response.json()
    
    return {
      content: data.choices[0].message.content,
      usage: data.usage,
      model: data.model,
    }
  }

  private async callAnthropic(
    messages: LLMMessage[],
    options?: {
      maxTokens?: number
      temperature?: number
      stream?: boolean
    }
  ): Promise<LLMResponse> {
    // Convert messages to Anthropic format
    const systemMessage = messages.find(m => m.role === 'system')
    const conversationMessages = messages.filter(m => m.role !== 'system')
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': this.config.apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.config.model,
        max_tokens: options?.maxTokens || this.config.maxTokens || 4000,
        temperature: options?.temperature || this.config.temperature || 0.7,
        system: systemMessage?.content || '',
        messages: conversationMessages.map(m => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content,
        })),
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Anthropic API error: ${response.status} - ${error}`)
    }

    const data = await response.json()
    
    return {
      content: data.content[0].text,
      usage: data.usage,
      model: data.model,
    }
  }

  async generateFinancialInsight(
    context: string,
    question: string,
    data?: any
  ): Promise<LLMResponse> {
    const systemPrompt = `You are an AI CFO assistant specializing in financial analysis and insights. 
    You help business leaders understand their financial data and make informed decisions.
    
    Guidelines:
    - Provide clear, actionable insights
    - Use financial terminology appropriately
    - Explain complex concepts in business-friendly language
    - Always cite specific data points when available
    - Suggest concrete next steps when appropriate
    - Be concise but comprehensive`

    const messages: LLMMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Context: ${context}\n\nQuestion: ${question}\n\nData: ${JSON.stringify(data, null, 2)}` }
    ]

    return this.generateResponse(messages, {
      temperature: 0.3, // Lower temperature for more consistent financial analysis
      maxTokens: 2000
    })
  }

  async generateBoardDeck(
    financialData: any,
    timePeriod: string
  ): Promise<LLMResponse> {
    const systemPrompt = `You are an AI CFO creating a board presentation deck. 
    Create a comprehensive, executive-level presentation that covers:
    
    1. Executive Summary
    2. Financial Performance Highlights
    3. Key Metrics & KPIs
    4. Revenue Analysis
    5. Cost Management
    6. Cash Flow Analysis
    7. Risk Assessment
    8. Strategic Recommendations
    9. Next Quarter Outlook
    
    Format as markdown with clear headings and bullet points.`

    const messages: LLMMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Create a board deck for ${timePeriod} based on this financial data:\n\n${JSON.stringify(financialData, null, 2)}` }
    ]

    return this.generateResponse(messages, {
      temperature: 0.4,
      maxTokens: 3000
    })
  }

  async analyzePerformance(
    metrics: any,
    timePeriod: string
  ): Promise<LLMResponse> {
    const systemPrompt = `You are a financial analyst providing performance analysis. 
    Analyze the provided metrics and provide:
    
    1. Performance summary
    2. Key trends and patterns
    3. Areas of concern
    4. Opportunities for improvement
    5. Benchmarking insights
    6. Actionable recommendations
    
    Be specific and data-driven in your analysis.`

    const messages: LLMMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Analyze performance for ${timePeriod}:\n\n${JSON.stringify(metrics, null, 2)}` }
    ]

    return this.generateResponse(messages, {
      temperature: 0.3,
      maxTokens: 2500
    })
  }
}

// Factory function to create LLM service from configuration
export function createLLMService(config: {
  provider: 'openai' | 'anthropic'
  apiKey: string
  model: string
  maxTokens?: number
  temperature?: number
}): LLMService {
  return new LLMService(config)
}

// Utility function to get LLM configuration from stored settings
export async function getLLMConfiguration(): Promise<LLMConfig | null> {
  try {
    const response = await fetch('/api/integrations/configuration')
    if (!response.ok) return null
    
    const data = await response.json()
    const configs = data.configurations || []
    
    // Look for OpenAI or Anthropic configuration
    const openaiConfig = configs.find((c: any) => c.service_id === 'openai' && c.enabled)
    const anthropicConfig = configs.find((c: any) => c.service_id === 'anthropic' && c.enabled)
    
    if (openaiConfig) {
      return {
        provider: 'openai',
        apiKey: openaiConfig.parameters.apiKey?.value || '',
        model: openaiConfig.parameters.model?.value || 'gpt-4',
        maxTokens: parseInt(openaiConfig.parameters.maxTokens?.value || '4000'),
        temperature: parseFloat(openaiConfig.parameters.temperature?.value || '0.7'),
      }
    }
    
    if (anthropicConfig) {
      return {
        provider: 'anthropic',
        apiKey: anthropicConfig.parameters.apiKey?.value || '',
        model: anthropicConfig.parameters.model?.value || 'claude-3-sonnet-20240229',
        maxTokens: parseInt(anthropicConfig.parameters.maxTokens?.value || '4000'),
        temperature: parseFloat(anthropicConfig.parameters.temperature?.value || '0.7'),
      }
    }
    
    return null
  } catch (error) {
    console.error('Error loading LLM configuration:', error)
    return null
  }
}












