-- Create gmail_credentials table
CREATE TABLE IF NOT EXISTS gmail_credentials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    scope TEXT NOT NULL,
    token_type TEXT NOT NULL DEFAULT 'Bearer',
    expiry_date BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_gmail_credentials_user_id ON gmail_credentials(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE gmail_credentials ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only access their own credentials
CREATE POLICY "Users can view own gmail credentials" ON gmail_credentials
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own gmail credentials" ON gmail_credentials
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own gmail credentials" ON gmail_credentials
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own gmail credentials" ON gmail_credentials
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_gmail_credentials_updated_at 
    BEFORE UPDATE ON gmail_credentials 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 