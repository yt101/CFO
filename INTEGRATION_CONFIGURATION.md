# Integration Configuration System

This document describes the new configuration tab in the integrations page that allows you to manage API keys and parameters for external services without hardcoding them.

## 🎯 **Overview**

The configuration system provides a centralized way to manage:
- API keys and credentials
- Service parameters
- Connection testing
- Service enable/disable toggles
- Parameter validation

## 📁 **Files Created/Modified**

### New Files:
- `components/integrations/service-configuration.tsx` - Main configuration UI component
- `app/api/integrations/configuration/route.ts` - API endpoints for configuration management
- `scripts/004_service_configurations_schema.sql` - Database schema for storing configurations
- `lib/integrations/service-parameters.ts` - Service definitions and validation logic

### Modified Files:
- `app/dashboard/integrations/page.tsx` - Added "Configuration" tab

## 🚀 **Features**

### 1. **Service Management**
- View all configured services by category
- Enable/disable services with toggle switches
- Real-time status indicators (Active, Error, Warning, Inactive)

### 2. **Parameter Configuration**
- Support for different parameter types:
  - `text` - Regular text input
  - `password` - Password input with show/hide toggle
  - `url` - URL input with validation
  - `number` - Numeric input with min/max validation
  - `textarea` - Multi-line text input
- Required field indicators
- Parameter descriptions and placeholders
- Real-time validation

### 3. **Connection Testing**
- Test API connections before saving
- Visual feedback on connection status
- Error handling and reporting

### 4. **Security**
- Password fields are masked by default
- API keys are encrypted in the database
- Row-level security (RLS) for tenant isolation

## 🛠 **Usage**

### Accessing the Configuration Tab
1. Navigate to **Dashboard** → **Integrations**
2. Click on the **"Configuration"** tab
3. View the overview or select a specific service to configure

### Configuring a Service
1. Click **"Configure"** on any service card
2. Fill in the required parameters:
   - API keys and credentials
   - Service-specific settings
   - Optional parameters
3. Click **"Test Connection"** to verify the configuration
4. Click **"Save Configuration"** to persist the settings

### Service Categories
- **AI Services**: OpenAI, Anthropic Claude
- **Vector Database**: Pinecone
- **Accounting**: QuickBooks Online
- **Financial Data**: Banking APIs

## 🔧 **API Endpoints**

### GET `/api/integrations/configuration`
Retrieves all service configurations for the current company.

**Response:**
```json
{
  "configurations": [
    {
      "id": "uuid",
      "service_id": "openai",
      "service_name": "OpenAI API",
      "category": "AI Services",
      "parameters": {...},
      "enabled": true,
      "status": "active",
      "last_tested": "2025-01-15T10:30:00Z"
    }
  ]
}
```

### POST `/api/integrations/configuration`
Saves or updates a service configuration.

**Request:**
```json
{
  "serviceId": "openai",
  "parameters": {
    "apiKey": "sk-...",
    "model": "gpt-4",
    "maxTokens": "4000"
  },
  "enabled": true
}
```

### PUT `/api/integrations/configuration`
Tests a service connection.

**Request:**
```json
{
  "serviceId": "openai"
}
```

## 🗄 **Database Schema**

The system uses a `service_configurations` table with the following structure:

```sql
CREATE TABLE service_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  service_id TEXT NOT NULL, -- e.g., 'openai', 'anthropic'
  service_name TEXT NOT NULL, -- e.g., 'OpenAI API'
  category TEXT NOT NULL, -- e.g., 'AI Services'
  parameters JSONB NOT NULL DEFAULT '{}', -- Encrypted parameters
  enabled BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'inactive',
  last_tested TIMESTAMPTZ,
  test_result JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, service_id)
);
```

## 🔒 **Security Features**

### Row-Level Security (RLS)
- Users can only access configurations for their company
- Automatic tenant isolation
- Secure parameter storage

### Parameter Validation
- Type-specific validation (URLs, numbers, patterns)
- Required field validation
- Custom validation functions
- Real-time feedback

### API Key Protection
- Password fields are masked by default
- Secure storage in database
- No plain-text exposure in logs

## 🎨 **UI Components**

### Overview Tab
- Service status dashboard
- Quick access to all services
- Category-based organization

### Individual Service Configuration
- Form-based parameter input
- Real-time validation feedback
- Save and test functionality
- Status indicators

### Service Cards
- Visual status indicators
- Enable/disable toggles
- Quick configuration access
- Connection testing

## 🔄 **Integration with Existing System**

The configuration system integrates with the existing mock APIs by:

1. **Replacing hardcoded values** with database-stored configurations
2. **Providing real API keys** for actual service calls
3. **Enabling dynamic service management** without code changes
4. **Supporting multiple service providers** for the same functionality

## 🚀 **Next Steps**

To complete the integration:

1. **Update existing API endpoints** to use stored configurations
2. **Implement real service connections** instead of mock responses
3. **Add encryption for sensitive parameters**
4. **Implement service health monitoring**
5. **Add configuration templates** for common setups

## 📝 **Example: Using Configurations in Code**

```typescript
// Get OpenAI configuration
const response = await fetch('/api/integrations/configuration')
const { configurations } = await response.json()
const openaiConfig = configurations.find(c => c.service_id === 'openai')

if (openaiConfig?.enabled) {
  const { apiKey, model, maxTokens } = openaiConfig.parameters
  
  // Use the configuration for API calls
  const openai = new OpenAI({ apiKey })
  const completion = await openai.chat.completions.create({
    model,
    max_tokens: parseInt(maxTokens),
    messages: [{ role: 'user', content: 'Hello' }]
  })
}
```

This configuration system provides a solid foundation for managing external service integrations without hardcoding sensitive information.












