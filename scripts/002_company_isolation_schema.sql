-- Company Isolation Schema Update
-- This script adds company-level data isolation to the existing schema

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  domain TEXT UNIQUE,
  plan TEXT DEFAULT 'basic' CHECK (plan IN ('basic', 'premium', 'enterprise')),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add company_id to existing tables
ALTER TABLE returns ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;

-- Create user_profiles table to link users to companies
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user', 'viewer')),
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, company_id)
);

-- Create company_settings table for module access control
CREATE TABLE IF NOT EXISTS company_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  module_name TEXT NOT NULL,
  enabled BOOLEAN DEFAULT false,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, module_name)
);

-- Drop existing RLS policies (we'll recreate them with company isolation)
DROP POLICY IF EXISTS "Users can view their own returns" ON returns;
DROP POLICY IF EXISTS "Users can insert their own returns" ON returns;
DROP POLICY IF EXISTS "Users can update their own returns" ON returns;
DROP POLICY IF EXISTS "Users can delete their own returns" ON returns;

DROP POLICY IF EXISTS "Users can view line_items for their returns" ON line_items;
DROP POLICY IF EXISTS "Users can insert line_items for their returns" ON line_items;

DROP POLICY IF EXISTS "Users can view metrics for their returns" ON metrics;
DROP POLICY IF EXISTS "Users can insert metrics for their returns" ON metrics;

DROP POLICY IF EXISTS "Users can view opportunities for their returns" ON opportunities;
DROP POLICY IF EXISTS "Users can insert opportunities for their returns" ON opportunities;

DROP POLICY IF EXISTS "Users can view their own chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can insert their own chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can update their own chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can delete their own chat sessions" ON chat_sessions;

DROP POLICY IF EXISTS "Users can view messages in their chat sessions" ON chat_messages;
DROP POLICY IF EXISTS "Users can insert messages in their chat sessions" ON chat_messages;

-- Enable RLS on new tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

-- Company-level RLS Policies for companies table
CREATE POLICY "Users can view their own company"
  ON companies FOR SELECT
  USING (id IN (
    SELECT company_id FROM user_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Admins can update their company"
  ON companies FOR UPDATE
  USING (id IN (
    SELECT company_id FROM user_profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- Company-level RLS Policies for user_profiles table
CREATE POLICY "Users can view profiles in their company"
  ON user_profiles FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM user_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Admins can manage user profiles in their company"
  ON user_profiles FOR ALL
  USING (company_id IN (
    SELECT company_id FROM user_profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- Company-level RLS Policies for company_settings table
CREATE POLICY "Users can view settings for their company"
  ON company_settings FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM user_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Admins can manage settings for their company"
  ON company_settings FOR ALL
  USING (company_id IN (
    SELECT company_id FROM user_profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- Updated RLS Policies for returns table (company-level isolation)
CREATE POLICY "Users can view returns for their company"
  ON returns FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM user_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert returns for their company"
  ON returns FOR INSERT
  WITH CHECK (company_id IN (
    SELECT company_id FROM user_profiles WHERE user_id = auth.uid()
  ) AND user_id = auth.uid());

CREATE POLICY "Users can update returns for their company"
  ON returns FOR UPDATE
  USING (company_id IN (
    SELECT company_id FROM user_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete returns for their company"
  ON returns FOR DELETE
  USING (company_id IN (
    SELECT company_id FROM user_profiles WHERE user_id = auth.uid()
  ));

-- Updated RLS Policies for line_items table (company-level isolation)
CREATE POLICY "Users can view line_items for their company returns"
  ON line_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM returns 
    WHERE returns.id = line_items.return_id 
    AND returns.company_id IN (
      SELECT company_id FROM user_profiles WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can insert line_items for their company returns"
  ON line_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM returns 
    WHERE returns.id = line_items.return_id 
    AND returns.company_id IN (
      SELECT company_id FROM user_profiles WHERE user_id = auth.uid()
    )
  ));

-- Updated RLS Policies for metrics table (company-level isolation)
CREATE POLICY "Users can view metrics for their company returns"
  ON metrics FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM returns 
    WHERE returns.id = metrics.return_id 
    AND returns.company_id IN (
      SELECT company_id FROM user_profiles WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can insert metrics for their company returns"
  ON metrics FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM returns 
    WHERE returns.id = metrics.return_id 
    AND returns.company_id IN (
      SELECT company_id FROM user_profiles WHERE user_id = auth.uid()
    )
  ));

-- Updated RLS Policies for opportunities table (company-level isolation)
CREATE POLICY "Users can view opportunities for their company returns"
  ON opportunities FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM returns 
    WHERE returns.id = opportunities.return_id 
    AND returns.company_id IN (
      SELECT company_id FROM user_profiles WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can insert opportunities for their company returns"
  ON opportunities FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM returns 
    WHERE returns.id = opportunities.return_id 
    AND returns.company_id IN (
      SELECT company_id FROM user_profiles WHERE user_id = auth.uid()
    )
  ));

-- Updated RLS Policies for chat_sessions table (company-level isolation)
CREATE POLICY "Users can view chat sessions for their company"
  ON chat_sessions FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM user_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert chat sessions for their company"
  ON chat_sessions FOR INSERT
  WITH CHECK (company_id IN (
    SELECT company_id FROM user_profiles WHERE user_id = auth.uid()
  ) AND user_id = auth.uid());

CREATE POLICY "Users can update chat sessions for their company"
  ON chat_sessions FOR UPDATE
  USING (company_id IN (
    SELECT company_id FROM user_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete chat sessions for their company"
  ON chat_sessions FOR DELETE
  USING (company_id IN (
    SELECT company_id FROM user_profiles WHERE user_id = auth.uid()
  ));

-- Updated RLS Policies for chat_messages table (company-level isolation)
CREATE POLICY "Users can view messages in their company chat sessions"
  ON chat_messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM chat_sessions 
    WHERE chat_sessions.id = chat_messages.session_id 
    AND chat_sessions.company_id IN (
      SELECT company_id FROM user_profiles WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can insert messages in their company chat sessions"
  ON chat_messages FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM chat_sessions 
    WHERE chat_sessions.id = chat_messages.session_id 
    AND chat_sessions.company_id IN (
      SELECT company_id FROM user_profiles WHERE user_id = auth.uid()
    )
  ));

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_returns_company_id ON returns(company_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_company_id ON chat_sessions(company_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_company_id ON user_profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_company_settings_company_id ON company_settings(company_id);

-- Create function to get user's company_id
CREATE OR REPLACE FUNCTION get_user_company_id(user_uuid UUID)
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT company_id FROM user_profiles 
    WHERE user_id = user_uuid 
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user has access to company
CREATE OR REPLACE FUNCTION user_has_company_access(user_uuid UUID, company_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = user_uuid AND company_id = company_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default company settings for all modules
INSERT INTO company_settings (company_id, module_name, enabled) 
SELECT 
  c.id,
  module_name,
  CASE 
    WHEN module_name IN ('cash_flow', 'finance', 'tax_optimization', 'analytics') THEN true
    ELSE false
  END
FROM companies c
CROSS JOIN (
  VALUES 
    ('cash_flow'),
    ('finance'),
    ('human_resource'),
    ('tax_optimization'),
    ('supply_chain'),
    ('analytics'),
    ('industry_specific')
) AS modules(module_name)
ON CONFLICT (company_id, module_name) DO NOTHING;





























