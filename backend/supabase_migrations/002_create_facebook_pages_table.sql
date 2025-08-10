-- Create Facebook pages table
CREATE TABLE IF NOT EXISTS facebook_pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  facebook_page_id VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  access_token TEXT NOT NULL,
  category VARCHAR(255),
  fan_count INTEGER,
  picture TEXT,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_facebook_pages_user_id ON facebook_pages(user_id);
CREATE INDEX IF NOT EXISTS idx_facebook_pages_facebook_id ON facebook_pages(facebook_page_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_facebook_pages_updated_at 
    BEFORE UPDATE ON facebook_pages 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Note: RLS is disabled for this table since we're using custom authentication
-- Security is handled at the application level through JWT token validation
-- ALTER TABLE facebook_pages ENABLE ROW LEVEL SECURITY; 