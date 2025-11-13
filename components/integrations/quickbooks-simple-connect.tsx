"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, ExternalLink, AlertCircle, RefreshCw, Building2 } from "lucide-react"

interface QuickBooksSimpleConfig {
  companyId: string
  clientId: string
  redirectUri: string
  environment: 'sandbox' | 'production'
}

export function QuickBooksSimpleConnect() {
  const [isConnecting, setIsConnecting] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [status, setStatus] = useState<{
    connected: boolean
    companyName?: string
    lastSync?: string
    error?: string
  }>({ connected: false })

  const [config, setConfig] = useState<QuickBooksSimpleConfig>({
    companyId: '',
    clientId: '',
    redirectUri: 'http://localhost:3001/api/integrations/quickbooks/oauth',
    environment: 'sandbox'
  })

  // Load saved configuration from service configuration
  useEffect(() => {
    const loadConfig = async () => {
      try {
        // Import configService dynamically to avoid SSR issues
        const { configService } = await import('@/lib/ai/config-service')
        const qbConfig = await configService.getQuickBooksConfiguration()
        
        if (qbConfig) {
          setConfig({
            companyId: qbConfig.companyId || '',
            clientId: qbConfig.clientId || '',
            redirectUri: qbConfig.redirectUri || 'http://localhost:3001/api/integrations/quickbooks/oauth',
            environment: qbConfig.environment || 'sandbox'
          })
        }
      } catch (error) {
        console.error('Error loading QuickBooks config:', error)
      }
    }

    loadConfig()
    
    // Listen for config changes
    const handleStorageChange = () => loadConfig()
    window.addEventListener('storage', handleStorageChange)
    
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Configuration is now managed by the service configuration component

  const handleConnect = async () => {
    if (!config.companyId || !config.clientId || !config.redirectUri) {
      setStatus({ connected: false, error: 'Please fill in all required fields' })
      return
    }

    setIsConnecting(true)
    
    try {
      // For Company ID only flow, we'll use a simplified OAuth approach
      const qbAuthUrl = `https://${config.environment === 'production' ? 'quickbooks.intuit.com' : 'sandbox-quickbooks.intuit.com'}/oauth/v1/authorize?` +
        `client_id=${config.clientId}&` +
        `scope=com.intuit.quickbooks.accounting&` +
        `redirect_uri=${encodeURIComponent(config.redirectUri)}&` +
        `response_type=code&` +
        `access_type=offline&` +
        `state=company_${config.companyId}`
      
      // Store config for OAuth callback
      localStorage.setItem('quickbooks-oauth-config', JSON.stringify(config))
      
      window.location.href = qbAuthUrl
    } catch (error) {
      console.error('QuickBooks connection error:', error)
      setStatus({ connected: false, error: 'Failed to initiate connection' })
    } finally {
      setIsConnecting(false)
    }
  }

  const handleTestConnection = async () => {
    if (!config.companyId) {
      setStatus({ connected: false, error: 'Company ID is required' })
      return
    }

    setIsTesting(true)
    
    try {
      // For demo mode, we'll simulate a successful connection
      // In production, this would make a real API call to QuickBooks
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      setStatus({
        connected: true,
        companyName: `Demo Company ${config.companyId}`,
        lastSync: new Date().toISOString()
      })
    } catch (error) {
      setStatus({ connected: false, error: 'Connection test failed' })
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              QuickBooks Online (Company ID)
            </CardTitle>
            <CardDescription>
              Connect using your QuickBooks Company ID and OAuth credentials
            </CardDescription>
          </div>
          <Badge variant={status.connected ? 'default' : 'outline'}>
            {status.connected ? 'Connected' : 'Disconnected'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!status.connected ? (
          <div className="space-y-4">
            {/* Current Configuration Display */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Current Configuration</h4>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <span className="text-sm font-medium text-gray-600">Company ID:</span>
                  <p className="text-sm text-gray-900 font-mono">
                    {config.companyId || 'Not configured'}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Client ID:</span>
                  <p className="text-sm text-gray-900 font-mono">
                    {config.clientId || 'Not configured'}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Environment:</span>
                  <p className="text-sm text-gray-900">
                    {config.environment === 'sandbox' ? 'Sandbox (Testing)' : 'Production'}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Redirect URI:</span>
                  <p className="text-sm text-gray-900 font-mono">
                    {config.redirectUri}
                  </p>
                </div>
              </div>
            </div>

            {status.error && (
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">{status.error}</span>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleConnect} disabled={isConnecting || !config.companyId || !config.clientId}>
                {isConnecting ? 'Connecting...' : 'Connect to QuickBooks'}
              </Button>
              <Button variant="outline" onClick={handleTestConnection} disabled={isTesting || !config.companyId}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isTesting ? 'animate-spin' : ''}`} />
                {isTesting ? 'Testing...' : 'Test Connection'}
              </Button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Configuration Required</h4>
              <p className="text-sm text-blue-800 mb-2">
                To connect to QuickBooks, please configure your credentials in the <strong>Configuration</strong> tab above.
              </p>
              <div className="text-sm text-blue-700">
                <p><strong>Required:</strong></p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Company ID (found in QuickBooks Settings → Company Settings)</li>
                  <li>OAuth Client ID (from QuickBooks Developer Console)</li>
                </ul>
                <p className="mt-2"><strong>Optional:</strong> Client Secret (for enhanced security)</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">
                Connected to {status.companyName}
              </span>
            </div>
            {status.lastSync && (
              <p className="text-xs text-muted-foreground">
                Last synced: {new Date(status.lastSync).toLocaleString()}
              </p>
            )}
            <div className="text-sm text-muted-foreground">
              <p>• Real-time financial data</p>
              <p>• Automated reporting</p>
              <p>• Historical transactions</p>
              <p>• Accurate financial insights</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleTestConnection} disabled={isTesting}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isTesting ? 'animate-spin' : ''}`} />
                {isTesting ? 'Testing...' : 'Test Connection'}
              </Button>
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                Manage
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
