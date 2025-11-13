# Company Data Isolation - Implementation Guide

## Current Issue

**Problem**: The current database schema uses only `user_id` for data isolation, which means:
- Each user's data is completely separate
- Users from the same company cannot share tax returns
- No company-level data aggregation or collaboration
- Company context exists in application code but is not enforced at database level

## Solution: Company-Based Data Isolation

The migration script `scripts/002_add_company_isolation.sql` implements:

### 1. Database Schema Changes

#### Added Columns:
- `returns.company_id` - Links returns to companies
- `chat_sessions.company_id` - Links chat sessions to companies

#### Added Indexes:
- `idx_returns_company_id` - Performance optimization
- `idx_chat_sessions_company_id` - Performance optimization

### 2. Row Level Security (RLS) Updates

All RLS policies are updated to use `company_id` instead of only `user_id`:

#### Before:
```sql
CREATE POLICY "Users can view their own returns"
  ON returns FOR SELECT
  USING (auth.uid() = user_id);
```

#### After:
```sql
CREATE POLICY "company_returns_select" ON returns FOR SELECT
  USING (company_id = auth.user_company_id());
```

### 3. Helper Functions

#### `auth.user_company_id()`
Returns the current authenticated user's company_id from the `user_profiles` table. Used by RLS policies to ensure data isolation.

### 4. Auto-Population Triggers

#### `auto_set_company_id()` for returns
Automatically sets `company_id` when a new return is inserted:
- Gets company_id from authenticated user's profile
- Ensures data integrity
- Prevents null values

#### `auto_set_chat_company_id()` for chat_sessions
Automatically sets `company_id` when a new chat session is created

### 5. How Data Isolation Works

```
┌─────────────────────────────────────────────────────────┐
│ Company A (ID: 550e8400-e29b-41d4-a716-446655440001)     │
├─────────────────────────────────────────────────────────┤
│ User 1 (admin@acme.com)  → company_id: 550e8400...       │
│ User 2 (user@acme.com)  → company_id: 550e8400...       │
│                                                          │
│ Returns:                                                 │
│  - Return 1 (company_id: 550e8400...) ✅ Visible to both │
│  - Return 2 (company_id: 550e8400...) ✅ Visible to both │
│                                                          │
│ AI CFO insights are shared company-wide                 │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Company B (ID: 550e8400-e29b-41d4-a716-446655440002)    │
├─────────────────────────────────────────────────────────┤
│ User 3 (admin@corp.com)  → company_id: 550e8400...      │
│ User 4 (user@corp.com)   → company_id: 550e8400...      │
│                                                          │
│ Returns:                                                 │
│  - Return 3 (company_id: 550e8400...) ✅ Visible to both│
│  - Return 4 (company_id: 550e8400...) ✅ Visible to both│
│                                                          │
│ AI CFO insights are separate from Company A             │
└─────────────────────────────────────────────────────────┘
```

### 6. Benefits

#### ✅ Data Integrity
- All records are tied to unique company IDs
- Prevents cross-company data leakage
- Enforced at database level, not just application

#### ✅ Collaboration
- Multiple users from same company can access shared returns
- Company-wide AI CFO insights
- Shared tax planning strategies

#### ✅ Security
- Row Level Security ensures users only see their company's data
- Automatic isolation without application-level checks needed
- Compliance with data privacy requirements

#### ✅ Scalability
- Easy to add company-level features (analytics, benchmarking)
- Proper multi-tenant architecture
- Supports enterprise deployments

### 7. How to Apply

#### For New Deployments:
Run the migration script when setting up the database:

```bash
# Apply both schema files in order
psql -U postgres -d your_database -f scripts/001_create_schema.sql
psql -U postgres -d your_database -f scripts/002_add_company_isolation.sql
```

#### For Existing Deployments:
The migration script is designed to:
- Add columns to existing tables
- Preserve existing data
- Update RLS policies
- Add triggers

**Important**: After running migration, verify that existing records have `company_id` populated:
```sql
-- Check for null company_ids
SELECT COUNT(*) FROM returns WHERE company_id IS NULL;
SELECT COUNT(*) FROM chat_sessions WHERE company_id IS NULL;

-- Update existing records (if needed)
UPDATE returns 
SET company_id = (SELECT company_id FROM user_profiles WHERE user_id = returns.user_id)
WHERE company_id IS NULL;
```

### 8. Application Code Updates Needed

Update API routes to set `company_id` when creating records:

```typescript
// app/api/returns/upload/route.ts
const { data: userProfile } = await supabase
  .from('user_profiles')
  .select('company_id')
  .eq('user_id', user.id)
  .single()

const { data: returnData } = await supabase
  .from('returns')
  .insert({
    user_id: user.id,
    company_id: userProfile.company_id, // ✅ Set company_id
    entity_name,
    entity_type,
    // ... other fields
  })
```

### 9. Verification

Test data isolation:

```sql
-- As Company A admin user
SET LOCAL role authenticated;
SET LOCAL request.jwt.claims.sub TO 'company-a-user-uuid';
SELECT * FROM returns; -- Should only see Company A returns

-- As Company B admin user
SET LOCAL request.jwt.claims.sub TO 'company-b-user-uuid';
SELECT * FROM returns; -- Should only see Company B returns
```

### 10. Testing Checklist

- [ ] Run migration script without errors
- [ ] Verify existing data has company_id populated
- [ ] Test user can only see their company's returns
- [ ] Test multiple users from same company can share returns
- [ ] Test users from different companies cannot see each other's data
- [ ] Test AI CFO generates company-scoped insights
- [ ] Test chat sessions are company-isolated
- [ ] Verify performance (indexes are being used)

### 11. Rollback Plan

If issues occur, you can rollback:

```sql
-- Drop triggers
DROP TRIGGER IF EXISTS set_company_id_on_return_insert ON returns;
DROP TRIGGER IF EXISTS set_company_id_on_chat_insert ON chat_sessions;

-- Drop functions
DROP FUNCTION IF EXISTS auto_set_company_id();
DROP FUNCTION IF EXISTS auto_set_chat_company_id();
DROP FUNCTION IF EXISTS auth.user_company_id();

-- Remove indexes
DROP INDEX IF EXISTS idx_returns_company_id;
DROP INDEX IF EXISTS idx_chat_sessions_company_id;

-- Revert to user-centric RLS (restore old policies from 001_create_schema.sql)

-- Remove columns (optional, preserves data)
-- ALTER TABLE returns DROP COLUMN company_id;
-- ALTER TABLE chat_sessions DROP COLUMN company_id;
```

## Summary

✅ **All data is now properly isolated by company_id**
✅ **AI CFO insights are company-scoped**
✅ **Multiple users per company can collaborate**
✅ **Row Level Security enforces isolation at database level**
✅ **No code changes needed for existing RLS logic**
✅ **Backward compatible - triggers auto-populate company_id**

This ensures complete data integrity and proper multi-tenant architecture for the ReturnSight AI solution.











