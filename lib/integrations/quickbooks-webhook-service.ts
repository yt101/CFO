import { createQuickBooksService } from './quickbooks-service'

export interface WebhookEvent {
  realmId: string
  entityName: string
  entityId: string
  operation: 'Create' | 'Update' | 'Delete' | 'Void'
  lastUpdated: string
}

/**
 * Register webhook subscriptions with QuickBooks
 */
export async function registerQuickBooksWebhook(
  accessToken: string,
  realmId: string,
  webhookUrl: string,
  environment: 'sandbox' | 'production' = 'sandbox'
): Promise<{ success: boolean; verifierToken?: string }> {
  const baseUrl = environment === 'production'
    ? 'https://quickbooks.api.intuit.com'
    : 'https://sandbox-quickbooks.api.intuit.com'

  try {
    // Register webhook endpoint
    const response = await fetch(`${baseUrl}/v3/company/${realmId}/webhooks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        webhookUrl: webhookUrl,
        // Subscribe to specific entities
        entities: [
          'Account',      // Chart of accounts changes
          'Invoice',     // Invoice changes
          'Payment',     // Payment changes
          'Bill',        // Bill changes
          'Purchase',    // Purchase changes
          'JournalEntry', // Journal entry changes
          'Customer',    // Customer changes
          'Vendor'       // Vendor changes
        ]
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Webhook registration failed: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    
    return {
      success: true,
      verifierToken: data.verifierToken // QuickBooks returns a verifier token
    }
  } catch (error: any) {
    console.error('Webhook registration error:', error)
    throw new Error(`Failed to register webhook: ${error.message}`)
  }
}

/**
 * Get webhook subscription status
 */
export async function getWebhookStatus(
  accessToken: string,
  realmId: string,
  environment: 'sandbox' | 'production' = 'sandbox'
): Promise<any> {
  const baseUrl = environment === 'production'
    ? 'https://quickbooks.api.intuit.com'
    : 'https://sandbox-quickbooks.api.intuit.com'

  try {
    const response = await fetch(`${baseUrl}/v3/company/${realmId}/webhooks`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to get webhook status: ${response.status}`)
    }

    return await response.json()
  } catch (error: any) {
    console.error('Get webhook status error:', error)
    throw error
  }
}

/**
 * Process and sync entity changes from webhook
 */
export async function syncEntityFromWebhook(
  event: WebhookEvent,
  config: any
): Promise<void> {
  try {
    const qbService = createQuickBooksService(config)

    switch (event.entityName) {
      case 'Account':
        // Sync account changes
        if (event.operation === 'Update' || event.operation === 'Create') {
          const accounts = await qbService.getAccounts()
          console.log(`Synced ${accounts.length} accounts after ${event.operation}`)
        }
        break

      case 'Invoice':
        // Sync invoice changes
        if (event.operation === 'Update' || event.operation === 'Create') {
          // Fetch updated invoice
          console.log(`Invoice ${event.entityId} was ${event.operation.toLowerCase()}`)
        }
        break

      case 'Payment':
        // Sync payment changes
        console.log(`Payment ${event.entityId} was ${event.operation.toLowerCase()}`)
        break

      default:
        console.log(`Entity ${event.entityName} ${event.entityId} was ${event.operation.toLowerCase()}`)
    }
  } catch (error) {
    console.error('Error syncing entity from webhook:', error)
    throw error
  }
}



