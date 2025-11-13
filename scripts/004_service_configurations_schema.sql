-- Service Configurations Schema
-- This table stores API keys and configuration parameters for external services

CREATE TABLE IF NOT EXISTS service_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  service_id TEXT NOT NULL, -- e.g., 'openai', 'anthropic', 'quickbooks'
  service_name TEXT NOT NULL, -- e.g., 'OpenAI API', 'Anthropic Claude'
  category TEXT NOT NULL, -- e.g., 'AI Services', 'Accounting', 'Financial Data'
  parameters JSONB NOT NULL DEFAULT '{}', -- Encrypted API keys and configuration
  enabled BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'error', 'warning', 'inactive')),
  last_tested TIMESTAMPTZ,
  test_result JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id),
  
  -- Ensure one configuration per service per company
  UNIQUE(company_id, service_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_service_configurations_company_id ON service_configurations(company_id);
CREATE INDEX IF NOT EXISTS idx_service_configurations_service_id ON service_configurations(service_id);
CREATE INDEX IF NOT EXISTS idx_service_configurations_status ON service_configurations(status);

-- Enable Row Level Security
ALTER TABLE service_configurations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for service_configurations
CREATE POLICY "Users can view their company's service configurations"
  ON service_configurations FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM company_context 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert service configurations for their company"
  ON service_configurations FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM company_context 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their company's service configurations"
  ON service_configurations FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id FROM company_context 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their company's service configurations"
  ON service_configurations FOR DELETE
  USING (
    company_id IN (
      SELECT company_id FROM company_context 
      WHERE user_id = auth.uid()
    )
  );

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_service_configurations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_service_configurations_updated_at
  BEFORE UPDATE ON service_configurations
  FOR EACH ROW
  EXECUTE FUNCTION update_service_configurations_updated_at();

-- Insert default service templates (these are just templates, not actual configurations)
INSERT INTO service_configurations (company_id, service_id, service_name, category, parameters, enabled, status)
SELECT 
  c.id,
  'openai',
  'OpenAI API',
  'AI Services',
  '{"apiKey": "", "model": "gpt-4", "maxTokens": "4000", "temperature": "0.7"}'::jsonb,
  false,
  'inactive'
FROM companies c
WHERE NOT EXISTS (
  SELECT 1 FROM service_configurations sc 
  WHERE sc.company_id = c.id AND sc.service_id = 'openai'
);

INSERT INTO service_configurations (company_id, service_id, service_name, category, parameters, enabled, status)
SELECT 
  c.id,
  'anthropic',
  'Anthropic Claude',
  'AI Services',
  '{"apiKey": "", "model": "claude-3-sonnet-20240229", "maxTokens": "4000"}'::jsonb,
  false,
  'inactive'
FROM companies c
WHERE NOT EXISTS (
  SELECT 1 FROM service_configurations sc 
  WHERE sc.company_id = c.id AND sc.service_id = 'anthropic'
);

INSERT INTO service_configurations (company_id, service_id, service_name, category, parameters, enabled, status)
SELECT 
  c.id,
  'pinecone',
  'Pinecone Vector Database',
  'Vector Database',
  '{"apiKey": "", "environment": "", "indexName": "cfo-knowledge"}'::jsonb,
  false,
  'inactive'
FROM companies c
WHERE NOT EXISTS (
  SELECT 1 FROM service_configurations sc 
  WHERE sc.company_id = c.id AND sc.service_id = 'pinecone'
);

INSERT INTO service_configurations (company_id, service_id, service_name, category, parameters, enabled, status)
SELECT 
  c.id,
  'quickbooks',
  'QuickBooks Online',
  'Accounting',
  '{"clientId": "", "clientSecret": "", "companyId": "", "webhookUrl": ""}'::jsonb,
  false,
  'inactive'
FROM companies c
WHERE NOT EXISTS (
  SELECT 1 FROM service_configurations sc 
  WHERE sc.company_id = c.id AND sc.service_id = 'quickbooks'
);

INSERT INTO service_configurations (company_id, service_id, service_name, category, parameters, enabled, status)
SELECT 
  c.id,
  'banking',
  'Banking API',
  'Financial Data',
  '{"apiKey": "", "baseUrl": "", "accountIds": ""}'::jsonb,
  false,
  'inactive'
FROM companies c
WHERE NOT EXISTS (
  SELECT 1 FROM service_configurations sc 
  WHERE sc.company_id = c.id AND sc.service_id = 'banking'
);












