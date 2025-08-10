const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:');
  console.error('SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testFacebookTable() {
  try {
    console.log('🔍 Testing Facebook pages table...');
    
    // Try to query the table directly
    console.log('📊 Attempting to query facebook_pages table...');
    const { data, error } = await supabase
      .from('facebook_pages')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Table query failed:', error.message);
      console.error('Error code:', error.code);
      console.error('Error details:', error.details);
      
      if (error.code === '42P01') {
        console.log('\n💡 The facebook_pages table does not exist!');
        console.log('You need to run the migration manually in your Supabase dashboard.');
        console.log('\n📋 Here\'s what you need to do:');
        console.log('1. Go to your Supabase dashboard');
        console.log('2. Navigate to SQL Editor');
        console.log('3. Copy and paste the contents of: backend/supabase_migrations/002_create_facebook_pages_table.sql');
        console.log('4. Run the SQL');
      }
    } else {
      console.log('✅ Facebook pages table exists and is accessible!');
      console.log('📊 Table data:', data);
    }
    
    // Also test if we can see any tables
    console.log('\n🔍 Checking available tables...');
    try {
      const { data: tables, error: tablesError } = await supabase
        .from('users')
        .select('id, email')
        .limit(1);
      
      if (tablesError) {
        console.log('⚠️  Could not query users table:', tablesError.message);
      } else {
        console.log('✅ Users table is accessible');
      }
    } catch (e) {
      console.log('⚠️  Could not test users table:', e.message);
    }
    
  } catch (error) {
    console.error('❌ Error testing Facebook table:', error);
  }
}

// Run the test
testFacebookTable(); 