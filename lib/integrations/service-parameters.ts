// Service parameter definitions and validation
export interface ServiceParameter {
  value: string
  type: 'text' | 'password' | 'url' | 'number' | 'textarea'
  required: boolean
  description: string
  placeholder?: string
  validation?: {
    min?: number
    max?: number
    pattern?: string
    custom?: (value: string) => boolean
  }
}

export interface ServiceDefinition {
  id: string
  name: string
  category: string
  description: string
  parameters: Record<string, ServiceParameter>
  icon?: string
  documentationUrl?: string
}

// Predefined service configurations
export const SERVICE_DEFINITIONS: Record<string, ServiceDefinition> = {
  openai: {
    id: 'openai',
    name: 'OpenAI API',
    category: 'AI Services',
    description: 'Configure OpenAI API for GPT models and embeddings',
    icon: '🤖',
    documentationUrl: 'https://platform.openai.com/docs',
    parameters: {
      apiKey: {
        value: '',
        type: 'password',
        required: true,
        description: 'Your OpenAI API key for GPT models',
        placeholder: 'sk-...',
        validation: {
          pattern: '^sk-[A-Za-z0-9]{48}$',
          custom: (value) => value.startsWith('sk-') && value.length >= 50
        }
      },
      model: {
        value: 'gpt-4',
        type: 'text',
        required: true,
        description: 'Default model to use (gpt-4, gpt-3.5-turbo, etc.)',
        placeholder: 'gpt-4',
        validation: {
          custom: (value) => ['gpt-4', 'gpt-3.5-turbo', 'gpt-4-turbo'].includes(value)
        }
      },
      maxTokens: {
        value: '4000',
        type: 'number',
        required: false,
        description: 'Maximum tokens per request',
        placeholder: '4000',
        validation: {
          min: 1,
          max: 32000
        }
      },
      temperature: {
        value: '0.7',
        type: 'number',
        required: false,
        description: 'Response creativity (0.0 to 1.0)',
        placeholder: '0.7',
        validation: {
          min: 0,
          max: 1
        }
      }
    }
  },
  
  anthropic: {
    id: 'anthropic',
    name: 'Anthropic Claude',
    category: 'AI Services',
    description: 'Configure Anthropic API for Claude models',
    icon: '🧠',
    documentationUrl: 'https://docs.anthropic.com',
    parameters: {
      apiKey: {
        value: '',
        type: 'password',
        required: true,
        description: 'Your Anthropic API key for Claude models',
        placeholder: 'sk-ant-...',
        validation: {
          pattern: '^sk-ant-[A-Za-z0-9]{48}$',
          custom: (value) => value.startsWith('sk-ant-') && value.length >= 55
        }
      },
      model: {
        value: 'claude-3-sonnet-20240229',
        type: 'text',
        required: true,
        description: 'Claude model version',
        placeholder: 'claude-3-sonnet-20240229',
        validation: {
          custom: (value) => value.startsWith('claude-3-')
        }
      },
      maxTokens: {
        value: '4000',
        type: 'number',
        required: false,
        description: 'Maximum tokens per request',
        placeholder: '4000',
        validation: {
          min: 1,
          max: 200000
        }
      }
    }
  },
  
  pinecone: {
    id: 'pinecone',
    name: 'Pinecone Vector Database',
    category: 'Vector Database',
    description: 'Configure Pinecone for vector storage and retrieval',
    icon: '🌲',
    documentationUrl: 'https://docs.pinecone.io',
    parameters: {
      apiKey: {
        value: '',
        type: 'password',
        required: true,
        description: 'Your Pinecone API key',
        placeholder: '...',
        validation: {
          custom: (value) => value.length >= 20
        }
      },
      environment: {
        value: '',
        type: 'text',
        required: true,
        description: 'Pinecone environment (e.g., us-west1-gcp)',
        placeholder: 'us-west1-gcp',
        validation: {
          pattern: '^[a-z0-9-]+$'
        }
      },
      indexName: {
        value: 'cfo-knowledge',
        type: 'text',
        required: true,
        description: 'Name of your Pinecone index',
        placeholder: 'cfo-knowledge',
        validation: {
          pattern: '^[a-z0-9-]+$',
          custom: (value) => value.length >= 3 && value.length <= 45
        }
      }
    }
  },
  
  quickbooks: {
    id: 'quickbooks',
    name: 'QuickBooks Online',
    category: 'Accounting',
    description: 'Configure QuickBooks Online integration',
    icon: '📊',
    documentationUrl: 'https://developer.intuit.com',
    parameters: {
      clientId: {
        value: '',
        type: 'text',
        required: true,
        description: 'QuickBooks App Client ID',
        placeholder: 'QB123456789',
        validation: {
          pattern: '^QB[0-9]+$',
          custom: (value) => value.startsWith('QB') && value.length >= 10
        }
      },
      clientSecret: {
        value: '',
        type: 'password',
        required: true,
        description: 'QuickBooks App Client Secret',
        placeholder: '****',
        validation: {
          custom: (value) => value.length >= 20
        }
      },
      companyId: {
        value: '',
        type: 'text',
        required: true,
        description: 'QuickBooks Company ID',
        placeholder: '123456789',
        validation: {
          pattern: '^[0-9]+$',
          custom: (value) => value.length >= 5
        }
      },
      webhookUrl: {
        value: '',
        type: 'url',
        required: false,
        description: 'Webhook URL for real-time updates',
        placeholder: 'https://api.cfo.ai/webhooks/quickbooks',
        validation: {
          pattern: '^https://.*',
          custom: (value) => value === '' || value.startsWith('https://')
        }
      }
    }
  },
  
  banking: {
    id: 'banking',
    name: 'Banking API',
    category: 'Financial Data',
    description: 'Configure banking API for transaction data',
    icon: '🏦',
    documentationUrl: 'https://developer.bank.com',
    parameters: {
      apiKey: {
        value: '',
        type: 'password',
        required: true,
        description: 'Banking API key for transaction data',
        placeholder: '****',
        validation: {
          custom: (value) => value.length >= 20
        }
      },
      baseUrl: {
        value: '',
        type: 'url',
        required: true,
        description: 'Banking API base URL',
        placeholder: 'https://api.bank.com/v1',
        validation: {
          pattern: '^https://.*',
          custom: (value) => value.startsWith('https://')
        }
      },
      accountIds: {
        value: '',
        type: 'textarea',
        required: true,
        description: 'Comma-separated list of account IDs to sync',
        placeholder: 'acc_123,acc_456,acc_789',
        validation: {
          custom: (value) => value.split(',').every(id => id.trim().length > 0)
        }
      }
    }
  }
}

// Validation functions
export function validateParameter(value: string, parameter: ServiceParameter): { valid: boolean; error?: string } {
  if (parameter.required && (!value || value.trim() === '')) {
    return { valid: false, error: 'This field is required' }
  }

  if (!value || value.trim() === '') {
    return { valid: true } // Optional field, empty is OK
  }

  const validation = parameter.validation
  if (!validation) {
    return { valid: true }
  }

  // Pattern validation
  if (validation.pattern && !new RegExp(validation.pattern).test(value)) {
    return { valid: false, error: 'Invalid format' }
  }

  // Number validation
  if (parameter.type === 'number') {
    const numValue = parseFloat(value)
    if (isNaN(numValue)) {
      return { valid: false, error: 'Must be a valid number' }
    }
    
    if (validation.min !== undefined && numValue < validation.min) {
      return { valid: false, error: `Must be at least ${validation.min}` }
    }
    
    if (validation.max !== undefined && numValue > validation.max) {
      return { valid: false, error: `Must be at most ${validation.max}` }
    }
  }

  // URL validation
  if (parameter.type === 'url') {
    try {
      new URL(value)
    } catch {
      return { valid: false, error: 'Must be a valid URL' }
    }
  }

  // Custom validation
  if (validation.custom && !validation.custom(value)) {
    return { valid: false, error: 'Invalid value' }
  }

  return { valid: true }
}

// Get service definition by ID
export function getServiceDefinition(serviceId: string): ServiceDefinition | undefined {
  return SERVICE_DEFINITIONS[serviceId]
}

// Get all service definitions
export function getAllServiceDefinitions(): ServiceDefinition[] {
  return Object.values(SERVICE_DEFINITIONS)
}

// Get service definitions by category
export function getServiceDefinitionsByCategory(category: string): ServiceDefinition[] {
  return Object.values(SERVICE_DEFINITIONS).filter(service => service.category === category)
}












