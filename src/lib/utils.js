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
  return differenceInDays(new Date(endDate), new Date())
}

export function getInitials(name) {
  if (!name) return "U"
  const parts = name.split(" ")
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return parts[0].substring(0, 2).toUpperCase()
}
