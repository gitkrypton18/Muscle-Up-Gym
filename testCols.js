import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCols() {
  await supabase.auth.signInWithPassword({
    email: 'admin@muscleup.local',
    password: 'Rakesh@312'
  });

  const { data, error } = await supabase.from('active_members').select('*').limit(1);
  console.log('active_members cols:', Object.keys(data[0] || {}));
}

checkCols();
