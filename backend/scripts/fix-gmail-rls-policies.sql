-- Fix Gmail credentials RLS policies to work with public.users
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own gmail credentials" ON gmail_credentials;
DROP POLICY IF EXISTS "Users can insert own gmail credentials" ON gmail_credentials;
DROP POLICY IF EXISTS "Users can update own gmail credentials" ON gmail_credentials;
DROP POLICY IF EXISTS "Users can delete own gmail credentials" ON gmail_credentials;

-- Create new policies that work with public.users
-- For now, we'll create policies that allow the service role to access all records
-- since the backend uses the service role key

-- Allow all operations for service role (backend operations)
CREATE POLICY "Service role can manage all gmail credentials" ON gmail_credentials
    FOR ALL USING (true);

-- Note: If you want to add user-specific policies later, you can add them here
-- For example, if you have a way to identify the current user:
-- CREATE POLICY "Users can view own gmail credentials" ON gmail_credentials
--     FOR SELECT USING (user_id = current_setting('app.current_user_id')::uuid);

-- Verify the policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'gmail_credentials'; 