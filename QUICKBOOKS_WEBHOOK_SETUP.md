# QuickBooks Webhook Setup Guide

This guide explains how to set up webhooks for QuickBooks integration to receive real-time notifications when data changes occur in QuickBooks.

## Overview

Webhooks allow QuickBooks to push notifications to your application when specific events occur (e.g., when an invoice is created, an account is updated, or a payment is received).

## Webhook Endpoint

**URL**: `https://fingenieai.com/api/integrations/quickbooks/webhooks`

**Methods**:
- `POST`: Receives webhook notifications from QuickBooks
- `GET`: Webhook verification endpoint

## Setup Instructions

### Option 1: Automatic Registration (Recommended)

1. Complete OAuth connection with QuickBooks
2. Navigate to QuickBooks configuration page
3. Click "Register Webhook" button
4. The system will attempt to register the webhook automatically
5. If successful, the verifier token will be saved automatically

### Option 2: Manual Registration (If automatic fails)

1. **Get your webhook URL**:
   - Production: `https://fingenieai.com/api/integrations/quickbooks/webhooks`
   - Local Dev: `https://your-ngrok-url.ngrok.io/api/integrations/quickbooks/webhooks` (use ngrok for local testing)

2. **Register in QuickBooks Developer Portal**:
   - Go to [Intuit Developer Portal](https://developer.intuit.com/app/developer/dashboard)
   - Select your QuickBooks app
   - Navigate to "Webhooks" or "Event Subscriptions" section
   - Click "Add Webhook" or "Configure Webhooks"
   - Enter your webhook URL
   - Select entities to monitor:
     - Account (Chart of Accounts)
     - Invoice
     - Payment
     - Bill
     - Purchase
     - JournalEntry
     - Customer
     - Vendor
   - Save the configuration

3. **Get Verifier Token**:
   - After registering, QuickBooks will provide a "Verifier Token"
   - Copy this token

4. **Enter Verifier Token in Configuration**:
   - Go to QuickBooks configuration in your app
   - Paste the verifier token in the "Webhook Verifier Token" field
   - Save the configuration

## Environment Variables

Add to your `.env.local` file:

```env
QUICKBOOKS_WEBHOOK_VERIFIER_TOKEN=your_verifier_token_here
```

**Note**: The verifier token can also be stored in the service configuration. If both exist, the environment variable takes precedence.

## Webhook Payload Structure

QuickBooks sends webhooks with this structure:

```json
{
  "eventNotifications": [
    {
      "realmId": "1234567890",
      "dataChangeEvent": {
        "entities": [
          {
            "name": "Invoice",
            "id": "123",
            "operation": "Create",
            "lastUpdated": "2024-01-15T10:30:00Z"
          }
        ]
      }
    }
  ]
}
```

## Security

### Signature Verification

The webhook endpoint automatically verifies the `intuit-signature` header using HMAC-SHA256:

1. QuickBooks includes a signature in the `intuit-signature` header
2. The endpoint computes the expected signature using the verifier token
3. Compares signatures using constant-time comparison (prevents timing attacks)
4. Only processes webhooks with valid signatures

### Requirements

- **HTTPS**: Webhooks must use HTTPS (required by QuickBooks)
- **Fast Response**: Must respond within 3 seconds with HTTP 200
- **Idempotency**: Handle duplicate webhook deliveries gracefully

## Events Handled

The webhook endpoint processes notifications for:

- **Account**: Chart of accounts changes
- **Invoice**: Invoice creation/updates
- **Payment**: Payment transactions
- **Bill**: Bill changes
- **Purchase**: Purchase transactions
- **JournalEntry**: Journal entry changes
- **Customer**: Customer updates
- **Vendor**: Vendor updates

## Testing

### Local Development

For local testing, use a tunneling service:

1. **Install ngrok**:
   ```bash
   npm install -g ngrok
   ```

2. **Start ngrok**:
   ```bash
   ngrok http 3000
   ```

3. **Use ngrok URL** as your webhook URL:
   ```
   https://abc123.ngrok.io/api/integrations/quickbooks/webhooks
   ```

4. **Register in Developer Portal** using the ngrok URL

### Testing Webhook Delivery

1. Make a change in QuickBooks (create an invoice, update an account, etc.)
2. Check your server logs for webhook notifications
3. Verify the event was processed correctly

## Troubleshooting

### Webhook Not Receiving Notifications

1. **Check Webhook URL**: Ensure it's accessible and returns HTTP 200
2. **Verify HTTPS**: QuickBooks requires HTTPS (use ngrok for local dev)
3. **Check Verifier Token**: Must match the token from Developer Portal
4. **Check Server Logs**: Look for webhook processing errors
5. **Verify OAuth**: Ensure OAuth connection is active

### Signature Verification Failing

1. **Check Verifier Token**: Must be the exact token from Developer Portal
2. **Environment Variable**: Verify `QUICKBOOKS_WEBHOOK_VERIFIER_TOKEN` is set
3. **Configuration**: Check if verifier token is saved in service configuration

### Webhook Returns 401

- Signature verification failed
- Check verifier token is correct
- Ensure payload is not modified before verification

## Next Steps

After webhooks are set up:

1. Webhooks will automatically trigger when QuickBooks data changes
2. You can extend the webhook handler to:
   - Sync data to your database
   - Trigger notifications
   - Update cache
   - Run business logic

## API Endpoints

- **POST** `/api/integrations/quickbooks/webhooks` - Receive webhook notifications
- **POST** `/api/integrations/quickbooks/webhooks/register` - Register webhook (automatic)
- **GET** `/api/integrations/quickbooks/webhooks/register` - Get webhook status



