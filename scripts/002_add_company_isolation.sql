-- Migration to add company-level data isolation
-- This ensures all records are tied to unique company IDs for proper data integrity

-- Add company_id column to returns table
ALTER TABLE returns ADD COLUMN IF NOT EXISTS company_id UUID;

-- Add company_id column to chat_sessions for company-wide chat history
ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS company_id UUID;

-- Add company_id indexes for performance
CREATE INDEX IF NOT EXISTS idx_returns_company_id ON returns(company_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_company_id ON chat_sessions(company_id);

-- Create helper function to get user's company_id
CREATE OR REPLACE FUNCTION auth.user_company_id() RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT company_id 
    FROM user_profiles 
    WHERE user_id = auth.uid()
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Drop old user-centric RLS policies
DROP POLICY IF EXISTS "Users can view their own returns" ON returns;
DROP POLICY IF EXISTS "Users can insert their own returns" ON returns;
DROP POLICY IF EXISTS "Users can update their own returns" ON returns;
DROP POLICY IF EXISTS "Users can delete their own returns" ON returns;

DROP POLICY IF EXISTS "Users can view their own chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can insert their own chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can update their own chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can delete their own chat sessions" ON chat_sessions;

DROP POLICY IF EXISTS "Users can view line_items for their returns" ON line_items;
DROP POLICY IF EXISTS "Users can insert line_items for their returns" ON line_items;

DROP POLICY IF EXISTS "Users can view metrics for their returns" ON metrics;
DROP POLICY IF EXISTS "Users can insert metrics for their returns" ON metrics;

DROP POLICY IF EXISTS "Users can view opportunities for their returns" ON opportunities;
DROP POLICY IF EXISTS "Users can insert opportunities for their returns" ON opportunities;

DROP POLICY IF EXISTS "Users can view messages in their chat sessions" ON chat_messages;
DROP POLICY IF EXISTS "Users can insert messages in their chat sessions" ON chat_messages;

-- Create company-aware RLS policies for returns
-- View returns within the user's company
CREATE POLICY "company_returns_select" ON returns FOR SELECT
  USING (company_id = auth.user_company_id());

-- Insert returns with company_id validation
CREATE POLICY "company_returns_insert" ON returns FOR INSERT
  WITH CHECK (
    company_id = auth.user_company_id() AND
    user_id = auth.uid()
  );

-- Update returns within the user's company
CREATE POLICY "company_returns_update" ON returns FOR UPDATE
  USING (
    company_id = auth.user_company_id() AND
    user_id = auth.uid()
  );

-- Delete returns within the user's company
CREATE POLICY "company_returns_delete" ON returns FOR DELETE
  USING (
    company_id = auth.user_company_id() AND
    user_id = auth.uid()
  );

-- Create company-aware RLS policies for line_items
CREATE POLICY "company_line_items_select" ON line_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM returns 
      WHERE returns.id = line_items.return_id 
      AND returns.company_id = auth.user_company_id()
    )
  );

CREATE POLICY "company_line_items_insert" ON line_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM returns 
      WHERE returns.id = line_items.return_id 
      AND returns.company_id = auth.user_company_id()
      AND returns.user_id = auth.uid()
    )
  );

CREATE POLICY "company_line_items_update" ON line_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM returns 
      WHERE returns.id = line_items.return_id 
      AND returns.company_id = auth.user_company_id()
    )
  );

CREATE POLICY "company_line_items_delete" ON line_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM returns 
      WHERE returns.id = line_items.return_id 
      AND returns.company_id = auth.user_company_id()
    )
  );

-- Create company-aware RLS policies for metrics
CREATE POLICY "company_metrics_select" ON metrics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM returns 
      WHERE returns.id = metrics.return_id 
      AND returns.company_id = auth.user_company_id()
    )
  );

CREATE POLICY "company_metrics_insert" ON metrics FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM returns 
      WHERE returns.id = metrics.return_id 
      AND returns.company_id = auth.user_company_id()
    )
  );

CREATE POLICY "company_metrics_update" ON metrics FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM returns 
      WHERE returns.id = metrics.return_id 
      AND returns.company_id = auth.user_company_id()
    )
  );

CREATE POLICY "company_metrics_delete" ON metrics FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM returns 
      WHERE returns.id = metrics.return_id 
      AND returns.company_id = auth.user_company_id()
    )
  );

-- Create company-aware RLS policies for opportunities
CREATE POLICY "company_opportunities_select" ON opportunities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM returns 
      WHERE returns.id = opportunities.return_id 
      AND returns.company_id = auth.user_company_id()
    )
  );

CREATE POLICY "company_opportunities_insert" ON opportunities FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM returns 
      WHERE returns.id = opportunities.return_id 
      AND returns.company_id = auth.user_company_id()
    )
  );

CREATE POLICY "company_opportunities_update" ON opportunities FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM returns 
      WHERE returns.id = opportunities.return_id 
      AND returns.company_id = auth.user_company_id()
    )
  );

CREATE POLICY "company_opportunities_delete" ON opportunities FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM returns 
      WHERE returns.id = opportunities.return_id 
      AND returns.company_id = auth.user_company_id()
    )
  );

-- Create company-aware RLS policies for chat_sessions
CREATE POLICY "company_chat_sessions_select" ON chat_sessions FOR SELECT
  USING (
    company_id = auth.user_company_id() AND
    user_id = auth.uid()
  );

CREATE POLICY "company_chat_sessions_insert" ON chat_sessions FOR INSERT
  WITH CHECK (
    company_id = auth.user_company_id() AND
    user_id = auth.uid()
  );

CREATE POLICY "company_chat_sessions_update" ON chat_sessions FOR UPDATE
  USING (
    company_id = auth.user_company_id() AND
    user_id = auth.uid()
  );

CREATE POLICY "company_chat_sessions_delete" ON chat_sessions FOR DELETE
  USING (
    company_id = auth.user_company_id() AND
    user_id = auth.uid()
  );

-- Create company-aware RLS policies for chat_messages
CREATE POLICY "company_chat_messages_select" ON chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_sessions 
      WHERE chat_sessions.id = chat_messages.session_id 
      AND chat_sessions.company_id = auth.user_company_id()
      AND chat_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "company_chat_messages_insert" ON chat_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_sessions 
      WHERE chat_sessions.id = chat_messages.session_id 
      AND chat_sessions.company_id = auth.user_company_id()
      AND chat_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "company_chat_messages_update" ON chat_messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM chat_sessions 
      WHERE chat_sessions.id = chat_messages.session_id 
      AND chat_sessions.company_id = auth.user_company_id()
      AND chat_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "company_chat_messages_delete" ON chat_messages FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM chat_sessions 
      WHERE chat_sessions.id = chat_messages.session_id 
      AND chat_sessions.company_id = auth.user_company_id()
      AND chat_sessions.user_id = auth.uid()
    )
  );

-- Add comments for documentation
COMMENT ON COLUMN returns.company_id IS 'Ensures data isolation at company level';
COMMENT ON COLUMN chat_sessions.company_id IS 'Ensures chat history is company-isolated';
COMMENT ON FUNCTION auth.user_company_id() IS 'Returns the current user''s company_id for RLS policies';

-- Add trigger to auto-populate company_id when a return is created
CREATE OR REPLACE FUNCTION auto_set_company_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.company_id IS NULL THEN
    NEW.company_id := auth.user_company_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_company_id_on_return_insert
BEFORE INSERT ON returns
FOR EACH ROW
EXECUTE FUNCTION auto_set_company_id();

-- Add trigger to auto-populate company_id when a chat session is created
CREATE OR REPLACE FUNCTION auto_set_chat_company_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.company_id IS NULL THEN
    NEW.company_id := auth.user_company_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_company_id_on_chat_insert
BEFORE INSERT ON chat_sessions
FOR EACH ROW
EXECUTE FUNCTION auto_set_chat_company_id();











