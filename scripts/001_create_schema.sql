-- Create returns table to store tax return metadata
CREATE TABLE IF NOT EXISTS returns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_name TEXT NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('1040', '1120')),
  tax_year INTEGER NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('pdf', 'xml')),
  file_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'processing', 'completed', 'error')),
  confidence_min DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create line_items table to store extracted data from tax forms
CREATE TABLE IF NOT EXISTS line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  return_id UUID NOT NULL REFERENCES returns(id) ON DELETE CASCADE,
  form_id TEXT NOT NULL,
  line_code TEXT NOT NULL,
  value DECIMAL(15,2),
  begin_value DECIMAL(15,2),
  end_value DECIMAL(15,2),
  provenance TEXT,
  confidence DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create metrics table to store computed KPIs
CREATE TABLE IF NOT EXISTS metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  return_id UUID NOT NULL REFERENCES returns(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  formula TEXT,
  value DECIMAL(15,2),
  previous_value DECIMAL(15,2),
  trend TEXT CHECK (trend IN ('up', 'down', 'stable')),
  evidence JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create opportunities table to store identified optimization opportunities
CREATE TABLE IF NOT EXISTS opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  return_id UUID NOT NULL REFERENCES returns(id) ON DELETE CASCADE,
  opportunity_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  impact_amount DECIMAL(15,2),
  impact_model TEXT,
  trigger_rule TEXT,
  evidence JSONB,
  priority TEXT CHECK (priority IN ('high', 'medium', 'low')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create chat_sessions table for chatbot conversations
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  return_id UUID REFERENCES returns(id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create chat_messages table for individual messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  evidence_links JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for returns
CREATE POLICY "Users can view their own returns"
  ON returns FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own returns"
  ON returns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own returns"
  ON returns FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own returns"
  ON returns FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for line_items
CREATE POLICY "Users can view line_items for their returns"
  ON line_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM returns WHERE returns.id = line_items.return_id AND returns.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert line_items for their returns"
  ON line_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM returns WHERE returns.id = line_items.return_id AND returns.user_id = auth.uid()
  ));

-- RLS Policies for metrics
CREATE POLICY "Users can view metrics for their returns"
  ON metrics FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM returns WHERE returns.id = metrics.return_id AND returns.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert metrics for their returns"
  ON metrics FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM returns WHERE returns.id = metrics.return_id AND returns.user_id = auth.uid()
  ));

-- RLS Policies for opportunities
CREATE POLICY "Users can view opportunities for their returns"
  ON opportunities FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM returns WHERE returns.id = opportunities.return_id AND returns.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert opportunities for their returns"
  ON opportunities FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM returns WHERE returns.id = opportunities.return_id AND returns.user_id = auth.uid()
  ));

-- RLS Policies for chat_sessions
CREATE POLICY "Users can view their own chat sessions"
  ON chat_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat sessions"
  ON chat_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat sessions"
  ON chat_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat sessions"
  ON chat_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for chat_messages
CREATE POLICY "Users can view messages in their chat sessions"
  ON chat_messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM chat_sessions WHERE chat_sessions.id = chat_messages.session_id AND chat_sessions.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert messages in their chat sessions"
  ON chat_messages FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM chat_sessions WHERE chat_sessions.id = chat_messages.session_id AND chat_sessions.user_id = auth.uid()
  ));

-- Create indexes for better query performance
CREATE INDEX idx_returns_user_id ON returns(user_id);
CREATE INDEX idx_line_items_return_id ON line_items(return_id);
CREATE INDEX idx_metrics_return_id ON metrics(return_id);
CREATE INDEX idx_opportunities_return_id ON opportunities(return_id);
CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
