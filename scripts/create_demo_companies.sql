-- Create demo companies and users with company isolation
-- This script creates demo data for testing company-level data isolation

-- Insert demo companies
INSERT INTO companies (id, name, domain, plan, settings) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Acme Corporation', 'acme.com', 'premium', '{"modules": ["cash_flow", "finance", "tax_optimization", "analytics"]}'),
('550e8400-e29b-41d4-a716-446655440002', 'TechStart Inc', 'techstart.com', 'basic', '{"modules": ["cash_flow", "finance"]}'),
('550e8400-e29b-41d4-a716-446655440003', 'Global Industries Ltd', 'globalindustries.com', 'enterprise', '{"modules": ["cash_flow", "finance", "human_resource", "tax_optimization", "supply_chain", "analytics", "industry_specific"]}')
ON CONFLICT (id) DO NOTHING;

-- Create demo users (these would normally be created through Supabase Auth)
-- For demo purposes, we'll create user profiles that reference the auth.users table
-- In a real setup, these users would be created through the authentication system first

-- Note: In production, you would:
-- 1. Create users through Supabase Auth
-- 2. Then create user_profiles that link to those users
-- 3. The company_id would be set based on the user's company domain or manual assignment

-- For demo mode, we'll create placeholder user profiles
-- These would be replaced with actual user creation flow in production

INSERT INTO user_profiles (id, user_id, company_id, role, permissions) VALUES
-- Acme Corporation users
('660e8400-e29b-41d4-a716-446655440001', 'demo-admin-id', '550e8400-e29b-41d4-a716-446655440001', 'admin', '{"all_modules": true}'),
('660e8400-e29b-41d4-a716-446655440002', 'demo-user-id', '550e8400-e29b-41d4-a716-446655440001', 'user', '{"cash_flow": true, "finance": true}'),

-- TechStart Inc users  
('660e8400-e29b-41d4-a716-446655440003', 'demo-tech-admin-id', '550e8400-e29b-41d4-a716-446655440002', 'admin', '{"basic_modules": true}'),
('660e8400-e29b-41d4-a716-446655440004', 'demo-tech-user-id', '550e8400-e29b-41d4-a716-446655440002', 'user', '{"cash_flow": true}'),

-- Global Industries Ltd users
('660e8400-e29b-41d4-a716-446655440005', 'demo-global-admin-id', '550e8400-e29b-41d4-a716-446655440003', 'admin', '{"all_modules": true}'),
('660e8400-e29b-41d4-a716-446655440006', 'demo-global-user-id', '550e8400-e29b-41d4-a716-446655440003', 'user', '{"all_modules": true}')
ON CONFLICT (id) DO NOTHING;

-- Insert company settings for each company
INSERT INTO company_settings (company_id, module_name, enabled, settings) VALUES
-- Acme Corporation settings
('550e8400-e29b-41d4-a716-446655440001', 'cash_flow', true, '{"forecasting_enabled": true, "optimization_enabled": true}'),
('550e8400-e29b-41d4-a716-446655440001', 'finance', true, '{"reporting_enabled": true, "kpi_tracking": true}'),
('550e8400-e29b-41d4-a716-446655440001', 'human_resource', false, '{}'),
('550e8400-e29b-41d4-a716-446655440001', 'tax_optimization', true, '{"auto_optimization": true}'),
('550e8400-e29b-41d4-a716-446655440001', 'supply_chain', false, '{}'),
('550e8400-e29b-41d4-a716-446655440001', 'analytics', true, '{"advanced_analytics": true}'),
('550e8400-e29b-41d4-a716-446655440001', 'industry_specific', false, '{}'),

-- TechStart Inc settings
('550e8400-e29b-41d4-a716-446655440002', 'cash_flow', true, '{"basic_forecasting": true}'),
('550e8400-e29b-41d4-a716-446655440002', 'finance', true, '{"basic_reporting": true}'),
('550e8400-e29b-41d4-a716-446655440002', 'human_resource', false, '{}'),
('550e8400-e29b-41d4-a716-446655440002', 'tax_optimization', false, '{}'),
('550e8400-e29b-41d4-a716-446655440002', 'supply_chain', false, '{}'),
('550e8400-e29b-41d4-a716-446655440002', 'analytics', false, '{}'),
('550e8400-e29b-41d4-a716-446655440002', 'industry_specific', false, '{}'),

-- Global Industries Ltd settings
('550e8400-e29b-41d4-a716-446655440003', 'cash_flow', true, '{"enterprise_forecasting": true, "multi_entity": true}'),
('550e8400-e29b-41d4-a716-446655440003', 'finance', true, '{"enterprise_reporting": true, "consolidation": true}'),
('550e8400-e29b-41d4-a716-446655440003', 'human_resource', true, '{"workforce_analytics": true, "talent_management": true}'),
('550e8400-e29b-41d4-a716-446655440003', 'tax_optimization', true, '{"global_tax_optimization": true, "compliance_automation": true}'),
('550e8400-e29b-41d4-a716-446655440003', 'supply_chain', true, '{"global_supply_chain": true, "risk_management": true}'),
('550e8400-e29b-41d4-a716-446655440003', 'analytics', true, '{"enterprise_analytics": true, "predictive_modeling": true}'),
('550e8400-e29b-41d4-a716-446655440003', 'industry_specific', true, '{"manufacturing_optimization": true}')
ON CONFLICT (company_id, module_name) DO NOTHING;

-- Insert demo returns data with company isolation
INSERT INTO returns (id, user_id, company_id, entity_name, entity_type, tax_year, source_type, file_url, status, confidence_min) VALUES
-- Acme Corporation returns
('770e8400-e29b-41d4-a716-446655440001', 'demo-admin-id', '550e8400-e29b-41d4-a716-446655440001', 'Acme Corporation', '1120', 2023, 'pdf', 'acme/corp_return_2023.pdf', 'completed', 95.5),
('770e8400-e29b-41d4-a716-446655440002', 'demo-user-id', '550e8400-e29b-41d4-a716-446655440001', 'Acme Subsidiary LLC', '1120', 2023, 'xml', 'acme/subsidiary_return_2023.xml', 'completed', 92.3),

-- TechStart Inc returns
('770e8400-e29b-41d4-a716-446655440003', 'demo-tech-admin-id', '550e8400-e29b-41d4-a716-446655440002', 'TechStart Inc', '1120', 2023, 'pdf', 'techstart/corp_return_2023.pdf', 'completed', 88.7),
('770e8400-e29b-41d4-a716-446655440004', 'demo-tech-user-id', '550e8400-e29b-41d4-a716-446655440002', 'TechStart Founder', '1040', 2023, 'pdf', 'techstart/founder_return_2023.pdf', 'completed', 91.2),

-- Global Industries Ltd returns
('770e8400-e29b-41d4-a716-446655440005', 'demo-global-admin-id', '550e8400-e29b-41d4-a716-446655440003', 'Global Industries Ltd', '1120', 2023, 'pdf', 'global/corp_return_2023.pdf', 'completed', 96.8),
('770e8400-e29b-41d4-a716-446655440006', 'demo-global-user-id', '550e8400-e29b-41d4-a716-446655440003', 'Global Manufacturing Div', '1120', 2023, 'xml', 'global/manufacturing_return_2023.xml', 'completed', 94.1)
ON CONFLICT (id) DO NOTHING;

-- Insert demo metrics with company isolation
INSERT INTO metrics (return_id, name, formula, value, previous_value, trend, evidence) VALUES
-- Acme Corporation metrics
('770e8400-e29b-41d4-a716-446655440001', 'Current Ratio', 'Current Assets / Current Liabilities', 2.1, 1.9, 'up', '{"source": "balance_sheet", "confidence": 0.95}'),
('770e8400-e29b-41d4-a716-446655440001', 'Quick Ratio', '(Current Assets - Inventory) / Current Liabilities', 1.8, 1.6, 'up', '{"source": "balance_sheet", "confidence": 0.92}'),
('770e8400-e29b-41d4-a716-446655440002', 'Current Ratio', 'Current Assets / Current Liabilities', 2.3, 2.0, 'up', '{"source": "balance_sheet", "confidence": 0.88}'),

-- TechStart Inc metrics
('770e8400-e29b-41d4-a716-446655440003', 'Current Ratio', 'Current Assets / Current Liabilities', 3.2, 2.8, 'up', '{"source": "balance_sheet", "confidence": 0.85}'),
('770e8400-e29b-41d4-a716-446655440004', 'Adjusted Gross Income', 'Line 11', 125000, 110000, 'up', '{"source": "1040", "confidence": 0.91}'),

-- Global Industries Ltd metrics
('770e8400-e29b-41d4-a716-446655440005', 'Current Ratio', 'Current Assets / Current Liabilities', 1.9, 2.1, 'down', '{"source": "consolidated_balance_sheet", "confidence": 0.96}'),
('770e8400-e29b-41d4-a716-446655440006', 'Inventory Turnover', 'COGS / Average Inventory', 8.5, 7.9, 'up', '{"source": "manufacturing_division", "confidence": 0.94}')
ON CONFLICT DO NOTHING;

-- Insert demo opportunities with company isolation
INSERT INTO opportunities (return_id, opportunity_type, title, description, impact_amount, priority, evidence) VALUES
-- Acme Corporation opportunities
('770e8400-e29b-41d4-a716-446655440001', 'tax_optimization', 'R&D Tax Credit Opportunity', 'Based on your research and development expenses, you may qualify for R&D tax credits.', 15000, 'high', '{"rd_expenses": 75000, "qualifying_activities": ["software_development", "product_improvement"]}'),
('770e8400-e29b-41d4-a716-446655440002', 'deduction_optimization', 'Business Equipment Deduction', 'Consider Section 179 deduction for new equipment purchases.', 8500, 'medium', '{"equipment_purchases": 42500, "section_179_limit": 1080000}'),

-- TechStart Inc opportunities
('770e8400-e29b-41d4-a716-446655440003', 'startup_credits', 'Startup Tax Credits', 'Eligible for various startup tax credits and deductions.', 25000, 'high', '{"startup_expenses": 50000, "qualifying_credits": ["rd_credit", "startup_deduction"]}'),
('770e8400-e29b-41d4-a716-446655440004', 'home_office', 'Home Office Deduction', 'You may be eligible for home office deductions.', 3200, 'medium', '{"home_office_area": 150, "business_use_percentage": 0.25}'),

-- Global Industries Ltd opportunities
('770e8400-e29b-41d4-a716-446655440005', 'international_tax', 'Foreign Tax Credit Optimization', 'Optimize foreign tax credits for international operations.', 45000, 'high', '{"foreign_income": 500000, "foreign_taxes_paid": 125000}'),
('770e8400-e29b-41d4-a716-446655440006', 'manufacturing_deduction', 'Manufacturing Deduction (Section 199A)', 'Qualify for 20% deduction on manufacturing income.', 18000, 'medium', '{"manufacturing_income": 90000, "wage_limit_met": true}')
ON CONFLICT DO NOTHING;

-- Insert demo chat sessions with company isolation
INSERT INTO chat_sessions (id, user_id, company_id, return_id, title) VALUES
-- Acme Corporation chat sessions
('880e8400-e29b-41d4-a716-446655440001', 'demo-admin-id', '550e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'Acme Corp Tax Analysis'),
('880e8400-e29b-41d4-a716-446655440002', 'demo-user-id', '550e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440002', 'Subsidiary Optimization'),

-- TechStart Inc chat sessions
('880e8400-e29b-41d4-a716-446655440003', 'demo-tech-admin-id', '550e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440003', 'TechStart Tax Planning'),
('880e8400-e29b-41d4-a716-446655440004', 'demo-tech-user-id', '550e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440004', 'Personal Tax Questions'),

-- Global Industries Ltd chat sessions
('880e8400-e29b-41d4-a716-446655440005', 'demo-global-admin-id', '550e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440005', 'Global Tax Strategy'),
('880e8400-e29b-41d4-a716-446655440006', 'demo-global-user-id', '550e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440006', 'Manufacturing Division Analysis')
ON CONFLICT (id) DO NOTHING;





























