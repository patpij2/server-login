-- Fix Gmail credentials table foreign key constraint
-- Drop the existing foreign key constraint
ALTER TABLE gmail_credentials DROP CONSTRAINT IF EXISTS gmail_credentials_user_id_fkey;

-- Add the correct foreign key constraint to reference public.users
ALTER TABLE gmail_credentials 
ADD CONSTRAINT gmail_credentials_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Verify the change
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name='gmail_credentials'; 