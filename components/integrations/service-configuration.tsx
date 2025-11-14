"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
// // import { Textarea } from "@/components/ui/textarea" // Commented out to fix module resolution
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Settings, 
  Key, 
  Database, 
  Cloud, 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Save,
  TestTube,
  Eye,
  EyeOff,
  DollarSign,
  Download,
  Loader2,
  Webhook
} from "lucide-react"

const sanitizeBaseUrl = (input: string) => {
  const trimmed = input?.trim() ?? ""
  if (!trimmed) return ""
  return trimmed.replace(/\/+$/, "")
}

const deriveBaseUrlFromRedirect = (url?: string) => {
  if (!url) return ""
  try {
    const parsed = new URL(url)
    return `${parsed.protocol}//${parsed.host}`
  } catch {
    return ""
  }
}

interface ServiceConfig {
  id: string
  name: string
  category: string
  enabled: boolean
  parameters: {
    [key: string]: {
      value: string
      type: 'text' | 'password' | 'url' | 'number' | 'textarea'
      required: boolean
      description: string
      placeholder?: string
    }
  }
  lastUpdated?: string
  status: 'active' | 'error' | 'warning' | 'inactive'
}

type ServiceParameterConfig = ServiceConfig['parameters'][string]

export function ServiceConfiguration() {
  const resolveAppOrigin = () => {
    const explicitQuickBooksUrl = process.env.NEXT_PUBLIC_QUICKBOOKS_PUBLIC_URL?.trim()
    if (explicitQuickBooksUrl) {
      return sanitizeBaseUrl(explicitQuickBooksUrl)
    }

    if (typeof window !== 'undefined' && window.location.origin) {
      return sanitizeBaseUrl(window.location.origin)
    }

    const envOrigin = process.env.NEXT_PUBLIC_APP_URL?.trim()
    if (envOrigin && envOrigin.length > 0) {
      return sanitizeBaseUrl(envOrigin)
    }

    return sanitizeBaseUrl('https://fingenieai.com')
  }

  const defaultAppOrigin = resolveAppOrigin()
  const defaultQuickBooksRedirect = `${defaultAppOrigin}/api/integrations/quickbooks/oauth`
  const defaultQuickBooksWebhook = `${defaultAppOrigin}/api/integrations/quickbooks/webhooks`

  const ensureParameterObject = (
    param: ServiceParameterConfig | undefined,
    defaults: ServiceParameterConfig
  ): ServiceParameterConfig => {
    if (param && typeof param === 'object' && 'value' in param) {
      return {
        ...defaults,
        ...param,
        value: typeof param.value === 'string' ? param.value : defaults.value
      }
    }
    return defaults
  }

  const applyQuickBooksDefaults = (config: ServiceConfig): ServiceConfig => {
    if (config.id !== 'quickbooks') return config

    const params: Record<string, ServiceParameterConfig> = {
      ...(config.parameters || {})
    }

    const clientSecretDefaults: ServiceParameterConfig = {
      value: '',
      type: 'password',
      required: true,
      description: 'QuickBooks App Client Secret (required for OAuth token exchange)',
      placeholder: 'Enter the client secret from developer.intuit.com'
    }
    const publicBaseDefaults: ServiceParameterConfig = {
      value: defaultAppOrigin,
      type: 'url',
      required: false,
      description: 'Optional override for the public base URL (e.g., https://your-subdomain.localhost.run)',
      placeholder: 'https://your-subdomain.localhost.run'
    }
    const redirectDefaults: ServiceParameterConfig = {
      value: defaultQuickBooksRedirect,
      type: 'url',
      required: true,
      description: 'OAuth redirect URI (must match EXACTLY what is registered in QuickBooks Developer Portal - no trailing slash, case-sensitive)',
      placeholder: defaultQuickBooksRedirect
    }
    const webhookDefaults: ServiceParameterConfig = {
      value: defaultQuickBooksWebhook,
      type: 'url',
      required: false,
      description: 'Webhook endpoint URL for receiving QuickBooks notifications',
      placeholder: defaultQuickBooksWebhook
    }

    const clientSecretParam = ensureParameterObject(params.clientSecret, clientSecretDefaults)
    const publicBaseParam = ensureParameterObject(params.publicBaseUrl, publicBaseDefaults)
    const redirectParam = ensureParameterObject(params.redirectUri, redirectDefaults)
    const webhookParam = ensureParameterObject(params.webhookUrl, webhookDefaults)

    const derivedBaseFromRedirect = sanitizeBaseUrl(deriveBaseUrlFromRedirect(redirectParam.value))
    const resolvedBase = sanitizeBaseUrl(publicBaseParam.value) || derivedBaseFromRedirect || defaultAppOrigin

    const normalizedPublicBase: ServiceParameterConfig = {
      ...publicBaseParam,
      value: resolvedBase
    }
    const redirectValue = `${resolvedBase}/api/integrations/quickbooks/oauth`
    const webhookValue = `${resolvedBase}/api/integrations/quickbooks/webhooks`

    const normalizedRedirect: ServiceParameterConfig = {
      ...redirectParam,
      value: redirectValue,
      placeholder: redirectParam.placeholder || redirectValue
    }
    const normalizedWebhook: ServiceParameterConfig = {
      ...webhookParam,
      value: webhookValue,
      placeholder: webhookParam.placeholder || webhookValue
    }

    return {
      ...config,
      parameters: {
        ...params,
        clientSecret: {
          ...clientSecretParam,
          required: true
        },
        publicBaseUrl: normalizedPublicBase,
        redirectUri: normalizedRedirect,
        webhookUrl: normalizedWebhook
      }
    }
  }

  const normalizeConfigs = (incoming: ServiceConfig[]) =>
    incoming.map(config => applyQuickBooksDefaults(config))

  const [isHydrated, setIsHydrated] = useState(false)
  const [configs, setConfigs] = useState<ServiceConfig[]>([])
  const [activeConfig, setActiveConfig] = useState<string | null>(null)
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({})
  const [isLoading, setIsLoading] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [isImporting, setIsImporting] = useState(false)
  const [importStatus, setImportStatus] = useState<'idle' | 'importing' | 'success' | 'error'>('idle')
  const [importMessage, setImportMessage] = useState<string>('')
  const [importedData, setImportedData] = useState<any>(null)
  const [isRegisteringWebhook, setIsRegisteringWebhook] = useState(false)
  const [webhookStatus, setWebhookStatus] = useState<'idle' | 'registering' | 'success' | 'error'>('idle')
  const [webhookMessage, setWebhookMessage] = useState<string>('')
  const [oauthError, setOauthError] = useState<string | null>(null)
  const [oauthSuccess, setOauthSuccess] = useState<string | null>(null)
  const [testConnectionResult, setTestConnectionResult] = useState<{
    serviceId: string
    success: boolean
    message: string
    details?: string
  } | null>(null)

  // Avoid hydration mismatch by rendering only after mount
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Read error/success messages from URL query parameters
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const params = new URLSearchParams(window.location.search)
    const error = params.get('error')
    const success = params.get('success')
    const companyId = params.get('companyId')
    
    if (error) {
      setOauthError(decodeURIComponent(error))
      // Clear the error from URL after displaying
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('error')
      window.history.replaceState({}, '', newUrl.toString())
    }
    
    if (success) {
      setOauthSuccess(decodeURIComponent(success) + (companyId ? ` (Company ID: ${companyId})` : ''))
      // Clear the success from URL after displaying
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('success')
      newUrl.searchParams.delete('companyId')
      window.history.replaceState({}, '', newUrl.toString())
    }
  }, [])

  // Ensure QuickBooks shows active when a Company ID is present
  useEffect(() => {
    if (!isHydrated || configs.length === 0) return
    const qb = configs.find(c => c.id === 'quickbooks')
    const companyId = (qb as any)?.parameters?.companyId?.value
    if (qb && companyId && qb.status !== 'active') {
      const updated: ServiceConfig[] = configs.map(c => 
        c.id === 'quickbooks' 
          ? { ...c, status: 'active' as const, enabled: true, lastUpdated: new Date().toISOString() } 
          : c
      )
      setConfigs(updated)
      try {
        const saved = JSON.parse(localStorage.getItem('serviceConfigurations') || '{}')
        saved['quickbooks'] = updated.find(c => c.id === 'quickbooks')
        localStorage.setItem('serviceConfigurations', JSON.stringify(saved))
        const asArray = Object.values(saved)
        localStorage.setItem('service-configurations', JSON.stringify(asArray))
      } catch {}
    }
  }, [isHydrated, configs])

  // Auto-enable OpenAI/Anthropic when API key is present
  useEffect(() => {
    if (!isHydrated || configs.length === 0) return
    
    const llmServices = ['openai', 'anthropic']
    let updated = false
    const updatedConfigs = configs.map(c => {
      if (llmServices.includes(c.id)) {
        const apiKey = c.parameters?.apiKey?.value
        if (apiKey && apiKey.trim() !== '' && !c.enabled) {
          updated = true
          return { ...c, enabled: true, status: 'active' as const, lastUpdated: new Date().toISOString() }
        }
      }
      return c
    })

    if (updated) {
      setConfigs(updatedConfigs)
      try {
        const saved = JSON.parse(localStorage.getItem('serviceConfigurations') || '{}')
        updatedConfigs.forEach(config => {
          if (llmServices.includes(config.id) && config.enabled) {
            saved[config.id] = config
          }
        })
        localStorage.setItem('serviceConfigurations', JSON.stringify(saved))
        const asArray = Object.values(saved)
        localStorage.setItem('service-configurations', JSON.stringify(asArray))
      } catch {}
    }
  }, [isHydrated, configs])

  // Do not early-return before hooks; gate rendering in JSX instead

  // Load configurations from API or use mock data
  useEffect(() => {
    const loadConfigurations = async () => {
      try {
        const response = await fetch('/api/integrations/configuration')
        if (response.ok) {
          const data = await response.json()
          // If API returns empty array, use mock data
          if (data.configurations && data.configurations.length > 0) {
            setConfigs(normalizeConfigs(data.configurations))
          } else {
            // Try client-side saved configurations first
            const saved = localStorage.getItem('serviceConfigurations')
            if (saved) {
              const savedObj = JSON.parse(saved)
              const restored: ServiceConfig[] = Object.values(savedObj)
              if (restored.length > 0) {
                console.log('Restoring configurations from localStorage')
                setConfigs(normalizeConfigs(restored))
                return
              }
            }

            console.log('API returned empty configurations, using mock data')
            loadMockConfigurations()
          }
        } else {
          console.error('Failed to load configurations, using mock data')
          // Use mock data if API fails
          const saved = localStorage.getItem('serviceConfigurations')
          if (saved) {
            const savedObj = JSON.parse(saved)
            const restored: ServiceConfig[] = Object.values(savedObj)
            if (restored.length > 0) {
              console.log('Restoring configurations from localStorage')
              setConfigs(normalizeConfigs(restored))
              return
            }
          }
          loadMockConfigurations()
        }
      } catch (error) {
        console.error('Error loading configurations, using mock data:', error)
        const saved = localStorage.getItem('serviceConfigurations')
        if (saved) {
          const savedObj = JSON.parse(saved)
          const restored: ServiceConfig[] = Object.values(savedObj)
          if (restored.length > 0) {
            console.log('Restoring configurations from localStorage')
            setConfigs(normalizeConfigs(restored))
            return
          }
        }
        loadMockConfigurations()
      }
    }

  const loadMockConfigurations = () => {
    // Import backup configuration to ensure Company ID is preserved
    import('@/lib/integrations/quickbooks-backup')
      .then(({ QUICKBOOKS_BACKUP_CONFIG }) => {
        console.log('Loading QuickBooks backup config with Company ID:', QUICKBOOKS_BACKUP_CONFIG.companyId)
      })
      .catch((err) => {
        console.warn('QuickBooks backup import skipped:', err?.message || err)
      })

    const mockConfigs: ServiceConfig[] = [
        {
          id: 'openai',
          name: 'OpenAI API',
          category: 'AI Services',
          enabled: false,
          status: 'inactive',
          parameters: {
            apiKey: {
              value: '',
              type: 'password',
              required: true,
              description: 'Your OpenAI API key for GPT models',
              placeholder: 'sk-...'
            },
            model: {
              value: 'gpt-4',
              type: 'text',
              required: true,
              description: 'Default model to use (gpt-4, gpt-3.5-turbo, etc.)',
              placeholder: 'gpt-4'
            },
            maxTokens: {
              value: '4000',
              type: 'number',
              required: false,
              description: 'Maximum tokens per request',
              placeholder: '4000'
            },
            temperature: {
              value: '0.7',
              type: 'number',
              required: false,
              description: 'Response creativity (0.0 to 1.0)',
              placeholder: '0.7'
            }
          }
        },
        {
          id: 'anthropic',
          name: 'Anthropic Claude',
          category: 'AI Services',
          enabled: false,
          status: 'inactive',
          parameters: {
            apiKey: {
              value: '',
              type: 'password',
              required: true,
              description: 'Your Anthropic API key for Claude models',
              placeholder: 'sk-ant-...'
            },
            model: {
              value: 'claude-3-sonnet-20240229',
              type: 'text',
              required: true,
              description: 'Claude model version',
              placeholder: 'claude-3-sonnet-20240229'
            },
            maxTokens: {
              value: '4000',
              type: 'number',
              required: false,
              description: 'Maximum tokens per request',
              placeholder: '4000'
            }
          }
        },
        {
          id: 'pinecone',
          name: 'Pinecone Vector Database',
          category: 'Vector Database',
          enabled: false,
          status: 'inactive',
          parameters: {
            apiKey: {
              value: '',
              type: 'password',
              required: true,
              description: 'Your Pinecone API key',
              placeholder: '...'
            },
            environment: {
              value: 'us-east1-gcp',
              type: 'text',
              required: true,
              description: 'Pinecone environment (e.g., us-east1-gcp)',
              placeholder: 'us-east1-gcp'
            },
            indexName: {
              value: 'cfo-docs',
              type: 'text',
              required: true,
              description: 'Name of your Pinecone index',
              placeholder: 'cfo-docs'
            }
          }
        },
        {
          id: 'postgres',
          name: 'PostgreSQL + pgvector',
          category: 'Vector Database',
          enabled: false,
          status: 'inactive',
          parameters: {
            databaseUrl: {
              value: '',
              type: 'password',
              required: true,
              description: 'PostgreSQL connection string',
              placeholder: 'postgres://user:pass@localhost:5432/ascension'
            },
            embedDim: {
              value: '1536',
              type: 'number',
              required: true,
              description: 'Vector embedding dimension',
              placeholder: '1536'
            }
          }
        },
        {
          id: 'quickbooks',
          name: 'QuickBooks Online',
          category: 'Financial Data',
          enabled: false,
          status: 'inactive',
          parameters: {
            companyId: {
              value: '',
              type: 'text',
              required: true,
              description: 'Your QuickBooks Company ID (found in Settings → Company Settings)',
              placeholder: '1234567890'
            },
            clientId: {
              value: '',
              type: 'text',
              required: true,
              description: 'QuickBooks App Client ID',
              placeholder: 'xxx'
            },
            clientSecret: {
              value: '',
              type: 'password',
              required: true,
              description: 'QuickBooks App Client Secret (required for OAuth token exchange)',
              placeholder: 'Enter the client secret from developer.intuit.com'
            },
            publicBaseUrl: {
              value: defaultAppOrigin,
              type: 'url',
              required: false,
              description: 'Optional override for the public base URL (e.g., https://your-subdomain.localhost.run)',
              placeholder: 'https://your-subdomain.localhost.run'
            },
            redirectUri: {
              value: defaultQuickBooksRedirect,
              type: 'url',
              required: true,
              description: 'OAuth redirect URI (must match EXACTLY what is registered in QuickBooks Developer Portal - no trailing slash, case-sensitive)',
              placeholder: defaultQuickBooksRedirect
            },
            environment: {
              value: 'sandbox',
              type: 'text',
              required: true,
              description: 'Environment (sandbox or production)',
              placeholder: 'sandbox'
            },
            webhookUrl: {
              value: defaultQuickBooksWebhook,
              type: 'url',
              required: false,
              description: 'Webhook endpoint URL for receiving QuickBooks notifications',
              placeholder: defaultQuickBooksWebhook
            },
            webhookVerifierToken: {
              value: '',
              type: 'password',
              required: false,
              description: 'Webhook verifier token (provided by QuickBooks when registering webhook)',
              placeholder: 'Enter verifier token from QuickBooks Developer Portal'
            }
          }
        },
        {
          id: 'banking',
          name: 'Bank API (Plaid)',
          category: 'Financial Data',
          enabled: false,
          status: 'inactive',
          parameters: {
            apiKey: {
              value: '',
              type: 'password',
              required: true,
              description: 'Plaid API key or client ID',
              placeholder: 'plaid_secret'
            },
            environment: {
              value: 'sandbox',
              type: 'text',
              required: true,
              description: 'Environment (sandbox or production)',
              placeholder: 'sandbox'
            }
          }
        },
        {
          id: 'datadog',
          name: 'Datadog Monitoring',
          category: 'Monitoring',
          enabled: false,
          status: 'inactive',
          parameters: {
            apiKey: {
              value: '',
              type: 'password',
              required: true,
              description: 'Datadog API key',
              placeholder: 'xxx'
            }
          }
        },
        {
          id: 'newrelic',
          name: 'New Relic Monitoring',
          category: 'Monitoring',
          enabled: false,
          status: 'inactive',
          parameters: {
            licenseKey: {
              value: '',
              type: 'password',
              required: true,
              description: 'New Relic license key',
              placeholder: 'xxx'
            },
            appName: {
              value: 'ascension-cfo-api',
              type: 'text',
              required: true,
              description: 'Application name in New Relic',
              placeholder: 'ascension-cfo-api'
            }
          }
        },
        {
          id: 'app',
          name: 'Application Settings',
          category: 'Application',
          enabled: true,
          status: 'active',
          parameters: {
            port: {
              value: '3000',
              type: 'number',
              required: true,
              description: 'Application port',
              placeholder: '3000'
            },
            nodeEnv: {
              value: 'development',
              type: 'text',
              required: true,
              description: 'Node environment',
              placeholder: 'development'
            }
          }
        }
      ]
      console.log('Loading mock configurations:', mockConfigs.length, 'services')
      setConfigs(normalizeConfigs(mockConfigs))
    }

    loadConfigurations()
  }, [])

  const handleParameterChange = (configId: string, paramKey: string, rawValue: string) => {
    const sanitizedValue = configId === 'quickbooks' && paramKey === 'publicBaseUrl'
      ? sanitizeBaseUrl(rawValue)
      : rawValue

    setConfigs(prev => prev.map(config => {
      if (config.id !== configId) return config

      const existingParam = config.parameters?.[paramKey]
      const updatedParameters = {
        ...config.parameters,
        [paramKey]: {
          ...(existingParam ?? {
            value: '',
            type: 'text',
            required: false,
            description: ''
          }),
          value: sanitizedValue
        }
      }

      if (configId === 'quickbooks' && paramKey === 'publicBaseUrl') {
        const base = sanitizeBaseUrl(sanitizedValue) || defaultAppOrigin
        const redirectTemplate = config.parameters?.redirectUri ?? {
          value: defaultQuickBooksRedirect,
          type: 'url' as const,
          required: true,
          description: 'OAuth redirect URI (must match EXACTLY what is registered in QuickBooks Developer Portal - no trailing slash, case-sensitive)',
          placeholder: defaultQuickBooksRedirect
        }
        const webhookTemplate = config.parameters?.webhookUrl ?? {
          value: defaultQuickBooksWebhook,
          type: 'url' as const,
          required: false,
          description: 'Webhook endpoint URL for receiving QuickBooks notifications',
          placeholder: defaultQuickBooksWebhook
        }

        const newRedirectUri = `${base}/api/integrations/quickbooks/oauth`
        const newWebhookUrl = `${base}/api/integrations/quickbooks/webhooks`

        updatedParameters.redirectUri = {
          ...redirectTemplate,
          value: newRedirectUri,
          placeholder: redirectTemplate.placeholder || newRedirectUri
        }
        updatedParameters.webhookUrl = {
          ...webhookTemplate,
          value: newWebhookUrl,
          placeholder: webhookTemplate.placeholder || newWebhookUrl
        }
      }

      return {
        ...config,
        parameters: updatedParameters
      }
    }))
  }

  const handleToggleService = (configId: string, enabled: boolean) => {
    setConfigs(prev => prev.map(config => 
      config.id === configId 
        ? {
            ...config,
            enabled,
            status: enabled ? 'active' : 'inactive'
          }
        : config
    ))
  }

  const handleSaveConfig = async (configId: string) => {
    setIsLoading(true)
    setSaveStatus('saving')
    
    try {
      const config = configs.find(c => c.id === configId)
      if (!config) return

      // For now, just save to localStorage since API might not be ready
      const savedConfigs = JSON.parse(localStorage.getItem('serviceConfigurations') || '{}')
      // Auto-enable if API key is present (for OpenAI/Anthropic) or Company ID (for QuickBooks)
      const checkHasApiKey = config.parameters?.apiKey?.value && config.parameters.apiKey.value.trim() !== ''
      const checkHasCompanyId = configId === 'quickbooks' && config.parameters?.companyId?.value && config.parameters.companyId.value.trim() !== ''
      const shouldEnable = checkHasApiKey || checkHasCompanyId || config.enabled
      savedConfigs[configId] = {
        ...config,
        enabled: shouldEnable,
        lastUpdated: new Date().toISOString(),
        status: shouldEnable ? 'active' : config.status || 'inactive'
      }
      localStorage.setItem('serviceConfigurations', JSON.stringify(savedConfigs))
      // Write a compatible array form too, for consumers that expect an array
      try {
        const asArray = Object.values(savedConfigs)
        localStorage.setItem('service-configurations', JSON.stringify(asArray))
      } catch {}

      // Try API call as well
      try {
        const response = await fetch('/api/integrations/configuration', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            serviceId: configId,
            parameters: config.parameters,
            enabled: shouldEnable
          })
        })

        if (response.ok) {
          const data = await response.json()
          console.log('Configuration saved to API:', data)
        }
      } catch (apiError) {
        console.log('API save failed, using localStorage:', apiError)
      }
      
      // Recalculate shouldEnable to ensure consistency (use same logic as above)
      const finalShouldEnable = shouldEnable
      
      setConfigs(prev => prev.map(c => 
        c.id === configId 
          ? {
              ...c,
              enabled: finalShouldEnable,
              lastUpdated: new Date().toISOString(),
              status: finalShouldEnable ? 'active' : c.status || 'inactive'
            }
          : c
      ))
      
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch (error) {
      console.error('Error saving configuration:', error)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestConnection = async (configId: string) => {
    setIsLoading(true)
    // Clear previous result for this service
    setTestConnectionResult(prev => prev?.serviceId === configId ? null : prev)
    
    try {
      const cfg = configs.find(c => c.id === configId)
      if (!cfg) {
        setTestConnectionResult({
          serviceId: configId,
          success: false,
          message: 'Configuration not found',
          details: 'Unable to locate service configuration'
        })
        return
      }

      // Flatten parameter values for API (convert { value, type, ... } → raw value)
      const flatParams = Object.fromEntries(
        Object.entries(cfg.parameters || {}).map(([k, v]: any) => [k, v?.value ?? ''])
      )

      // For QuickBooks, perform detailed validation before API call
      if (configId === 'quickbooks') {
        const companyId = flatParams.companyId || ''
        const clientId = flatParams.clientId || ''
        const clientSecret = flatParams.clientSecret || ''
        const accessToken = flatParams.accessToken || ''
        const realmId = flatParams.realmId || ''
        const environment = flatParams.environment || 'sandbox'

        // Check if we have OAuth tokens (real connection)
        if (accessToken && realmId) {
          // Test with real API
          const response = await fetch('/api/integrations/configuration', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              serviceId: configId,
              parameters: flatParams
            })
          })

          if (response.ok) {
            const data = await response.json()
            setTestConnectionResult({
              serviceId: configId,
              success: data.success,
              message: data.message || (data.success ? 'QuickBooks OAuth connection verified' : 'QuickBooks connection test failed'),
              details: data.details || (data.success 
                ? `Successfully connected to QuickBooks ${environment === 'production' ? 'Production' : 'Sandbox'} environment. Company ID: ${realmId}`
                : 'Please check your OAuth tokens. They may be expired or invalid.')
            })
            
            setConfigs(prev => prev.map(config => 
              config.id === configId 
                ? {
                    ...config,
                    status: data.success ? 'active' : 'error',
                    enabled: data.success ? true : config.enabled
                  }
                : config
            ))
          } else {
            const errorData = await response.json().catch(() => ({}))
            setTestConnectionResult({
              serviceId: configId,
              success: false,
              message: errorData.message || 'Connection test failed',
              details: `HTTP ${response.status}: ${response.statusText}. ${errorData.details || 'Please check your configuration and try again.'}`
            })
          }
          return
        }

        // Check if we have Company ID but no OAuth (demo/sandbox mode)
        if (companyId && !accessToken) {
          if (!clientId || !clientSecret) {
            setTestConnectionResult({
              serviceId: configId,
              success: false,
              message: 'Incomplete QuickBooks configuration',
              details: 'Company ID is present but Client ID and Client Secret are required for OAuth connection. Please configure all required fields and click "Connect" to complete OAuth flow.'
            })
            return
          }

          // Test connection with Company ID only (demo mode)
          const response = await fetch('/api/integrations/configuration', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              serviceId: configId,
              parameters: flatParams
            })
          })

          if (response.ok) {
            const data = await response.json()
            setTestConnectionResult({
              serviceId: configId,
              success: data.success,
              message: data.message || 'QuickBooks Company ID verified',
              details: data.details || (data.success
                ? `Company ID verified (${environment} mode). To access real data, complete OAuth connection by clicking "Connect" button.`
                : 'Company ID validation failed. Please verify your Company ID in QuickBooks Settings → Company Settings.')
            })
            
            setConfigs(prev => prev.map(config => 
              config.id === configId 
                ? {
                    ...config,
                    status: data.success ? 'active' : 'error',
                    enabled: data.success ? true : config.enabled
                  }
                : config
            ))
          } else {
            const errorData = await response.json().catch(() => ({}))
            setTestConnectionResult({
              serviceId: configId,
              success: false,
              message: errorData.message || 'Connection test failed',
              details: errorData.details || 'Please check your configuration and try again.'
            })
          }
          return
        }

        // No Company ID or OAuth tokens
        setTestConnectionResult({
          serviceId: configId,
          success: false,
          message: 'QuickBooks not configured',
          details: 'Please provide either:\n1. Company ID (for demo/sandbox mode), or\n2. Complete OAuth connection with access tokens\n\nClick "Connect" to initiate OAuth flow.'
        })
        return
      }

      // For other services, use standard test
      const response = await fetch('/api/integrations/configuration', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId: configId,
          parameters: flatParams
        })
      })

      if (response.ok) {
        const data = await response.json()
        setTestConnectionResult({
          serviceId: configId,
          success: data.success,
          message: data.message || (data.success ? 'Connection successful' : 'Connection failed'),
          details: data.details
        })
        
        setConfigs(prev => prev.map(config => 
          config.id === configId 
            ? {
                ...config,
                status: data.success ? 'active' : 'error',
                enabled: data.success ? true : config.enabled
              }
            : config
        ))
      } else {
        const errorData = await response.json().catch(() => ({}))
        setTestConnectionResult({
          serviceId: configId,
          success: false,
          message: errorData.message || 'Connection test failed',
          details: `HTTP ${response.status}: ${response.statusText}`
        })
      }
    } catch (error: any) {
      console.error('Error testing connection:', error)
      setTestConnectionResult({
        serviceId: configId,
        success: false,
        message: 'Connection test error',
        details: error.message || 'An unexpected error occurred while testing the connection. Please try again.'
      })
      setConfigs(prev => prev.map(config => 
        config.id === configId 
          ? {
              ...config,
              status: 'error'
            }
          : config
      ))
    } finally {
      setIsLoading(false)
    }
  }

  const handleConnectQuickBooks = async (configId: string) => {
    if (configId !== 'quickbooks') return

    try {
      const config = configs.find(c => c.id === configId)
      if (!config) {
        throw new Error('QuickBooks configuration not found')
      }

      const hasClientId = config.parameters?.clientId?.value && config.parameters.clientId.value.trim() !== ''
      const hasClientSecret = config.parameters?.clientSecret?.value && config.parameters.clientSecret.value.trim() !== ''
      const hasRedirectUri = config.parameters?.redirectUri?.value && config.parameters.redirectUri.value.trim() !== ''

      if (!hasClientId || !hasClientSecret || !hasRedirectUri) {
        alert('Please configure Client ID, Client Secret, and Redirect URI before connecting.')
        return
      }

      const environment = config.parameters?.environment?.value || 'sandbox'
      // Normalize redirect URI - remove trailing slash and ensure exact match
      let redirectUri = config.parameters.redirectUri.value.trim()
      // Remove trailing slash if present (but keep root path)
      if (redirectUri.endsWith('/') && redirectUri !== 'http://' && redirectUri !== 'https://') {
        redirectUri = redirectUri.slice(0, -1)
      }
      
      // Warn if redirect URI is localhost (but don't override - use what user configured)
      const isLocalhost = redirectUri.includes('localhost') || redirectUri.includes('127.0.0.1') || redirectUri.includes('0.0.0.0')
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      
      if (isLocalhost && isLocal) {
        // Warn user but don't override their configured URL
        const useLocalhost = confirm(
          `⚠️ Localhost Redirect URI Detected\n\n` +
          `You're using a localhost redirect URI: ${redirectUri}\n\n` +
          `QuickBooks OAuth requires a publicly accessible URL.\n\n` +
          `If you're testing locally, you need:\n` +
          `1. A tunnel service (ngrok, localhost.run, etc.)\n` +
          `2. The tunnel URL configured in QuickBooks Developer Portal\n` +
          `3. The same URL in the Redirect URI field above\n\n` +
          `Click OK to continue with your configured URL, or Cancel to update it.`
        )
        
        if (!useLocalhost) {
          return // User wants to update the redirect URI
        }
        
        // Optional: Check if ngrok is running and suggest it (but don't force)
        try {
          const ngrokResponse = await fetch('http://localhost:4040/api/tunnels')
          if (ngrokResponse.ok) {
            const ngrokData = await ngrokResponse.json()
            const httpsTunnel = ngrokData.tunnels?.find((t: any) => t.proto === 'https')
            
            if (httpsTunnel) {
              const ngrokUrl = `${httpsTunnel.public_url}/api/integrations/quickbooks/oauth`
              const useNgrok = confirm(
                `Ngrok tunnel detected: ${ngrokUrl}\n\n` +
                `Would you like to use this ngrok URL instead?\n\n` +
                `Note: This URL must match what's configured in QuickBooks Developer Portal.`
              )
              
              if (useNgrok) {
                redirectUri = ngrokUrl
                // Update the form field as well
                handleParameterChange(config.id, 'redirectUri', ngrokUrl)
              }
            }
          }
        } catch (ngrokError) {
          // Ngrok not running - that's fine, use the configured URL
          console.log('Ngrok not available, using configured redirect URI:', redirectUri)
        }
      }
      
      // Validate redirect URI format
      try {
        const url = new URL(redirectUri)
        if (!url.pathname.endsWith('/api/integrations/quickbooks/oauth')) {
          alert(`Redirect URI must end with /api/integrations/quickbooks/oauth\n\nCurrent: ${redirectUri}\n\nPlease update it in QuickBooks Developer Portal if needed.`)
          return
        }
      } catch (e) {
        alert(`Invalid redirect URI format: ${redirectUri}\n\nPlease enter a valid URL.`)
        return
      }
      const companyId = config.parameters?.companyId?.value || ''
      
      // Store current config for OAuth callback
      localStorage.setItem('quickbooks-oauth-config', JSON.stringify({
        companyId,
        clientId: config.parameters.clientId.value,
        redirectUri,
        environment
      }))

      // Redirect to QuickBooks OAuth - uses appcenter.intuit.com for OAuth 2.0
      const baseUrl = 'https://appcenter.intuit.com'
      
      // Log the exact redirect URI being used for debugging
      console.log('QuickBooks OAuth - Redirect URI:', redirectUri)
      console.log('QuickBooks OAuth - Make sure this EXACT URI is in QuickBooks Developer Portal:', redirectUri)
      
      // Construct OAuth URL according to QuickBooks OAuth 2.0 specification
      // Format: GET https://appcenter.intuit.com/connect/oauth2?
      //   client_id=YOUR_CLIENT_ID&
      //   response_type=code&
      //   redirect_uri=URL_ENCODED_REDIRECT_URI&
      //   scope=com.intuit.quickbooks.accounting openid email&
      //   state=CSRF_TOKEN_OR_USER_ID
      const authUrl = `${baseUrl}/connect/oauth2?` +
        `client_id=${config.parameters.clientId.value}&` +
        `response_type=code&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${encodeURIComponent('com.intuit.quickbooks.accounting openid email')}&` +
        `access_type=offline&` +
        `state=${companyId ? `company_${companyId}` : `connect_${Date.now()}`}`
      
      console.log('QuickBooks OAuth URL constructed:', authUrl)
      window.location.href = authUrl
    } catch (error: any) {
      console.error('QuickBooks OAuth initiation error:', error)
      alert('Failed to initiate QuickBooks connection. Please check your configuration.')
    }
  }

  const handleImportQuickBooks = async (configId: string) => {
    if (configId !== 'quickbooks') return

    setIsImporting(true)
    setImportStatus('importing')
    setImportMessage('Connecting to QuickBooks...')

    try {
      const config = configs.find(c => c.id === configId)
      if (!config) {
        throw new Error('QuickBooks configuration not found')
      }

      // Check if we have minimum required fields (companyId or OAuth credentials)
      const hasCompanyId = config.parameters?.companyId?.value && config.parameters.companyId.value.trim() !== ''
      const hasClientId = config.parameters?.clientId?.value && config.parameters.clientId.value.trim() !== ''
      
      // Check if we have access token (OAuth completed)
      const hasAccessToken = config.parameters?.accessToken?.value || 
                            config.parameters?.accessToken ||
                            config.parameters?.access_token?.value ||
                            config.parameters?.access_token

      // If no OAuth tokens but have client ID, initiate OAuth flow
      if (!hasAccessToken && hasClientId) {
        setImportMessage('Initiating QuickBooks OAuth connection...')
        const environment = config.parameters?.environment?.value || 'sandbox'
        // Normalize redirect URI - remove trailing slash
        let redirectUri = (config.parameters?.redirectUri?.value || 'https://fingenieai.com/api/integrations/quickbooks/oauth').trim()
        if (redirectUri.endsWith('/') && redirectUri !== 'http://' && redirectUri !== 'https://') {
          redirectUri = redirectUri.slice(0, -1)
        }
        
        // Check if redirect URI is localhost (requires tunnel for local testing)
        const isLocalhost = redirectUri.includes('localhost') || redirectUri.includes('127.0.0.1') || redirectUri.includes('0.0.0.0')
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        
        if (isLocalhost && isLocal) {
          // Check if ngrok is available
          try {
            const ngrokResponse = await fetch('http://localhost:4040/api/tunnels')
            if (!ngrokResponse.ok) {
              throw new Error('Ngrok not running')
            }
            const ngrokData = await ngrokResponse.json()
            const httpsTunnel = ngrokData.tunnels?.find((t: any) => t.proto === 'https')
            
            if (httpsTunnel) {
              // Don't auto-override - use configured URL instead
              const ngrokUrl = `${httpsTunnel.public_url}/api/integrations/quickbooks/oauth`
              // redirectUri = ngrokUrl  // REMOVED: Don't override user's configured URL
              setImportMessage(`⚠️ Ngrok detected: ${ngrokUrl}\n\nUsing your configured redirect URI: ${redirectUri}\n\nMake sure this matches QuickBooks Developer Portal.`)
            } else {
              // No HTTPS tunnel - that's fine, use configured URL
              setImportMessage(`Using configured redirect URI: ${redirectUri}\n\nMake sure this matches your QuickBooks Developer Portal configuration.`)
            }
          } catch (ngrokError) {
            // Ngrok not running - that's fine, use the configured URL
            setImportMessage(`Using configured redirect URI: ${redirectUri}\n\nMake sure this matches your QuickBooks Developer Portal configuration.`)
          }
        }
        
        // Store current config for OAuth callback
        localStorage.setItem('quickbooks-import-config', JSON.stringify({
          companyId: config.parameters?.companyId?.value || '',
          clientId: config.parameters?.clientId?.value || '',
          redirectUri,
          environment
        }))

        // Redirect to QuickBooks OAuth - uses appcenter.intuit.com for OAuth 2.0
        const baseUrl = 'https://appcenter.intuit.com'
        
        // Construct OAuth URL according to QuickBooks OAuth 2.0 specification
        const authUrl = `${baseUrl}/connect/oauth2?` +
          `client_id=${config.parameters?.clientId?.value}&` +
          `response_type=code&` +
          `redirect_uri=${encodeURIComponent(redirectUri)}&` +
          `scope=${encodeURIComponent('com.intuit.quickbooks.accounting openid email')}&` +
          `access_type=offline&` +
          `state=import_${Date.now()}`
        
        console.log('QuickBooks OAuth URL (Import flow):', authUrl)

        window.location.href = authUrl
        return
      }

      // If we have company ID or existing tokens, try to import directly
      setImportMessage('Fetching company and account details...')
      
      const response = await fetch('/api/integrations/quickbooks/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyId: config.parameters?.companyId?.value || '',
          clientId: config.parameters?.clientId?.value || '',
          clientSecret: config.parameters?.clientSecret?.value || '',
          redirectUri: config.parameters?.redirectUri?.value || '',
          environment: config.parameters?.environment?.value || 'sandbox',
        })
      })

      const result = await response.json()
      
      // Handle error responses
      if (!response.ok || !result.success) {
        const errorMessage = result.error || 'Failed to import QuickBooks data'
        const errorDetails = result.details ? `\n\nDetails: ${result.details}` : ''
        const errorSuggestion = result.suggestion ? `\n\nSuggestion: ${result.suggestion}` : ''
        throw new Error(`${errorMessage}${errorDetails}${errorSuggestion}`)
      }

      if (result.data) {
        // Auto-populate configuration fields with imported data
        const updatedConfig = { ...config }
        
        // Update Company ID if we got it from the API
        if (result.data.companyId && !updatedConfig.parameters.companyId.value) {
          updatedConfig.parameters.companyId.value = result.data.companyId
        }
        
        // Update Company Name (if we have a display field, otherwise store in a note)
        if (result.data.companyName) {
          // Store company name for reference
          localStorage.setItem('quickbooks-company-name', result.data.companyName)
        }

        // Update accounts info (store in localStorage for now, could be stored in DB later)
        if (result.data.accounts && result.data.accounts.length > 0) {
          localStorage.setItem('quickbooks-accounts', JSON.stringify(result.data.accounts))
        }

        // Auto-enable if we have valid data
        if (result.data.companyId) {
          updatedConfig.enabled = true
          updatedConfig.status = 'active'
        }

        setConfigs(prev => prev.map(c => c.id === configId ? updatedConfig : c))
        
        // Persist to localStorage
        const savedConfigs = JSON.parse(localStorage.getItem('serviceConfigurations') || '{}')
        savedConfigs[configId] = updatedConfig
        localStorage.setItem('serviceConfigurations', JSON.stringify(savedConfigs))
        const asArray = Object.values(savedConfigs)
        localStorage.setItem('service-configurations', JSON.stringify(asArray))

        // Store imported data for CSV download
        setImportedData(result.data)
        
        setImportStatus('success')
        // Use API message if available, otherwise create default message
        const displayMessage = result.message || `Successfully imported! Company: ${result.data.companyName || 'N/A'}, Accounts: ${result.data.accounts?.length || 0}`
        setImportMessage(displayMessage)
        
        // Show warning if it's demo data
        if (result.warning || !result.data.isRealData) {
          console.warn('QuickBooks Import Warning:', result.warning || 'Demo/Mock data detected')
        }
        
        setTimeout(() => {
          setImportStatus('idle')
          setImportMessage('')
        }, 8000) // Show longer for warnings
      } else {
        throw new Error('Import completed but no data received')
      }
    } catch (error: any) {
      console.error('QuickBooks import error:', error)
      setImportStatus('error')
      
      // Extract error message and format it nicely
      let errorMsg = error.message || 'Failed to import QuickBooks data'
      
      // If error message contains newlines, format it as a multi-line message
      if (errorMsg.includes('\n')) {
        // Replace newlines with line breaks for better display
        errorMsg = errorMsg.split('\n').join('\n')
      }
      
      setImportMessage(errorMsg)
      
      setTimeout(() => {
        setImportStatus('idle')
        setImportMessage('')
      }, 10000) // Show error longer (10 seconds) so user can read details
    } finally {
      setIsImporting(false)
    }
  }

  const handleRegisterWebhook = async (configId: string) => {
    if (configId !== 'quickbooks') return

    setIsRegisteringWebhook(true)
    setWebhookStatus('registering')
    setWebhookMessage('Registering webhook with QuickBooks...')

    try {
      const config = configs.find(c => c.id === configId)
      if (!config) {
        throw new Error('QuickBooks configuration not found')
      }

      const webhookUrl = config.parameters?.webhookUrl?.value || config.parameters?.webhookUrl || 
        `${window.location.origin}/api/integrations/quickbooks/webhooks`

      const response = await fetch('/api/integrations/quickbooks/webhooks/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          webhookUrl: webhookUrl,
          entities: ['Account', 'Invoice', 'Payment', 'Bill', 'Purchase', 'JournalEntry', 'Customer', 'Vendor']
        })
      })

      const result = await response.json()

      if (result.success) {
        setWebhookStatus('success')
        setWebhookMessage(`Webhook registered successfully! URL: ${result.webhookUrl}`)
        
        // Update verifier token if provided
        if (result.verifierToken && config.parameters.webhookVerifierToken) {
          setConfigs(prev => prev.map(c => 
            c.id === configId 
              ? {
                  ...c,
                  parameters: {
                    ...c.parameters,
                    webhookVerifierToken: {
                      ...c.parameters.webhookVerifierToken,
                      value: result.verifierToken
                    },
                    webhookUrl: {
                      ...c.parameters.webhookUrl,
                      value: result.webhookUrl
                    }
                  }
                }
              : c
          ))
        }
      } else {
        // Manual setup required
        setWebhookStatus('error')
        setWebhookMessage(result.message || 'Webhook registration requires manual setup')
        
        // Show instructions if provided
        if (result.instructions) {
          console.log('Webhook Setup Instructions:', result.instructions)
          alert(`Webhook Setup:\n\n${result.instructions.join('\n')}\n\nWebhook URL: ${webhookUrl}`)
        }
      }
    } catch (error: any) {
      console.error('Webhook registration error:', error)
      setWebhookStatus('error')
      setWebhookMessage(error.message || 'Failed to register webhook')
    } finally {
      setIsRegisteringWebhook(false)
      setTimeout(() => {
        setWebhookStatus('idle')
        setWebhookMessage('')
      }, 5000)
    }
  }

  const handleDownloadCSV = () => {
    if (!importedData) return

    try {
      // Prepare CSV content
      let csvContent = ''
      
      // Add Company Information Section
      csvContent += 'QuickBooks Import Data\n'
      csvContent += 'Generated: ' + new Date().toLocaleString() + '\n'
      csvContent += 'Data Source: ' + (importedData.dataSource || (importedData.isRealData ? 'QuickBooks API (Real Data)' : 'Mock/Demo Data') || 'Unknown') + '\n\n'
      csvContent += 'COMPANY INFORMATION\n'
      csvContent += 'Company ID,' + (importedData.companyId || 'N/A') + '\n'
      csvContent += 'Company Name,' + (importedData.companyName || 'N/A') + '\n'
      
      if (importedData.companyDetails) {
        csvContent += 'Country,' + (importedData.companyDetails.country || 'N/A') + '\n'
        csvContent += 'Currency,' + (importedData.companyDetails.currency || 'N/A') + '\n'
        csvContent += 'Fiscal Year Start Month,' + (importedData.companyDetails.fiscalYearStartMonth || 'N/A') + '\n'
      }
      
      csvContent += 'Import Date,' + (importedData.importDate || new Date().toISOString()) + '\n'
      csvContent += '\n'
      
      // Add Accounts Section
      if (importedData.accounts && importedData.accounts.length > 0) {
        csvContent += 'CHART OF ACCOUNTS\n'
        csvContent += 'Account ID,Account Name,Account Type,Subtype,Account Number,Current Balance\n'
        
        importedData.accounts.forEach((account: any) => {
          const row = [
            account.id || '',
            account.name || '',
            account.type || '',
            account.subtype || '',
            account.accountNumber || '',
            account.currentBalance || 0
          ].map(field => {
            // Escape commas and quotes in CSV
            const str = String(field)
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
              return '"' + str.replace(/"/g, '""') + '"'
            }
            return str
          }).join(',')
          csvContent += row + '\n'
        })
        
        csvContent += '\n'
        csvContent += 'Total Accounts,' + importedData.totalAccounts + '\n'
      } else {
        csvContent += 'CHART OF ACCOUNTS\n'
        csvContent += 'No accounts found\n'
      }

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      const fileName = `quickbooks-import-${importedData.companyId || 'data'}-${new Date().toISOString().split('T')[0]}.csv`
      
      link.href = url
      link.download = fileName
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }, 100)
      
    } catch (error) {
      console.error('Error generating CSV:', error)
      setImportStatus('error')
      setImportMessage('Failed to generate CSV file')
      setTimeout(() => {
        setImportStatus('idle')
        setImportMessage('')
      }, 3000)
    }
  }

  const togglePasswordVisibility = (paramKey: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [paramKey]: !prev[paramKey]
    }))
  }

  const exportAsEnvVars = () => {
    const envVars: string[] = []
    
    configs.forEach(config => {
      if (config.enabled) {
        Object.entries(config.parameters).forEach(([key, param]) => {
          if (param.value) {
            const envKey = getEnvVarName(config.id, key)
            envVars.push(`${envKey}=${param.value}`)
          }
        })
      }
    })

    const envContent = envVars.join('\n')
    
    // Create and download file
    const blob = new Blob([envContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = '.env'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getEnvVarName = (serviceId: string, paramKey: string): string => {
    const mapping: Record<string, Record<string, string>> = {
      openai: {
        apiKey: 'OPENAI_API_KEY',
        model: 'OPENAI_MODEL',
        maxTokens: 'OPENAI_MAX_TOKENS',
        temperature: 'OPENAI_TEMPERATURE'
      },
      anthropic: {
        apiKey: 'ANTHROPIC_API_KEY',
        model: 'ANTHROPIC_MODEL',
        maxTokens: 'ANTHROPIC_MAX_TOKENS'
      },
      pinecone: {
        apiKey: 'PINECONE_API_KEY',
        environment: 'PINECONE_ENVIRONMENT',
        indexName: 'PINECONE_INDEX'
      },
      postgres: {
        databaseUrl: 'DATABASE_URL',
        embedDim: 'PGVECTOR_EMBED_DIM'
      },
      quickbooks: {
        companyId: 'QUICKBOOKS_COMPANY_ID',
        clientId: 'QUICKBOOKS_CLIENT_ID',
        clientSecret: 'QUICKBOOKS_CLIENT_SECRET',
        redirectUri: 'QUICKBOOKS_REDIRECT_URI',
        environment: 'QUICKBOOKS_ENV'
      },
      banking: {
        apiKey: 'BANK_API_KEY',
        environment: 'BANK_ENV'
      },
      datadog: {
        apiKey: 'DATADOG_API_KEY'
      },
      newrelic: {
        licenseKey: 'NEW_RELIC_LICENSE_KEY',
        appName: 'NEW_RELIC_APP_NAME'
      },
      app: {
        port: 'PORT',
        nodeEnv: 'NODE_ENV'
      }
    }

    return mapping[serviceId]?.[paramKey] || `${serviceId.toUpperCase()}_${paramKey.toUpperCase()}`
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="flex items-center gap-1"><CheckCircle className="h-3 w-3" />Active</Badge>
      case 'error':
        return <Badge variant="destructive" className="flex items-center gap-1"><AlertCircle className="h-3 w-3" />Error</Badge>
      case 'warning':
        return <Badge variant="secondary" className="flex items-center gap-1"><AlertCircle className="h-3 w-3" />Warning</Badge>
      default:
        return <Badge variant="outline" className="flex items-center gap-1"><AlertCircle className="h-3 w-3" />Inactive</Badge>
    }
  }

  const groupedConfigs = configs.reduce((acc, config) => {
    if (!acc[config.category]) {
      acc[config.category] = []
    }
    acc[config.category].push(config)
    return acc
  }, {} as Record<string, ServiceConfig[]>)

  console.log('Rendering ServiceConfiguration with', configs.length, 'configs')
  
  return (
    <div>
      {!isHydrated && (
        <div className="text-sm text-muted-foreground">Loading configuration…</div>
      )}
      {isHydrated && (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Service Configuration</h2>
          <p className="text-muted-foreground">
            Configure API keys and parameters for external services
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowPasswords({})}
          >
            <Eye className="h-4 w-4 mr-2" />
            Toggle Passwords
          </Button>
          <Button
            onClick={() => setActiveConfig('openai')}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Settings className="h-4 w-4 mr-2" />
            Configure Services
          </Button>
          <Button
            onClick={exportAsEnvVars}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Settings className="h-4 w-4 mr-2" />
            Export .env
          </Button>
        </div>
      </div>

      {/* Configuration Tabs */}
      <Tabs value={activeConfig || "overview"} onValueChange={(value) => {
        setActiveConfig(value)
        // Clear test result when switching configurations
        setTestConnectionResult(null)
      }} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="ai-services">AI Services</TabsTrigger>
          <TabsTrigger value="vector-db">Vector DB</TabsTrigger>
          <TabsTrigger value="financial-data">Financial Data</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Services</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {configs.filter(c => c.status === 'active').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  of {configs.length} configured
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">AI Services</CardTitle>
                <Cloud className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {configs.filter(c => c.category === 'AI Services' && c.status === 'active').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  LLM providers configured
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Vector Database</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {configs.filter(c => c.category === 'Vector Database' && c.status === 'active').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Vector storage configured
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Financial Data</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {configs.filter(c => c.category === 'Financial Data' && c.status === 'active').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Financial data sources
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Configuration Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Quick Configuration</h3>
            <p className="text-blue-700 mb-4">
              Click on any service below to configure its parameters. You can also use the category tabs above to filter services.
            </p>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {configs.map((config) => (
                <Button
                  key={config.id}
                  variant="outline"
                  className="justify-start h-auto p-4 text-left"
                  onClick={() => setActiveConfig(config.id)}
                >
                  <div className="flex items-center gap-3 w-full">
                    {getStatusIcon(config.status)}
                    <div className="flex-1">
                      <div className="font-medium">{config.name}</div>
                      <div className="text-xs text-muted-foreground">{config.category}</div>
                    </div>
                    <Settings className="h-4 w-4" />
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Service List */}
          <div className="space-y-4">
            {Object.entries(groupedConfigs).map(([category, categoryConfigs]) => (
              <div key={category} className="space-y-4">
                <h3 className="text-lg font-medium">{category}</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {categoryConfigs.map((config) => (
                    <Card key={config.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(config.status)}
                            <CardTitle className="text-base">{config.name}</CardTitle>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(config.status)}
                            <Switch
                              checked={config.enabled}
                              onCheckedChange={(enabled) => handleToggleService(config.id, enabled)}
                            />
                          </div>
                        </div>
                        <CardDescription>
                          {config.lastUpdated && (
                            <span className="text-xs">
                              Last updated: {new Date(config.lastUpdated).toLocaleString()}
                            </span>
                          )}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setActiveConfig(config.id)}
                          >
                            <Settings className="h-3 w-3 mr-1" />
                            Configure
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTestConnection(config.id)}
                            disabled={isLoading}
                          >
                            <TestTube className="h-3 w-3 mr-1" />
                            Test
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="ai-services" className="space-y-6">
          <div className="space-y-4">
            {groupedConfigs['AI Services']?.map((config) => (
              <Card key={config.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(config.status)}
                      <CardTitle className="text-base">{config.name}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(config.status)}
                      <Switch
                        checked={config.enabled}
                        onCheckedChange={(enabled) => handleToggleService(config.id, enabled)}
                      />
                    </div>
                  </div>
                  <CardDescription>
                    {config.lastUpdated && (
                      <span className="text-xs">
                        Last updated: {new Date(config.lastUpdated).toLocaleString()}
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setActiveConfig(config.id)}
                    >
                      <Settings className="h-3 w-3 mr-1" />
                      Configure
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTestConnection(config.id)}
                      disabled={isLoading}
                    >
                      <TestTube className="h-3 w-3 mr-1" />
                      Test
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="vector-db" className="space-y-6">
          <div className="space-y-4">
            {groupedConfigs['Vector Database']?.map((config) => (
              <Card key={config.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(config.status)}
                      <CardTitle className="text-base">{config.name}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(config.status)}
                      <Switch
                        checked={config.enabled}
                        onCheckedChange={(enabled) => handleToggleService(config.id, enabled)}
                      />
                    </div>
                  </div>
                  <CardDescription>
                    {config.lastUpdated && (
                      <span className="text-xs">
                        Last updated: {new Date(config.lastUpdated).toLocaleString()}
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setActiveConfig(config.id)}
                    >
                      <Settings className="h-3 w-3 mr-1" />
                      Configure
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTestConnection(config.id)}
                      disabled={isLoading}
                    >
                      <TestTube className="h-3 w-3 mr-1" />
                      Test
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="financial-data" className="space-y-6">
          <div className="space-y-4">
            {groupedConfigs['Financial Data']?.map((config) => (
              <Card key={config.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(config.status)}
                      <CardTitle className="text-base">{config.name}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(config.status)}
                      <Switch
                        checked={config.enabled}
                        onCheckedChange={(enabled) => handleToggleService(config.id, enabled)}
                      />
                    </div>
                  </div>
                  <CardDescription>
                    {config.lastUpdated && (
                      <span className="text-xs">
                        Last updated: {new Date(config.lastUpdated).toLocaleString()}
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setActiveConfig(config.id)}
                    >
                      <Settings className="h-3 w-3 mr-1" />
                      Configure
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTestConnection(config.id)}
                      disabled={isLoading}
                    >
                      <TestTube className="h-3 w-3 mr-1" />
                      Test
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <div className="space-y-4">
            {groupedConfigs['Monitoring']?.map((config) => (
              <Card key={config.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(config.status)}
                      <CardTitle className="text-base">{config.name}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(config.status)}
                      <Switch
                        checked={config.enabled}
                        onCheckedChange={(enabled) => handleToggleService(config.id, enabled)}
                      />
                    </div>
                  </div>
                  <CardDescription>
                    {config.lastUpdated && (
                      <span className="text-xs">
                        Last updated: {new Date(config.lastUpdated).toLocaleString()}
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setActiveConfig(config.id)}
                    >
                      <Settings className="h-3 w-3 mr-1" />
                      Configure
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTestConnection(config.id)}
                      disabled={isLoading}
                    >
                      <TestTube className="h-3 w-3 mr-1" />
                      Test
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Individual Service Configuration */}
        {configs.map((config) => (
          <TabsContent key={config.id} value={config.id} className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(config.status)}
                    <div>
                      <CardTitle className="text-xl">{config.name}</CardTitle>
                      <CardDescription>{config.category}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(config.status)}
                    <Switch
                      checked={config.enabled}
                      onCheckedChange={(enabled) => handleToggleService(config.id, enabled)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Configuration Parameters</h4>
                  <p className="text-sm text-gray-600">
                    Enter your API keys and configuration values below. Required fields are marked with a red asterisk (*).
                  </p>
                </div>
                <div className="grid gap-4">
                  {Object.entries(config.parameters).map(([paramKey, param]) => (
                    <div key={paramKey} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`${config.id}-${paramKey}`} className="text-sm font-medium">
                          {paramKey.charAt(0).toUpperCase() + paramKey.slice(1).replace(/([A-Z])/g, ' $1')}
                          {param.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        {param.type === 'password' && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => togglePasswordVisibility(`${config.id}-${paramKey}`)}
                          >
                            {showPasswords[`${config.id}-${paramKey}`] ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                      
                      {param.type === 'textarea' ? (
                        <textarea
                          id={`${config.id}-${paramKey}`}
                          value={param.value}
                          onChange={(e) => handleParameterChange(config.id, paramKey, e.target.value)}
                          placeholder={param.placeholder}
                          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      ) : (
                        <Input
                          id={`${config.id}-${paramKey}`}
                          type={param.type === 'password' && !showPasswords[`${config.id}-${paramKey}`] ? 'password' : 'text'}
                          value={param.value}
                          onChange={(e) => handleParameterChange(config.id, paramKey, e.target.value)}
                          placeholder={param.placeholder}
                        />
                      )}
                      
                      <p className="text-xs text-muted-foreground">
                        {param.description}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    onClick={() => handleSaveConfig(config.id)}
                    disabled={isLoading}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {saveStatus === 'saving' ? 'Saving...' : 'Save Configuration'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => handleTestConnection(config.id)}
                    disabled={isLoading}
                    className="flex items-center gap-2"
                  >
                    <TestTube className="h-4 w-4" />
                    Test Connection
                  </Button>

                  {config.id === 'quickbooks' && (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => handleImportQuickBooks(config.id)}
                        disabled={isImporting || isLoading}
                        className="flex items-center gap-2"
                      >
                        {isImporting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Importing...
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4" />
                            Import
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleRegisterWebhook(config.id)}
                        disabled={isRegisteringWebhook || isLoading}
                        className="flex items-center gap-2"
                      >
                        {isRegisteringWebhook ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Registering...
                          </>
                        ) : (
                          <>
                            <Webhook className="h-4 w-4" />
                            Register Webhook
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </div>

                {saveStatus === 'saved' && (
                  <div className="flex items-center gap-2 text-green-600 text-sm">
                    <CheckCircle className="h-4 w-4" />
                    Configuration saved successfully
                  </div>
                )}

                {saveStatus === 'error' && (
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    Failed to save configuration
                  </div>
                )}

                {testConnectionResult && testConnectionResult.serviceId === config.id && (
                  <div className={`border rounded-lg p-4 ${
                    testConnectionResult.success 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-start gap-2">
                      {testConnectionResult.success ? (
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <h4 className={`font-medium mb-1 ${
                          testConnectionResult.success ? 'text-green-900' : 'text-red-900'
                        }`}>
                          {testConnectionResult.success ? 'Connection Test Successful' : 'Connection Test Failed'}
                        </h4>
                        <p className={`text-sm mb-2 ${
                          testConnectionResult.success ? 'text-green-800' : 'text-red-800'
                        }`}>
                          {testConnectionResult.message}
                        </p>
                        {testConnectionResult.details && (
                          <div className={`text-xs mt-2 p-2 rounded ${
                            testConnectionResult.success 
                              ? 'bg-green-100 text-green-900' 
                              : 'bg-red-100 text-red-900'
                          }`}>
                            <p className="font-medium mb-1">Details:</p>
                            <p className="whitespace-pre-line">{testConnectionResult.details}</p>
                          </div>
                        )}
                        {!testConnectionResult.success && config.id === 'quickbooks' && (
                          <div className="mt-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleConnectQuickBooks(config.id)}
                              className="mr-2"
                            >
                              Connect QuickBooks
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setTestConnectionResult(null)}
                            >
                              Dismiss
                            </Button>
                          </div>
                        )}
                        {testConnectionResult.success && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setTestConnectionResult(null)}
                            className="mt-3"
                          >
                            Dismiss
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {config.id === 'quickbooks' && oauthError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium text-red-900 mb-1">OAuth Connection Failed</h4>
                        <p className="text-sm text-red-800">{oauthError}</p>
                        <div className="mt-3 text-xs text-red-700 space-y-1">
                          <p><strong>Common issues:</strong></p>
                          <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Redirect URI must match exactly with QuickBooks Developer Portal</li>
                            <li>Client ID and Client Secret must be correct</li>
                            <li>Authorization code may have expired (try connecting again)</li>
                            <li>Check that your QuickBooks app is in the correct environment (sandbox/production)</li>
                          </ul>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setOauthError(null)}
                          className="mt-3"
                        >
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {config.id === 'quickbooks' && oauthSuccess && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium text-green-900 mb-1">OAuth Connection Successful</h4>
                        <p className="text-sm text-green-800">{oauthSuccess}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setOauthSuccess(null)}
                          className="mt-3"
                        >
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {config.id === 'quickbooks' && (
                  <>
                    {importStatus === 'importing' && (
                      <div className="flex items-center gap-2 text-blue-600 text-sm">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {importMessage || 'Importing from QuickBooks...'}
                      </div>
                    )}
                    {importStatus === 'success' && (
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <div className={`flex items-center gap-2 text-sm ${importedData?.isRealData ? 'text-green-600' : 'text-yellow-600'}`}>
                            {importedData?.isRealData ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <AlertCircle className="h-4 w-4" />
                            )}
                            {importMessage || 'QuickBooks data imported successfully'}
                          </div>
                          {importedData && (
                            <div className="flex items-center gap-2 text-xs">
                              <Badge variant={importedData.isRealData ? "default" : "destructive"} className="text-xs">
                                {importedData.isRealData ? '✓ Real Data' : '⚠ Demo Data'}
                              </Badge>
                              <span className="text-muted-foreground">
                                {importedData.dataSource || (importedData.isRealData ? 'QuickBooks API' : 'Mock Data')}
                              </span>
                            </div>
                          )}
                          {importedData && !importedData.isRealData && (
                            <div className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded p-3 space-y-2">
                              <p className="font-medium">⚠️ Demo/Mock Data</p>
                              <p>This is demo data for development/testing. To import real QuickBooks data:</p>
                              <ol className="list-decimal list-inside space-y-1 ml-2">
                                <li>Ensure Client ID, Client Secret, and Redirect URI are configured above</li>
                                <li>Click "Test Connection" to initiate OAuth flow</li>
                                <li>Authorize the app in QuickBooks</li>
                                <li>Then import again to get real data</li>
                              </ol>
                              {config.parameters?.clientId?.value && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleConnectQuickBooks(config.id)}
                                  className="mt-2 w-full"
                                >
                                  Connect QuickBooks (OAuth)
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                        {importedData && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDownloadCSV}
                            className="flex items-center gap-2"
                          >
                            <Download className="h-4 w-4" />
                            Download CSV
                          </Button>
                        )}
                      </div>
                    )}
                    {importStatus === 'error' && (
                      <div className="space-y-2">
                        <div className="flex items-start gap-2 text-red-600 text-sm">
                          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <div className="font-medium">Import Failed</div>
                            <div className="text-xs text-red-500 mt-1 whitespace-pre-wrap">
                              {importMessage || 'Import failed'}
                            </div>
                          </div>
                        </div>
                        {importMessage?.includes('OAuth connection') && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleConnectQuickBooks('quickbooks')}
                            className="mt-2"
                          >
                            Connect QuickBooks Now
                          </Button>
                        )}
                      </div>
                    )}
                  </>
                )}

                {config.id === 'quickbooks' && (
                  <>
                    {webhookStatus === 'registering' && (
                      <div className="flex items-center gap-2 text-blue-600 text-sm">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {webhookMessage || 'Registering webhook...'}
                      </div>
                    )}
                    {webhookStatus === 'success' && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-green-600 text-sm">
                          <CheckCircle className="h-4 w-4" />
                          {webhookMessage || 'Webhook registered successfully'}
                        </div>
                        <div className="text-xs text-muted-foreground bg-green-50 p-2 rounded">
                          QuickBooks will now send notifications to your webhook endpoint when data changes occur.
                        </div>
                      </div>
                    )}
                    {webhookStatus === 'error' && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-yellow-600 text-sm">
                          <AlertCircle className="h-4 w-4" />
                          {webhookMessage || 'Webhook registration requires manual setup'}
                        </div>
                        <div className="text-xs text-muted-foreground bg-yellow-50 p-2 rounded">
                          Please register the webhook URL in QuickBooks Developer Portal and enter the verifier token above.
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
      </div>
      )}
    </div>
  )
}
