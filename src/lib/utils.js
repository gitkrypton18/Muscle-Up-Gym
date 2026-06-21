import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, differenceInDays } from "date-fns"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateString) {
  if (!dateString) return "N/A"
  return format(new Date(dateString), "dd MMM yyyy")
}

export function calculateDaysRemaining(endDate) {
  if (!endDate) return 0
  const end = new Date(endDate)
  end.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return differenceInDays(end, today)
}

export function getInitials(name) {
  if (!name) return "U"
  const parts = name.split(" ")
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return parts[0].substring(0, 2).toUpperCase()
}

export function generateWhatsAppMessage({ name, daysLeft, dueAmount }) {
  const firstName = name?.split(" ")[0] || "Member"
  
  if (dueAmount > 0) {
    return `Hi ${firstName}, this is a gentle reminder that you have a pending due of ₹${dueAmount} for your gym membership. Please clear it at the earliest. Thank you! 💪`
  } else if (daysLeft < 0) {
    return `Hi ${firstName}, your MuscleUp Gym membership has expired. We'd love to see you back in the gym! Please renew your membership. 🏃‍♂️`
  } else if (daysLeft >= 0 && daysLeft <= 5) {
    return `Hi ${firstName}, your MuscleUp Gym membership expires in ${daysLeft} days. Please renew it soon to continue your fitness journey without interruption! 🏋️‍♂️`
  }
  
  return `Hi ${firstName}, greetings from MuscleUp Gym! 💪`
}
