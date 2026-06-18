import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testPayments() {
  const { data, error } = await supabase.from('payments').select('*').limit(5);
  console.log('Payments Data:', JSON.stringify(data, null, 2));
}

testPayments();
