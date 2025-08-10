const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupFacebookTable() {
  try {
    console.log('Setting up Facebook pages table...');

    // Check if table already exists
    console.log('Checking if facebook_pages table exists...');
    const { data: existingTables, error: checkError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'facebook_pages');

    if (checkError) {
      console.log('Note: Could not check table existence:', checkError.message);
    } else if (existingTables && existingTables.length > 0) {
      console.log('✅ facebook_pages table already exists');
      
      // Check if it has the correct structure
      const { data: columns, error: columnError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_schema', 'public')
        .eq('table_name', 'facebook_pages')
        .order('ordinal_position');

      if (columnError) {
        console.log('Note: Could not check table structure:', columnError.message);
      } else {
        console.log('📋 Current table structure:');
        columns.forEach(col => {
          console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
        });
      }
      
      return;
    }

    console.log('❌ facebook_pages table does not exist');
    console.log('💡 You need to create the table manually in your Supabase dashboard');
    console.log('');
    console.log('Please run this SQL in your Supabase SQL editor:');
    console.log('');
    console.log(`
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

-- Optional: Enable RLS if you plan to access with anon key in frontend.
-- Not required for backend service-role inserts.
-- ALTER TABLE facebook_pages ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can view own Facebook pages" ON facebook_pages
--     FOR SELECT USING (auth.uid()::text = user_id::text);
-- CREATE POLICY "Users can insert own Facebook pages" ON facebook_pages
--     FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
-- CREATE POLICY "Users can update own Facebook pages" ON facebook_pages
--     FOR UPDATE USING (auth.uid()::text = user_id::text);
-- CREATE POLICY "Users can delete own Facebook pages" ON facebook_pages
--     FOR DELETE USING (auth.uid()::text = user_id::text);
    `);
    console.log('');
    console.log('After running the SQL, you can test the connection again.');

  } catch (error) {
    console.error('❌ Error checking Facebook pages table:', error);
    process.exit(1);
  }
}

setupFacebookTable(); 