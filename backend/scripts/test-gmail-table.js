const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Please ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testGmailTable() {
  try {
    console.log('🔍 Testing Gmail credentials table...');
    
    // Test 1: Check if table exists by trying to query it
    console.log('\n1. Checking if table exists...');
    const { data: testData, error: tableError } = await supabase
      .from('gmail_credentials')
      .select('count')
      .limit(1);

    if (tableError) {
      console.error('❌ Table does not exist or error:', tableError);
      console.log('The gmail_credentials table needs to be created');
      return;
    } else {
      console.log('✅ gmail_credentials table exists');
    }

    // Test 2: Check table structure by trying to select all columns
    console.log('\n2. Checking table structure...');
    const { data: structureData, error: structureError } = await supabase
      .from('gmail_credentials')
      .select('*')
      .limit(0); // This will return column info without data

    if (structureError) {
      console.error('❌ Error checking table structure:', structureError);
    } else {
      console.log('✅ Table structure is valid');
    }

    // Test 5: Try to insert a test record (this should work with service role)
    console.log('\n5. Testing insert operation...');
    const testUserId = '00000000-0000-0000-0000-000000000000'; // Dummy UUID
    const testCredentials = {
      user_id: testUserId,
      access_token: 'test_access_token',
      refresh_token: 'test_refresh_token',
      scope: 'test_scope',
      token_type: 'Bearer',
      expiry_date: Date.now() + 3600000, // 1 hour from now
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: insertData, error: insertError } = await supabase
      .from('gmail_credentials')
      .insert(testCredentials)
      .select();

    if (insertError) {
      console.error('❌ Error inserting test record:', insertError);
      console.error('Error details:', insertError.message);
    } else {
      console.log('✅ Test insert successful');
      console.log('Inserted record:', insertData);
    }

    // Test 6: Try to select the test record
    console.log('\n6. Testing select operation...');
    const { data: selectData, error: selectError } = await supabase
      .from('gmail_credentials')
      .select('*')
      .eq('user_id', testUserId);

    if (selectError) {
      console.error('❌ Error selecting test record:', selectError);
    } else {
      console.log('✅ Test select successful');
      console.log('Selected records:', selectData);
    }

    // Test 7: Clean up test record
    console.log('\n7. Cleaning up test record...');
    const { error: deleteError } = await supabase
      .from('gmail_credentials')
      .delete()
      .eq('user_id', testUserId);

    if (deleteError) {
      console.error('❌ Error deleting test record:', deleteError);
    } else {
      console.log('✅ Test cleanup successful');
    }

    console.log('\n🎉 Gmail credentials table test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testGmailTable(); 