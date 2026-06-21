import fs from 'fs'
import crypto from 'crypto'

// Indian names
const firstNames = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan', 'Shaurya', 'Atharv', 'Advik', 'Pranav', 'Kabir', 'Ritvik', 'Aarush', 'Rudra', 'Ansh', 'Dev', 'Rahul', 'Priya', 'Neha', 'Pooja', 'Anjali', 'Kavita', 'Sunita', 'Meena', 'Ritu', 'Anita', 'Aarti', 'Kareena', 'Sneha', 'Shruti', 'Divya', 'Swati', 'Preeti', 'Priyanka']
const lastNames = ['Sharma', 'Verma', 'Gupta', 'Kumar', 'Singh', 'Patel', 'Jain', 'Mehta', 'Shah', 'Agarwal', 'Choudhary', 'Yadav', 'Rajput', 'Joshi', 'Bhatia', 'Nagar', 'Mishra', 'Tiwari']

const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)]
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const randomPhone = () => '9' + String(Math.random()).substring(2, 11)

const plans = [
  { name: 'Monthly Basic', amount: 1500, days: 30 },
  { name: 'Quarterly Pro', amount: 4000, days: 90 },
  { name: 'Half-Yearly Elite', amount: 7500, days: 180 },
  { name: 'Annual Champion', amount: 12000, days: 365 },
  { name: 'Couple Monthly', amount: 2500, days: 30 },
  { name: 'Student Special', amount: 1200, days: 30 }
]

let sql = `-- ==========================================\n`
sql += `-- INJECT 50 DIVERSE CUSTOMERS, MEMBERSHIPS & PAYMENTS\n`
sql += `-- Edge cases included: Unpaid, partially paid, expired, expiring soon\n`
sql += `-- ==========================================\n\n`

for(let i=0; i<50; i++) {
  const customerId = crypto.randomUUID()
  const membershipId = crypto.randomUUID()
  
  const gender = Math.random() > 0.4 ? 'Male' : 'Female'
  const name = getRandomItem(firstNames) + ' ' + getRandomItem(lastNames)
  const phone = randomPhone()
  
  const plan = getRandomItem(plans)
  
  // Decide payment status
  const r = Math.random()
  let paidAmount = plan.amount
  let status = 'active'
  
  if (r < 0.2) paidAmount = 0 // completely unpaid
  else if (r < 0.4) paidAmount = getRandomInt(500, plan.amount - 100) // partially paid
  
  // Decide date range
  const rDate = Math.random()
  let startDate = new Date()
  let endDate = new Date()
  
  if (rDate < 0.2) {
    // Expired
    startDate.setDate(startDate.getDate() - plan.days - 10)
    endDate.setDate(startDate.getDate() + plan.days)
    status = 'expired'
  } else if (rDate < 0.4) {
    // Expiring soon
    startDate.setDate(startDate.getDate() - plan.days + 3)
    endDate.setDate(startDate.getDate() + plan.days)
  } else {
    // Active recent
    startDate.setDate(startDate.getDate() - getRandomInt(0, 10))
    endDate.setDate(startDate.getDate() + plan.days)
  }

  const startDateStr = startDate.toISOString().split('T')[0]
  const endDateStr = endDate.toISOString().split('T')[0]
  
  // Create some optional variations (no blood group, evening batch, etc)
  const bloodGroup = Math.random() > 0.5 ? 'B+' : (Math.random() > 0.5 ? 'O+' : 'A+')
  const batch = Math.random() > 0.5 ? 'Morning' : 'Evening'

  sql += `INSERT INTO public.customers (id, name, phone, gender, blood_group, preferred_batch, fitness_goals) VALUES ('${customerId}', '${name}', '${phone}', '${gender}', '${bloodGroup}', '${batch}', 'General Fitness');\n`
  
  sql += `INSERT INTO public.memberships (id, customer_id, plan_name, amount, start_date, end_date, status) VALUES ('${membershipId}', '${customerId}', '${plan.name}', ${plan.amount}, '${startDateStr}', '${endDateStr}', '${status}');\n`
  
  sql += `INSERT INTO public.payments (membership_id, total_amount, paid_amount, payment_method, payment_date) VALUES ('${membershipId}', ${plan.amount}, ${paidAmount}, 'UPI', '${startDateStr}');\n\n`
}

fs.writeFileSync('inject_50_customers.sql', sql)
console.log('Generated inject_50_customers.sql')
