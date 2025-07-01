const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../../.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Please ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupGmailTable() {
  try {
    console.log('🔍 Checking if gmail_credentials table exists...');
    
    // Check if table exists
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'gmail_credentials');

    if (tableError) {
      console.error('❌ Error checking table existence:', tableError);
      return;
    }

    if (tables && tables.length > 0) {
      console.log('✅ gmail_credentials table already exists');
      
      // Check table structure
      const { data: columns, error: columnError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_schema', 'public')
        .eq('table_name', 'gmail_credentials')
        .order('ordinal_position');

      if (columnError) {
        console.error('❌ Error checking table structure:', columnError);
        return;
      }

      console.log('📋 Table structure:');
      columns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
      });
      
      return;
    }

    console.log('📝 Creating gmail_credentials table...');
    
    // Create the table
    const createTableSQL = `
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
    `;

    const { error: createError } = await supabase.rpc('exec_sql', { sql: createTableSQL });
    
    if (createError) {
      console.error('❌ Error creating table:', createError);
      console.log('💡 Try running this SQL manually in your Supabase SQL editor:');
      console.log(createTableSQL);
      return;
    }

    console.log('✅ gmail_credentials table created successfully');

    // Create index
    console.log('📝 Creating index...');
    const createIndexSQL = `
      CREATE INDEX IF NOT EXISTS idx_gmail_credentials_user_id ON gmail_credentials(user_id);
    `;

    const { error: indexError } = await supabase.rpc('exec_sql', { sql: createIndexSQL });
    
    if (indexError) {
      console.error('❌ Error creating index:', indexError);
    } else {
      console.log('✅ Index created successfully');
    }

    // Enable RLS
    console.log('🔒 Enabling Row Level Security...');
    const enableRLSSQL = `
      ALTER TABLE gmail_credentials ENABLE ROW LEVEL SECURITY;
    `;

    const { error: rlsError } = await supabase.rpc('exec_sql', { sql: enableRLSSQL });
    
    if (rlsError) {
      console.error('❌ Error enabling RLS:', rlsError);
    } else {
      console.log('✅ RLS enabled successfully');
    }

    // Create RLS policies
    console.log('📋 Creating RLS policies...');
    const policiesSQL = `
      CREATE POLICY "Users can view own gmail credentials" ON gmail_credentials
        FOR SELECT USING (auth.uid() = user_id);

      CREATE POLICY "Users can insert own gmail credentials" ON gmail_credentials
        FOR INSERT WITH CHECK (auth.uid() = user_id);

      CREATE POLICY "Users can update own gmail credentials" ON gmail_credentials
        FOR UPDATE USING (auth.uid() = user_id);

      CREATE POLICY "Users can delete own gmail credentials" ON gmail_credentials
        FOR DELETE USING (auth.uid() = user_id);
    `;

    const { error: policyError } = await supabase.rpc('exec_sql', { sql: policiesSQL });
    
    if (policyError) {
      console.error('❌ Error creating policies:', policyError);
    } else {
      console.log('✅ RLS policies created successfully');
    }

    // Create trigger function and trigger
    console.log('🔄 Creating trigger function...');
    const triggerFunctionSQL = `
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `;

    const { error: functionError } = await supabase.rpc('exec_sql', { sql: triggerFunctionSQL });
    
    if (functionError) {
      console.error('❌ Error creating trigger function:', functionError);
    } else {
      console.log('✅ Trigger function created successfully');
    }

    console.log('🔄 Creating trigger...');
    const triggerSQL = `
      CREATE TRIGGER update_gmail_credentials_updated_at 
        BEFORE UPDATE ON gmail_credentials 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();
    `;

    const { error: triggerError } = await supabase.rpc('exec_sql', { sql: triggerSQL });
    
    if (triggerError) {
      console.error('❌ Error creating trigger:', triggerError);
    } else {
      console.log('✅ Trigger created successfully');
    }

    console.log('🎉 Gmail credentials table setup completed successfully!');

  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

setupGmailTable(); 