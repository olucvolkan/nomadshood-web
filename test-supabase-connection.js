// Test Supabase Connection
// Run with: node test-supabase-connection.js

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Testing Supabase Connection...\n');
console.log('Environment Check:');
console.log('- NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Set' : '❌ Missing');
console.log('');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing required environment variables!');
  console.log('\nPlease ensure .env file contains:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=your-project-url');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('📡 Attempting to connect to Supabase...\n');

    // Test 1: Check if we can connect
    console.log('Test 1: Connection Test');
    const { data: healthCheck, error: healthError } = await supabase
      .from('countries')
      .select('count', { count: 'exact', head: true });

    if (healthError) {
      console.log('❌ Connection failed:', healthError.message);
      if (healthError.code === 'PGRST200') {
        console.log('\n💡 This might mean the tables don\'t exist yet.');
        console.log('   Please run SUPABASE_SCHEMA.sql in your Supabase SQL Editor first.');
      }
      return;
    }
    console.log('✅ Successfully connected to Supabase!\n');

    // Test 2: List all tables
    console.log('Test 2: Checking Tables');
    const tables = ['colivings', 'coliving_nearby_places', 'coliving_reviews', 'countries', 'mail_subscriber', 'nomad_videos'];

    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`❌ Table '${table}': NOT FOUND (${error.message})`);
      } else {
        console.log(`✅ Table '${table}': EXISTS (${count || 0} rows)`);
      }
    }
    console.log('');

    // Test 3: Check Spain country data
    console.log('Test 3: Spain Country Check');
    const { data: spainData, error: spainError } = await supabase
      .from('countries')
      .select('*')
      .eq('code', 'ES')
      .single();

    if (spainError) {
      if (spainError.code === 'PGRST116') {
        console.log('⚠️  Spain country not found in database');
        console.log('   You may need to insert Spain data manually');
      } else {
        console.log('❌ Error checking Spain:', spainError.message);
      }
    } else {
      console.log('✅ Spain country found:', spainData.name);
      console.log('   - Code:', spainData.code);
      console.log('   - Flag:', spainData.flag);
      console.log('   - Communities:', spainData.communities?.length || 0);
    }
    console.log('');

    // Test 4: Check colivings (Spain only)
    console.log('Test 4: Spain Colivings Check');
    const { data: colivings, error: colivingsError, count: colivingsCount } = await supabase
      .from('colivings')
      .select('id, name, city, country_code', { count: 'exact' })
      .eq('country_code', 'ES')
      .limit(5);

    if (colivingsError) {
      console.log('❌ Error fetching colivings:', colivingsError.message);
    } else if (!colivings || colivings.length === 0) {
      console.log('⚠️  No Spain colivings found in database');
      console.log('   You need to import coliving data');
    } else {
      console.log(`✅ Found ${colivingsCount} Spain colivings`);
      console.log('\nFirst few colivings:');
      colivings.forEach((c, i) => {
        console.log(`   ${i + 1}. ${c.name} (${c.city}, ${c.country_code})`);
      });
    }
    console.log('');

    // Summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Connection Test Summary');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Supabase connection: SUCCESS');
    console.log('✅ Database access: WORKING');
    console.log('');
    console.log('Next Steps:');
    if (!spainData) {
      console.log('1. ⚠️  Insert Spain country data');
    }
    if (!colivings || colivings.length === 0) {
      console.log('2. ⚠️  Import Spain coliving data');
    }
    if (spainData && colivings && colivings.length > 0) {
      console.log('🎉 All ready! Your application can now use Supabase.');
    }
    console.log('');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    console.error('\nFull error:', error);
  }
}

testConnection();
