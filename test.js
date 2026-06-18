import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  const { data, error } = await supabase.from('customers').insert([{ name: 'Test', phone: '123' }]).select();
  console.log('Insert Data:', data);
  console.log('Insert Error:', error?.message);
}

testInsert();
