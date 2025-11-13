"use client"

interface ServiceConfig {
  id: string
  name: string
  category: string
  enabled: boolean
  status: 'active' | 'inactive' | 'error'
  parameters: {
    [key: string]: {
      value: string
      type: string
      required: boolean
      description: string
      placeholder?: string
    }
  }
}

export class ConfigService {
  private static instance: ConfigService
  private configs: ServiceConfig[] = []
  private cacheExpiry: number = 0
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService()
    }
    return ConfigService.instance
  }

  async getConfigurations(): Promise<ServiceConfig[]> {
    const now = Date.now()
    
    // Return cached data if still valid
    if (this.configs.length > 0 && now < this.cacheExpiry) {
      return this.configs
    }

    try {
      const response = await fetch('/api/integrations/configuration')
      if (response.ok) {
        const data = await response.json()
        const serverConfigs = data.configurations || []
        // If server returns empty (e.g., demo/no auth), fall back to localStorage
        if (serverConfigs.length === 0) {
          return this.loadFromLocalStorage()
        }
        this.configs = serverConfigs
        this.cacheExpiry = now + this.CACHE_DURATION
        return this.configs
      }
    } catch (error) {
      console.error('Error loading configurations:', error)
    }

    // Fallback to localStorage for demo mode
    return this.loadFromLocalStorage()
  }

  async getConfiguration(serviceId: string): Promise<ServiceConfig | null> {
    const configs = await this.getConfigurations()
    return configs.find(config => config.id === serviceId) || null
  }

  async getParameterValue(serviceId: string, parameterKey: string): Promise<string | null> {
    const config = await this.getConfiguration(serviceId)
    return config?.parameters[parameterKey]?.value || null
  }

  async isServiceEnabled(serviceId: string): Promise<boolean> {
    const config = await this.getConfiguration(serviceId)
    return config?.enabled || false
  }

  async getLLMConfiguration(): Promise<{
    provider: 'openai' | 'anthropic'
    apiKey: string
    model: string
    maxTokens: number
    temperature: number
  } | null> {
    // First, check environment variables (highest priority for demo mode)
    if (typeof window === 'undefined') {
      // Server-side: check process.env
      const openaiKey = process.env.OPENAI_API_KEY
      const anthropicKey = process.env.ANTHROPIC_API_KEY
      
      if (openaiKey) {
        return {
          provider: 'openai',
          apiKey: openaiKey,
          model: process.env.OPENAI_MODEL || 'gpt-4',
          maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '4000'),
          temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
        }
      }
      
      if (anthropicKey) {
        return {
          provider: 'anthropic',
          apiKey: anthropicKey,
          model: process.env.ANTHROPIC_MODEL || 'claude-3-sonnet-20240229',
          maxTokens: parseInt(process.env.ANTHROPIC_MAX_TOKENS || '4000'),
          temperature: parseFloat(process.env.ANTHROPIC_TEMPERATURE || '0.7'),
        }
      }
    } else {
      // Client-side: check NEXT_PUBLIC_ environment variables
      const openaiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY
      const anthropicKey = process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY
      
      if (openaiKey) {
        return {
          provider: 'openai',
          apiKey: openaiKey,
          model: process.env.NEXT_PUBLIC_OPENAI_MODEL || 'gpt-4',
          maxTokens: parseInt(process.env.NEXT_PUBLIC_OPENAI_MAX_TOKENS || '4000'),
          temperature: parseFloat(process.env.NEXT_PUBLIC_OPENAI_TEMPERATURE || '0.7'),
        }
      }
      
      if (anthropicKey) {
        return {
          provider: 'anthropic',
          apiKey: anthropicKey,
          model: process.env.NEXT_PUBLIC_ANTHROPIC_MODEL || 'claude-3-sonnet-20240229',
          maxTokens: parseInt(process.env.NEXT_PUBLIC_ANTHROPIC_MAX_TOKENS || '4000'),
          temperature: parseFloat(process.env.NEXT_PUBLIC_ANTHROPIC_TEMPERATURE || '0.7'),
        }
      }
    }
    
    // Fallback to stored configurations
    const configs = await this.getConfigurations()
    
    // Check for OpenAI first - prioritize enabled, but also check if API key exists
    let openaiConfig = configs.find(c => c.id === 'openai' && c.enabled)
    if (!openaiConfig) {
      // Fallback: if not enabled, check if API key exists anyway
      openaiConfig = configs.find(c => c.id === 'openai' && c.parameters?.apiKey?.value)
      // Auto-enable if API key exists
      if (openaiConfig && openaiConfig.parameters?.apiKey?.value) {
        openaiConfig.enabled = true
      }
    }
    
    if (openaiConfig && openaiConfig.parameters?.apiKey?.value) {
      return {
        provider: 'openai',
        apiKey: openaiConfig.parameters.apiKey.value || '',
        model: openaiConfig.parameters.model?.value || 'gpt-4',
        maxTokens: parseInt(openaiConfig.parameters.maxTokens?.value || '4000'),
        temperature: parseFloat(openaiConfig.parameters.temperature?.value || '0.7'),
      }
    }

    // Check for Anthropic - prioritize enabled, but also check if API key exists
    let anthropicConfig = configs.find(c => c.id === 'anthropic' && c.enabled)
    if (!anthropicConfig) {
      // Fallback: if not enabled, check if API key exists anyway
      anthropicConfig = configs.find(c => c.id === 'anthropic' && c.parameters?.apiKey?.value)
      // Auto-enable if API key exists
      if (anthropicConfig && anthropicConfig.parameters?.apiKey?.value) {
        anthropicConfig.enabled = true
      }
    }
    
    if (anthropicConfig && anthropicConfig.parameters?.apiKey?.value) {
      return {
        provider: 'anthropic',
        apiKey: anthropicConfig.parameters.apiKey.value || '',
        model: anthropicConfig.parameters.model?.value || 'claude-3-sonnet-20240229',
        maxTokens: parseInt(anthropicConfig.parameters.maxTokens?.value || '4000'),
        temperature: parseFloat(anthropicConfig.parameters.temperature?.value || '0.7'),
      }
    }

    return null
  }

  async getDatabaseConfiguration(): Promise<{
    url: string
    embedDim: number
  } | null> {
    const postgresConfig = await this.getConfiguration('postgres')
    if (!postgresConfig || !postgresConfig.enabled) return null

    return {
      url: postgresConfig.parameters.databaseUrl?.value || '',
      embedDim: parseInt(postgresConfig.parameters.embedDim?.value || '1536'),
    }
  }

  async getVectorDBConfiguration(): Promise<{
    provider: 'pinecone' | 'postgres'
    apiKey?: string
    environment?: string
    index?: string
    url?: string
    embedDim?: number
  } | null> {
    // Check Pinecone first
    const pineconeConfig = await this.getConfiguration('pinecone')
    if (pineconeConfig && pineconeConfig.enabled) {
      return {
        provider: 'pinecone',
        apiKey: pineconeConfig.parameters.apiKey?.value || '',
        environment: pineconeConfig.parameters.environment?.value || '',
        index: pineconeConfig.parameters.index?.value || '',
      }
    }

    // Check PostgreSQL with pgvector
    const postgresConfig = await this.getConfiguration('postgres')
    if (postgresConfig && postgresConfig.enabled) {
      return {
        provider: 'postgres',
        url: postgresConfig.parameters.databaseUrl?.value || '',
        embedDim: parseInt(postgresConfig.parameters.embedDim?.value || '1536'),
      }
    }

    return null
  }

  async getQuickBooksConfiguration(): Promise<{
    companyId: string
    clientId: string
    clientSecret: string
    redirectUri: string
    environment: string
  } | null> {
    const qbConfig = await this.getConfiguration('quickbooks')
    if (!qbConfig) return null
    
    // Auto-enable if Company ID is present (similar to LLM API key detection)
    const hasCompanyId = qbConfig.parameters?.companyId?.value && qbConfig.parameters.companyId.value.trim() !== ''
    if (!qbConfig.enabled && !hasCompanyId) return null
    
    // Auto-enable if Company ID exists
    if (hasCompanyId && !qbConfig.enabled) {
      qbConfig.enabled = true
    }

    // Return config if enabled OR if Company ID is present
    if (qbConfig.enabled || hasCompanyId) {
      return {
        companyId: qbConfig.parameters.companyId?.value || '',
        clientId: qbConfig.parameters.clientId?.value || '',
        clientSecret: qbConfig.parameters.clientSecret?.value || '',
        redirectUri: qbConfig.parameters.redirectUri?.value || '',
        environment: qbConfig.parameters.environment?.value || 'sandbox',
      }
    }

    return null
  }

  async getBankingConfiguration(): Promise<{
    apiKey: string
    environment: string
  } | null> {
    const bankingConfig = await this.getConfiguration('banking')
    if (!bankingConfig || !bankingConfig.enabled) return null

    return {
      apiKey: bankingConfig.parameters.apiKey?.value || '',
      environment: bankingConfig.parameters.environment?.value || 'sandbox',
    }
  }

  private loadFromLocalStorage(): ServiceConfig[] {
    try {
      // Support both legacy and current storage keys
      const storedNew = localStorage.getItem('serviceConfigurations')
      const storedOld = localStorage.getItem('service-configurations')
      const raw = storedNew || storedOld
      if (raw) {
        const configs = Array.isArray(JSON.parse(raw))
          ? JSON.parse(raw)
          : Object.values(JSON.parse(raw))
        this.configs = configs
        this.cacheExpiry = Date.now() + this.CACHE_DURATION
        return configs
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error)
    }

    // Return empty array if no stored configs
    return []
  }

  // Clear cache to force reload
  clearCache(): void {
    this.configs = []
    this.cacheExpiry = 0
  }
}

// Export singleton instance
export const configService = ConfigService.getInstance()
