-- Demo accounts setup script
-- This script creates demo users for testing the application

-- Insert demo users into auth.users table
-- Note: In a real Supabase setup, you would use the Supabase Auth API to create users
-- This is for demonstration purposes only

-- Demo Admin User
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@demo.com',
  crypt('demo123456', gen_salt('bf')),
  NOW(),
  NULL,
  NULL,
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Demo Admin"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Demo Regular User
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'user@demo.com',
  crypt('demo123456', gen_salt('bf')),
  NOW(),
  NULL,
  NULL,
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Demo User"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Create some sample returns for demo purposes
-- First, get the user IDs (this would be done differently in practice)
WITH admin_user AS (
  SELECT id FROM auth.users WHERE email = 'admin@demo.com'
),
regular_user AS (
  SELECT id FROM auth.users WHERE email = 'user@demo.com'
)

-- Insert sample returns
INSERT INTO returns (user_id, entity_name, entity_type, tax_year, source_type, file_url, status, confidence_min)
SELECT 
  admin_user.id,
  'Demo Corporation Inc.',
  '1120',
  2023,
  'pdf',
  'demo/file/path/corp_return_2023.pdf',
  'completed',
  95.5
FROM admin_user;

INSERT INTO returns (user_id, entity_name, entity_type, tax_year, source_type, file_url, status, confidence_min)
SELECT 
  regular_user.id,
  'John Smith',
  '1040',
  2023,
  'xml',
  'demo/file/path/personal_return_2023.xml',
  'completed',
  92.3
FROM regular_user;

-- Insert some sample metrics
WITH sample_return AS (
  SELECT r.id, r.user_id 
  FROM returns r 
  JOIN auth.users u ON r.user_id = u.id 
  WHERE u.email = 'admin@demo.com' 
  LIMIT 1
)
INSERT INTO metrics (return_id, name, formula, value, previous_value, trend, evidence)
SELECT 
  sample_return.id,
  'Gross Revenue',
  'SUM(line_items.value WHERE form_id = "1120" AND line_code = "1")',
  1250000.00,
  1100000.00,
  'up',
  '{"sources": ["Line 1a - Gross receipts or sales"], "confidence": 0.98}'
FROM sample_return;

WITH sample_return AS (
  SELECT r.id, r.user_id 
  FROM returns r 
  JOIN auth.users u ON r.user_id = u.id 
  WHERE u.email = 'user@demo.com' 
  LIMIT 1
)
INSERT INTO metrics (return_id, name, formula, value, previous_value, trend, evidence)
SELECT 
  sample_return.id,
  'Total Income',
  'SUM(line_items.value WHERE form_id = "1040" AND line_code = "9")',
  85000.00,
  82000.00,
  'up',
  '{"sources": ["Line 9 - Total income"], "confidence": 0.95}'
FROM sample_return;

-- Insert some sample opportunities
WITH sample_return AS (
  SELECT r.id, r.user_id 
  FROM returns r 
  JOIN auth.users u ON r.user_id = u.id 
  WHERE u.email = 'admin@demo.com' 
  LIMIT 1
)
INSERT INTO opportunities (return_id, opportunity_type, title, description, impact_amount, impact_model, trigger_rule, evidence, priority)
SELECT 
  sample_return.id,
  'tax_optimization',
  'R&D Tax Credit Opportunity',
  'Based on your research and development expenses, you may qualify for R&D tax credits that could reduce your tax liability.',
  15000.00,
  'R&D Credit Calculation',
  'IF research_expenses > 50000 THEN suggest_rd_credit',
  '{"research_expenses": 75000, "qualified_activities": ["software_development", "product_improvement"]}',
  'high'
FROM sample_return;

WITH sample_return AS (
  SELECT r.id, r.user_id 
  FROM returns r 
  JOIN auth.users u ON r.user_id = u.id 
  WHERE u.email = 'user@demo.com' 
  LIMIT 1
)
INSERT INTO opportunities (return_id, opportunity_type, title, description, impact_amount, impact_model, trigger_rule, evidence, priority)
SELECT 
  sample_return.id,
  'deduction_optimization',
  'Home Office Deduction',
  'You may be eligible for home office deductions based on your work-from-home setup.',
  2500.00,
  'Home Office Calculation',
  'IF work_from_home AND home_office_space THEN suggest_home_office_deduction',
  '{"home_office_percentage": 0.15, "total_home_expenses": 12000}',
  'medium'
FROM sample_return;

