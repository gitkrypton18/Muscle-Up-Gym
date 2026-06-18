import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testJoin() {
  await supabase.auth.signInWithPassword({
    email: 'admin@muscleup.local',
    password: 'Rakesh@312'
  });

  const { data, error } = await supabase
    .from('payments')
    .select(`
      due_amount,
      memberships (
        id, plan_name, start_date, end_date,
        customers (
          id, name, phone, whatsapp, is_deleted
        )
      )
    `)
    .gt('due_amount', 0);
  console.log('Unpaid Members Data:', JSON.stringify(data, null, 2));
  console.log('Unpaid Members Error:', error?.message);
}

testJoin();
