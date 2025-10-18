require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkSchema() {
  console.log('Checking actual database schema...\n');
  
  // Try to get one row from colivings to see structure
  const { data, error } = await supabase
    .from('colivings')
    .select('*')
    .limit(1);
    
  if (error) {
    console.log('Error:', error.message);
    
    // Try to get table info from information_schema
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_table_info', {});
    if (rpcError) {
      console.log('Cannot get schema info. Tables might exist but be empty.');
    }
  } else {
    console.log('Colivings table structure:', data);
  }
}

checkSchema();
