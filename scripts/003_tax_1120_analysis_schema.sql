-- Tax 1120 Analysis Schema
-- This script creates tables for AI-powered 1120 tax analysis and optimization

-- Company profile for tax analysis
CREATE TABLE IF NOT EXISTS company_tax_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    ein VARCHAR(20) NOT NULL,
    fiscal_year INTEGER NOT NULL,
    industry_code VARCHAR(10),
    entity_type VARCHAR(50), -- C-Corp, S-Corp, Partnership, etc.
    revenue_range VARCHAR(50), -- <$1M, $1M-$5M, $5M-$20M, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, fiscal_year)
);

-- Schedule L (Balance Sheet) data
CREATE TABLE IF NOT EXISTS schedule_l_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_tax_profile_id UUID NOT NULL REFERENCES company_tax_profiles(id) ON DELETE CASCADE,
    line_number INTEGER NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    beginning_year DECIMAL(15,2),
    end_year DECIMAL(15,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_tax_profile_id, line_number)
);

-- Schedule M-1 (Reconciliation) data
CREATE TABLE IF NOT EXISTS schedule_m1_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_tax_profile_id UUID NOT NULL REFERENCES company_tax_profiles(id) ON DELETE CASCADE,
    line_number INTEGER NOT NULL,
    item_description VARCHAR(500) NOT NULL,
    book_amount DECIMAL(15,2),
    tax_amount DECIMAL(15,2),
    difference DECIMAL(15,2),
    difference_type VARCHAR(50), -- 'permanent', 'timing', 'adjustment'
    irs_code VARCHAR(20), -- Reference to IRC section
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_tax_profile_id, line_number)
);

-- Schedule M-2 (Retained Earnings) data
CREATE TABLE IF NOT EXISTS schedule_m2_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_tax_profile_id UUID NOT NULL REFERENCES company_tax_profiles(id) ON DELETE CASCADE,
    beginning_retained_earnings DECIMAL(15,2),
    net_income DECIMAL(15,2),
    distributions DECIMAL(15,2),
    other_adjustments DECIMAL(15,2),
    ending_retained_earnings DECIMAL(15,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Financial ratios and metrics
CREATE TABLE IF NOT EXISTS tax_financial_ratios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_tax_profile_id UUID NOT NULL REFERENCES company_tax_profiles(id) ON DELETE CASCADE,
    dso DECIMAL(8,2), -- Days Sales Outstanding
    dpo DECIMAL(8,2), -- Days Payable Outstanding
    dio DECIMAL(8,2), -- Days Inventory Outstanding
    current_ratio DECIMAL(8,2),
    debt_to_equity DECIMAL(8,2),
    gross_margin DECIMAL(8,2),
    operating_margin DECIMAL(8,2),
    net_margin DECIMAL(8,2),
    cash_conversion_cycle DECIMAL(8,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tax optimization opportunities and actions
CREATE TABLE IF NOT EXISTS tax_optimization_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_tax_profile_id UUID NOT NULL REFERENCES company_tax_profiles(id) ON DELETE CASCADE,
    focus_area VARCHAR(100) NOT NULL, -- 'Deductions', 'Timing', 'Working Capital', etc.
    finding_description TEXT NOT NULL,
    recommended_action TEXT NOT NULL,
    assigned_to VARCHAR(255),
    due_date DATE,
    estimated_benefit DECIMAL(15,2),
    confidence_score DECIMAL(3,2), -- 0.00 to 1.00
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'cancelled'
    irs_reference VARCHAR(100),
    source_line VARCHAR(100), -- Which line in 1120 this relates to
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI analysis results and insights
CREATE TABLE IF NOT EXISTS tax_ai_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_tax_profile_id UUID NOT NULL REFERENCES company_tax_profiles(id) ON DELETE CASCADE,
    insight_type VARCHAR(100) NOT NULL, -- 'deduction_opportunity', 'timing_optimization', 'working_capital'
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    confidence_score DECIMAL(3,2),
    impact_score DECIMAL(3,2), -- Potential financial impact
    supporting_evidence TEXT, -- Line references, calculations
    irs_references TEXT[], -- Array of IRC sections
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document uploads and processing status
CREATE TABLE IF NOT EXISTS tax_document_uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_tax_profile_id UUID NOT NULL REFERENCES company_tax_profiles(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL, -- 'pdf', 'xlsx', 'csv'
    file_size INTEGER,
    upload_status VARCHAR(50) DEFAULT 'uploaded', -- 'uploaded', 'processing', 'completed', 'failed'
    processing_errors TEXT[],
    extracted_data JSONB, -- Store parsed data as JSON
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_company_tax_profiles_company_id ON company_tax_profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_company_tax_profiles_fiscal_year ON company_tax_profiles(fiscal_year);
CREATE INDEX IF NOT EXISTS idx_schedule_l_data_profile_id ON schedule_l_data(company_tax_profile_id);
CREATE INDEX IF NOT EXISTS idx_schedule_m1_data_profile_id ON schedule_m1_data(company_tax_profile_id);
CREATE INDEX IF NOT EXISTS idx_tax_optimization_actions_profile_id ON tax_optimization_actions(company_tax_profile_id);
CREATE INDEX IF NOT EXISTS idx_tax_optimization_actions_status ON tax_optimization_actions(status);
CREATE INDEX IF NOT EXISTS idx_tax_ai_insights_profile_id ON tax_ai_insights(company_tax_profile_id);

-- Row Level Security (RLS) policies
ALTER TABLE company_tax_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_l_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_m1_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_m2_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_financial_ratios ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_optimization_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_document_uploads ENABLE ROW LEVEL SECURITY;

-- RLS policies for company isolation
CREATE POLICY "Users can only access their company tax profiles" ON company_tax_profiles
    FOR ALL USING (company_id IN (
        SELECT company_id FROM user_profiles WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can only access schedule data for their company" ON schedule_l_data
    FOR ALL USING (company_tax_profile_id IN (
        SELECT ctp.id FROM company_tax_profiles ctp
        JOIN user_profiles up ON ctp.company_id = up.company_id
        WHERE up.user_id = auth.uid()
    ));

CREATE POLICY "Users can only access M1 data for their company" ON schedule_m1_data
    FOR ALL USING (company_tax_profile_id IN (
        SELECT ctp.id FROM company_tax_profiles ctp
        JOIN user_profiles up ON ctp.company_id = up.company_id
        WHERE up.user_id = auth.uid()
    ));

CREATE POLICY "Users can only access M2 data for their company" ON schedule_m2_data
    FOR ALL USING (company_tax_profile_id IN (
        SELECT ctp.id FROM company_tax_profiles ctp
        JOIN user_profiles up ON ctp.company_id = up.company_id
        WHERE up.user_id = auth.uid()
    ));

CREATE POLICY "Users can only access ratios for their company" ON tax_financial_ratios
    FOR ALL USING (company_tax_profile_id IN (
        SELECT ctp.id FROM company_tax_profiles ctp
        JOIN user_profiles up ON ctp.company_id = up.company_id
        WHERE up.user_id = auth.uid()
    ));

CREATE POLICY "Users can only access actions for their company" ON tax_optimization_actions
    FOR ALL USING (company_tax_profile_id IN (
        SELECT ctp.id FROM company_tax_profiles ctp
        JOIN user_profiles up ON ctp.company_id = up.company_id
        WHERE up.user_id = auth.uid()
    ));

CREATE POLICY "Users can only access insights for their company" ON tax_ai_insights
    FOR ALL USING (company_tax_profile_id IN (
        SELECT ctp.id FROM company_tax_profiles ctp
        JOIN user_profiles up ON ctp.company_id = up.company_id
        WHERE up.user_id = auth.uid()
    ));

CREATE POLICY "Users can only access documents for their company" ON tax_document_uploads
    FOR ALL USING (company_tax_profile_id IN (
        SELECT ctp.id FROM company_tax_profiles ctp
        JOIN user_profiles up ON ctp.company_id = up.company_id
        WHERE up.user_id = auth.uid()
    ));

-- Insert demo data for testing
INSERT INTO company_tax_profiles (company_id, ein, fiscal_year, industry_code, entity_type, revenue_range)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', '12-3456789', 2024, '541211', 'C-Corp', '$5M-$20M')
ON CONFLICT (company_id, fiscal_year) DO NOTHING;

-- Get the demo tax profile ID for related data
DO $$
DECLARE
    demo_profile_id UUID;
BEGIN
    SELECT id INTO demo_profile_id FROM company_tax_profiles WHERE company_id = '550e8400-e29b-41d4-a716-446655440001' AND fiscal_year = 2024;
    
    -- Insert demo Schedule L data
    INSERT INTO schedule_l_data (company_tax_profile_id, line_number, account_name, beginning_year, end_year)
    VALUES 
        (demo_profile_id, 1, 'Cash', 125000, 150000),
        (demo_profile_id, 2, 'Trade notes and accounts receivable', 450000, 520000),
        (demo_profile_id, 3, 'Less allowance for bad debts', -25000, -30000),
        (demo_profile_id, 4, 'Inventories', 300000, 350000),
        (demo_profile_id, 5, 'U.S. government obligations', 0, 0),
        (demo_profile_id, 6, 'Tax-exempt securities', 0, 0),
        (demo_profile_id, 7, 'Other current assets', 50000, 60000),
        (demo_profile_id, 8, 'Loans to stockholders', 100000, 120000),
        (demo_profile_id, 9, 'Mortgage and real estate loans', 0, 0),
        (demo_profile_id, 10, 'Other investments', 0, 0),
        (demo_profile_id, 11, 'Buildings and other depreciable assets', 800000, 850000),
        (demo_profile_id, 12, 'Less accumulated depreciation', -200000, -250000),
        (demo_profile_id, 13, 'Depletable assets', 0, 0),
        (demo_profile_id, 14, 'Less accumulated depletion', 0, 0),
        (demo_profile_id, 15, 'Land (net of any amortization)', 200000, 200000),
        (demo_profile_id, 16, 'Intangible assets (amortizable only)', 150000, 140000),
        (demo_profile_id, 17, 'Less accumulated amortization', -30000, -40000),
        (demo_profile_id, 18, 'Other assets', 75000, 80000),
        (demo_profile_id, 19, 'Total assets', 1700000, 1840000),
        (demo_profile_id, 20, 'Accounts payable', 180000, 200000),
        (demo_profile_id, 21, 'Mortgages, notes, bonds payable in less than 1 year', 100000, 120000),
        (demo_profile_id, 22, 'Other current liabilities', 80000, 90000)
    ON CONFLICT (company_tax_profile_id, line_number) DO NOTHING;

    -- Insert demo Schedule M-1 data
    INSERT INTO schedule_m1_data (company_tax_profile_id, line_number, item_description, book_amount, tax_amount, difference, difference_type, irs_code)
    VALUES 
        (demo_profile_id, 1, 'Income per books', 250000, 250000, 0, 'none', ''),
        (demo_profile_id, 2, 'Federal income tax per books', 75000, 75000, 0, 'none', ''),
        (demo_profile_id, 3, 'Excess of capital losses over capital gains', 0, 0, 0, 'none', ''),
        (demo_profile_id, 4, 'Income subject to tax not recorded on books this year', 0, 0, 0, 'none', ''),
        (demo_profile_id, 5, 'Expenses recorded on books this year not deducted on this return', 15000, 0, 15000, 'timing', '§263A'),
        (demo_profile_id, 6, 'Depreciation', 45000, 60000, 15000, 'timing', '§168'),
        (demo_profile_id, 7, 'Charitable contributions', 10000, 10000, 0, 'none', ''),
        (demo_profile_id, 8, 'Meals and entertainment', 5000, 2500, 2500, 'permanent', '§274'),
        (demo_profile_id, 9, 'Interest on state and local bonds', 0, 0, 0, 'none', ''),
        (demo_profile_id, 10, 'Other deductions', 0, 0, 0, 'none', ''),
        (demo_profile_id, 11, 'Total additions', 0, 0, 0, 'none', ''),
        (demo_profile_id, 12, 'Income recorded on books this year not included on this return', 0, 0, 0, 'none', ''),
        (demo_profile_id, 13, 'Expenses deducted on this return not charged against book income this year', 0, 0, 0, 'none', ''),
        (demo_profile_id, 14, 'Depreciation', 0, 0, 0, 'none', ''),
        (demo_profile_id, 15, 'Charitable contributions', 0, 0, 0, 'none', ''),
        (demo_profile_id, 16, 'Other deductions', 0, 0, 0, 'none', ''),
        (demo_profile_id, 17, 'Total subtractions', 0, 0, 0, 'none', ''),
        (demo_profile_id, 18, 'Net income', 250000, 250000, 0, 'none', '')
    ON CONFLICT (company_tax_profile_id, line_number) DO NOTHING;

    -- Insert demo Schedule M-2 data
    INSERT INTO schedule_m2_data (company_tax_profile_id, beginning_retained_earnings, net_income, distributions, other_adjustments, ending_retained_earnings)
    VALUES (demo_profile_id, 500000, 250000, 100000, 0, 650000)
    ON CONFLICT (company_tax_profile_id) DO NOTHING;

    -- Insert demo financial ratios
    INSERT INTO tax_financial_ratios (company_tax_profile_id, dso, dpo, dio, current_ratio, debt_to_equity, gross_margin, operating_margin, net_margin, cash_conversion_cycle)
    VALUES (demo_profile_id, 45, 30, 60, 2.5, 0.8, 0.35, 0.15, 0.12, 75)
    ON CONFLICT (company_tax_profile_id) DO NOTHING;

    -- Insert demo optimization actions
    INSERT INTO tax_optimization_actions (company_tax_profile_id, focus_area, finding_description, recommended_action, assigned_to, due_date, estimated_benefit, confidence_score, status, irs_reference, source_line)
    VALUES 
        (demo_profile_id, 'Deductions', 'Meals and entertainment deduction limited to 50%', 'Implement tracking system to maximize deductible portion', 'CFO', '2024-12-31', 1250, 0.95, 'pending', '§274(n)(1)', 'Schedule M-1 Line 8'),
        (demo_profile_id, 'Timing', 'Accelerated depreciation available under §168(k)', 'Elect bonus depreciation for qualifying assets', 'Tax Advisor', '2024-12-31', 15000, 0.90, 'pending', '§168(k)', 'Schedule M-1 Line 6'),
        (demo_profile_id, 'Working Capital', 'DSO of 45 days above industry average of 30', 'Implement stricter credit policies and collection procedures', 'CFO', '2025-01-15', 50000, 0.85, 'pending', 'N/A', 'Schedule L Line 2'),
        (demo_profile_id, 'Inventory', 'High inventory turnover could optimize cash flow', 'Implement JIT inventory management', 'Operations Manager', '2025-02-01', 25000, 0.75, 'pending', 'N/A', 'Schedule L Line 4')
    ON CONFLICT DO NOTHING;

    -- Insert demo AI insights
    INSERT INTO tax_ai_insights (company_tax_profile_id, insight_type, title, description, confidence_score, impact_score, supporting_evidence, irs_references)
    VALUES 
        (demo_profile_id, 'deduction_opportunity', 'Bonus Depreciation Opportunity', 'Your company has $150,000 in qualifying property acquisitions eligible for 100% bonus depreciation under §168(k), potentially saving $30,000 in taxes.', 0.92, 0.85, 'Schedule L shows $150,000 in new depreciable assets. Current depreciation schedule shows only 60% deduction taken.', ARRAY['§168(k)', '§168(b)(3)']),
        (demo_profile_id, 'working_capital', 'Cash Flow Optimization', 'Reducing DSO from 45 to 30 days could free up $78,000 in working capital, improving cash conversion cycle by 15 days.', 0.88, 0.70, 'Accounts receivable of $520,000 with 45-day collection period vs industry average of 30 days.', ARRAY['N/A']),
        (demo_profile_id, 'timing_optimization', 'Inventory Cost Method Review', 'Consider switching from FIFO to LIFO method to defer $12,000 in tax liability given current inventory levels.', 0.80, 0.60, 'Inventory balance of $350,000 with rising costs. LIFO method could provide timing benefit.', ARRAY['§472', 'Reg. 1.472-1'])
    ON CONFLICT DO NOTHING;

END $$;





























