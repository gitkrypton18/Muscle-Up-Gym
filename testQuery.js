import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testQuery() {
  const { data, error } = await supabase.from('active_members').select('*').gt('due_amount', 0);
  console.log('Unpaid Active Members:', data?.length, error?.message);
  
  const { data: allActive } = await supabase.from('active_members').select('id, name, due_amount').limit(5);
  console.log('Sample Active Members:', allActive);
}

testQuery();
