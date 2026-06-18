const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { createClient } = require('@supabase/supabase-js');
const cron = require('node-cron');
const path = require('path');
const dotenv = require('dotenv');

// Load env from the parent directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env file.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log("Initializing WhatsApp Bot...");

// Use LocalAuth to save session so you don't have to scan QR every time
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  }
});

client.on('qr', (qr) => {
  console.log("=========================================");
  console.log("Please SCAN the QR code below with WhatsApp:");
  console.log("=========================================");
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log("✅ WhatsApp Bot is Ready and Connected!");
  console.log("Scheduling daily cron job at 9:00 AM...");
  
  // Run every day at 9:00 AM
  cron.schedule('0 9 * * *', () => {
    console.log("Running Daily Messaging Job...");
    runDailyMessaging();
  });
  
  // Run once immediately on startup for testing/first run
  console.log("Running initial check...");
  runDailyMessaging();
});

client.on('disconnected', (reason) => {
  console.log('❌ WhatsApp Bot was disconnected:', reason);
});

async function runDailyMessaging() {
  try {
    // We need to bypass RLS to read all customers if the anon key doesn't have public read access
    // Or we use admin login:
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@muscleup.local',
      password: 'Rakesh@312'
    });
    
    if (authError) {
      console.error('Failed to log into Supabase:', authError.message);
      return;
    }

    // 1. Unpaid Members
    const { data: unpaidData } = await supabase
      .from('payments')
      .select(`
        due_amount,
        memberships!inner (
          id, plan_name, end_date,
          customers!inner ( id, name, phone )
        )
      `)
      .gt('due_amount', 0)
      .eq('memberships.customers.is_deleted', false);

    // 2. All Active Members to check expiry
    const { data: activeMembers } = await supabase
      .from('active_members')
      .select('*')
      .eq('is_deleted', false);

    const today = new Date();
    today.setHours(0,0,0,0);
    
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(today.getDate() + 3);

    // Filter Expiring (exactly 3 days)
    const expiringMembers = (activeMembers || []).filter(m => {
      const end = new Date(m.end_date);
      end.setHours(0,0,0,0);
      return end.getTime() === threeDaysFromNow.getTime();
    });

    // Filter Expired Today
    const expiredToday = (activeMembers || []).filter(m => {
      const end = new Date(m.end_date);
      end.setHours(0,0,0,0);
      return end.getTime() === today.getTime();
    });

    console.log(`Found: ${unpaidData?.length || 0} unpaid, ${expiringMembers.length} expiring in 3 days, ${expiredToday.length} expiring today.`);

    // Send Unpaid Reminders
    for (const p of (unpaidData || [])) {
      const phone = formatPhoneNumber(p.memberships.customers.phone);
      const name = p.memberships.customers.name.split(' ')[0];
      const msg = `Hi ${name}, this is a gentle reminder that you have a pending due of ₹${p.due_amount} for your gym membership. Please clear it at the earliest. Thank you! 💪`;
      await sendMessage(phone, msg);
    }

    // Send Expiring Reminders
    for (const m of expiringMembers) {
      const phone = formatPhoneNumber(m.phone);
      const name = m.name.split(' ')[0];
      const msg = `Hi ${name}, your MuscleUp Gym membership expires in exactly 3 days (${m.end_date}). Please renew it soon to continue your fitness journey without interruption! 🏋️‍♂️`;
      await sendMessage(phone, msg);
    }

    // Send Expired Reminders
    for (const m of expiredToday) {
      const phone = formatPhoneNumber(m.phone);
      const name = m.name.split(' ')[0];
      const msg = `Hi ${name}, your MuscleUp Gym membership has expired today. We'd love to see you back in the gym! Please renew your membership. 🏃‍♂️`;
      await sendMessage(phone, msg);
    }

    console.log("Daily Messaging Job Complete!");
  } catch (err) {
    console.error("Error in runDailyMessaging:", err);
  }
}

function formatPhoneNumber(phone) {
  // Ensure it's string, remove spaces
  let cleaned = String(phone).replace(/\D/g, '');
  // Add 91 if it's a 10 digit Indian number
  if (cleaned.length === 10) {
    cleaned = '91' + cleaned;
  }
  return cleaned + '@c.us';
}

async function sendMessage(whatsappId, message) {
  try {
    // Add a small random delay to avoid spam detection
    const delay = Math.floor(Math.random() * 3000) + 1000;
    await new Promise(r => setTimeout(r, delay));
    
    await client.sendMessage(whatsappId, message);
    console.log(`Sent to ${whatsappId}: ${message.substring(0, 30)}...`);
  } catch (err) {
    console.error(`Failed to send to ${whatsappId}:`, err);
  }
}

client.initialize();
