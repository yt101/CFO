// QuickBooks Configuration Backup
// This file ensures your Company ID is preserved across sessions

const defaultOrigin = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '')

export const QUICKBOOKS_BACKUP_CONFIG = {
  companyId: '9341 4555 6764 7039',
  environment: 'sandbox',
  publicBaseUrl: defaultOrigin,
  redirectUri: `${defaultOrigin}/api/integrations/quickbooks/oauth`,
  webhookUrl: `${defaultOrigin}/api/integrations/quickbooks/webhooks`,
  lastUpdated: new Date().toISOString(),
  status: 'active'
}

// Function to restore configuration if needed
export function restoreQuickBooksConfig() {
  if (typeof window !== 'undefined') {
    const backup = {
      id: 'quickbooks',
      name: 'QuickBooks Online',
      category: 'Financial Data',
      enabled: true,
      status: 'active',
      parameters: {
        companyId: {
          value: QUICKBOOKS_BACKUP_CONFIG.companyId,
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
          value: QUICKBOOKS_BACKUP_CONFIG.publicBaseUrl,
          type: 'url',
          required: false,
          description: 'Optional override for the public base URL (e.g., https://your-subdomain.localhost.run)',
          placeholder: 'https://your-subdomain.localhost.run'
        },
        redirectUri: {
          value: QUICKBOOKS_BACKUP_CONFIG.redirectUri,
          type: 'url',
          required: true,
          description: 'OAuth redirect URI',
          placeholder: QUICKBOOKS_BACKUP_CONFIG.redirectUri
        },
        webhookUrl: {
          value: QUICKBOOKS_BACKUP_CONFIG.webhookUrl,
          type: 'url',
          required: false,
          description: 'Webhook endpoint URL for receiving QuickBooks notifications',
          placeholder: QUICKBOOKS_BACKUP_CONFIG.webhookUrl
        },
        environment: {
          value: QUICKBOOKS_BACKUP_CONFIG.environment,
          type: 'text',
          required: true,
          description: 'Environment (sandbox or production)',
          placeholder: 'sandbox'
        }
      }
    }
    
    localStorage.setItem('quickbooks-config', JSON.stringify(backup))
    console.log('QuickBooks configuration restored from backup')
    return backup
  }
  return null
}

// Function to verify configuration exists
export function verifyQuickBooksConfig() {
  if (typeof window !== 'undefined') {
    const config = localStorage.getItem('quickbooks-config')
    if (config) {
      const parsed = JSON.parse(config)
      const companyId = parsed.parameters?.companyId?.value
      if (companyId === QUICKBOOKS_BACKUP_CONFIG.companyId) {
        console.log('✅ QuickBooks Company ID verified:', companyId)
        return true
      }
    }
    console.log('⚠️ QuickBooks configuration not found or Company ID mismatch')
    return false
  }
  return false
}












