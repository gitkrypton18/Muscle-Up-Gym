import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const firstNames = ['James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda', 'David', 'Elizabeth', 'William', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa', 'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley', 'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle', 'Kenneth', 'Carol', 'Kevin', 'Amanda', 'Brian', 'Melissa', 'George', 'Deborah', 'Edward', 'Stephanie'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result.toISOString().split('T')[0];
}

async function seed() {
  console.log('Logging in...');
  const { error: authError } = await supabase.auth.signInWithPassword({
    email: 'admin@muscleup.local',
    password: 'Rakesh@312'
  });
  
  if (authError) {
    console.error('Failed to log in:', authError.message);
    return;
  }

  console.log('Wiping database...');
  // Since we don't have direct SQL access through JS client without a specific RPC,
  // we will fetch all customer IDs and delete them. The schema should handle cascading deletes if set up,
  // otherwise we'll delete memberships and payments too.
  
  const { data: allCusts } = await supabase.from('customers').select('id');
  if (allCusts && allCusts.length > 0) {
    const ids = allCusts.map(c => c.id);
    
    // Hard delete everything by matching customer_ids in memberships and then payments
    const { data: allMems } = await supabase.from('memberships').select('id');
    if (allMems && allMems.length > 0) {
      const memIds = allMems.map(m => m.id);
      await supabase.from('payments').delete().in('membership_id', memIds);
      await supabase.from('memberships').delete().in('id', memIds);
    }
    await supabase.from('customers').delete().in('id', ids);
  }
  
  console.log('Database wiped. Seeding 50 customers...');
  
  for (let i = 0; i < 50; i++) {
    const name = `${firstNames[i]} ${lastNames[i]}`;
    const phone = `987654${i.toString().padStart(4, '0')}`;
    const email = `${firstNames[i].toLowerCase()}.${lastNames[i].toLowerCase()}@example.com`;
    
    // 1. Create Customer
    const { data: customer, error: custError } = await supabase
      .from('customers')
      .insert([{
        name,
        phone,
        email,
        gender: i % 2 === 0 ? 'Male' : 'Female',
        age: getRandomInt(18, 55),
        weight: getRandomInt(50, 100),
        height: getRandomInt(150, 190)
      }])
      .select()
      .single();

    if (custError) {
      console.error(`Error inserting customer ${i}:`, custError.message);
      continue;
    }

    let scenario = '';
    if (i < 10) scenario = 'started_early';
    else if (i < 20) scenario = 'expiring_soon';
    else if (i < 30) scenario = 'expired';
    else if (i < 40) scenario = 'unpaid';
    else if (i < 50) scenario = 'renewed_recently';

    const today = new Date();
    
    let plan = '1 Month';
    let amount = 1500;
    let paidAmount = 1500;
    let startDate = today;
    let endDate = addDays(startDate, 30);
    let status = 'active';
    
    // Second membership variables for 'renewed_recently'
    let secondMembership = null;

    switch (scenario) {
      case 'started_early':
        // Started 15 days ago, active
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 15);
        endDate = addDays(startDate, 30);
        break;
      case 'expiring_soon':
        // Started 28 days ago, 2 days left
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 28);
        endDate = addDays(startDate, 30);
        break;
      case 'expired':
        // Started 40 days ago, expired 10 days ago
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 40);
        endDate = addDays(startDate, 30);
        status = 'expired';
        break;
      case 'unpaid':
        // Started today, but only paid 1000 out of 1500
        paidAmount = 1000;
        break;
      case 'renewed_recently':
        // Old expired membership
        const oldStart = new Date(today);
        oldStart.setDate(today.getDate() - 40);
        const oldEnd = addDays(oldStart, 30);
        
        // New active membership (renewed today)
        startDate = new Date(today);
        endDate = addDays(startDate, 30);
        
        secondMembership = {
          start_date: oldStart.toISOString().split('T')[0],
          end_date: oldEnd,
          status: 'expired',
          amount: 1500,
          paid_amount: 1500
        };
        break;
    }

    // Insert first membership
    const { data: mem1, error: memError1 } = await supabase
      .from('memberships')
      .insert([{
        customer_id: customer.id,
        plan_name: plan,
        amount: amount,
        start_date: startDate instanceof Date ? startDate.toISOString().split('T')[0] : startDate,
        end_date: endDate,
        status: status
      }])
      .select()
      .single();

    if (memError1) {
      console.error(`Error inserting membership ${i}:`, memError1.message);
      continue;
    }

    await supabase
      .from('payments')
      .insert([{
        membership_id: mem1.id,
        total_amount: amount,
        paid_amount: paidAmount,
        payment_method: 'Cash'
      }]);

    // Insert second membership if needed (for renewed scenario)
    if (secondMembership) {
      const { data: mem2 } = await supabase
        .from('memberships')
        .insert([{
          customer_id: customer.id,
          plan_name: plan,
          amount: secondMembership.amount,
          start_date: secondMembership.start_date,
          end_date: secondMembership.end_date,
          status: secondMembership.status
        }])
        .select()
        .single();
        
      if (mem2) {
        await supabase
          .from('payments')
          .insert([{
            membership_id: mem2.id,
            total_amount: secondMembership.amount,
            paid_amount: secondMembership.paid_amount,
            payment_method: 'Cash'
          }]);
      }
    }

    console.log(`Created customer: ${name} [${scenario}]`);
  }
  
  console.log('Done seeding 50 customers.');
}

seed();
