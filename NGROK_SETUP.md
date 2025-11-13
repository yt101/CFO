# Ngrok Setup for Local Webhook Testing

Ngrok creates a secure tunnel to your local server, allowing QuickBooks to send webhooks to your local development environment.

## Installation

### Option 1: Download ngrok
1. Go to https://ngrok.com/download
2. Download for Windows
3. Extract `ngrok.exe` to a folder (e.g., `C:\ngrok`)
4. Add to PATH or use full path when running

### Option 2: Install via npm (Recommended)
```bash
npm install -g ngrok
```

### Option 3: Install via Chocolatey
```bash
choco install ngrok
```

## Getting Your Webhook URL

### Step 1: Start Your Local Server
Make sure your Next.js server is running on port 3000:
```bash
npm run dev
```

### Step 2: Start Ngrok
Open a new terminal and run:
```bash
ngrok http 3000
```

Or if installed globally:
```bash
npx ngrok http 3000
```

### Step 3: Get Your URL
Ngrok will display output like:
```
Forwarding  https://abc123def456.ngrok-free.app -> http://localhost:3000
```

Your webhook URL will be:
```
https://abc123def456.ngrok-free.app/api/integrations/quickbooks/webhooks
```

### Step 4: Copy the HTTPS URL
- Look for the line starting with `Forwarding`
- Copy the HTTPS URL (not HTTP)
- Use this as your webhook URL in QuickBooks Developer Portal

## Important Notes

⚠️ **Free ngrok URLs change every time you restart ngrok**
- Each time you run `ngrok http 3000`, you get a new random URL
- You'll need to update the webhook URL in QuickBooks Developer Portal each time

✅ **Solutions for Stable URLs:**
1. **Ngrok Paid Plan**: Get a fixed domain (e.g., `myapp.ngrok.io`)
2. **Keep ngrok running**: Don't restart ngrok between testing sessions
3. **Use environment-specific webhooks**: Different URLs for dev/staging/production

## Quick Commands

```bash
# Start ngrok (in separate terminal)
ngrok http 3000

# View ngrok dashboard (shows current URL)
# Open browser: http://localhost:4040

# Get current URL programmatically
curl http://localhost:4040/api/tunnels
```

## For This Project

Your QuickBooks webhook endpoint URL format:
```
https://[your-ngrok-url].ngrok-free.app/api/integrations/quickbooks/webhooks
```

Example:
```
https://abc123def456.ngrok-free.app/api/integrations/quickbooks/webhooks
```



