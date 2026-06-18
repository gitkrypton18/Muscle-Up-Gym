import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogin() {
  const emails = ['admin@muscleup.local', 'admin@muscleup.com'];
  const passwords = ['muscleUpFitness1772', 'muscleupfitness1772', 'password', 'admin123'];

  for (let email of emails) {
    for (let password of passwords) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (!error) {
        console.log(`Success! email: ${email}, password: ${password}`);
        return;
      }
    }
  }
  console.log('All failed.');
}

testLogin();
