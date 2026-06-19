import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export function useEarnings() {
  const [earningsData, setEarningsData] = useState({
    thisMonth: 0,
    totalEarnings: 0,
    lowestEarning: 0,
    totalDue: 0,
    payments: []
  })
  const [loading, setLoading] = useState(true)

  const fetchEarnings = useCallback(async () => {
    try {
      setLoading(true)
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)
      
      // Fetch all payments with customer details
      const { data: paymentsData, error } = await supabase
        .from('payments')
        .select(`
          *,
          memberships:membership_id (
            plan_name,
            customers:customer_id (
              id,
              name,
              phone
            )
          )
        `)
        .order('payment_date', { ascending: false })

      if (error) throw error

      let thisMonth = 0
      let totalEarnings = 0
      let lowestEarning = Infinity
      let totalDue = 0

      const payments = paymentsData?.map(p => {
        const paidAmount = Number(p.paid_amount) || 0
        const dueAmount = Number(p.due_amount) || 0
        
        // Calculate totals
        totalEarnings += paidAmount
        totalDue += dueAmount
        
        if (new Date(p.payment_date) >= startOfMonth) {
          thisMonth += paidAmount
        }
        
        if (paidAmount > 0 && paidAmount < lowestEarning) {
          lowestEarning = paidAmount
        }

        return {
          id: p.id,
          payment_date: p.payment_date,
          paid_amount: paidAmount,
          due_amount: dueAmount,
          payment_method: p.payment_method,
          customer_name: p.memberships?.customers?.name || 'Unknown',
          customer_phone: p.memberships?.customers?.phone || '',
          customer_id: p.memberships?.customers?.id,
          plan_name: p.memberships?.plan_name || 'Unknown'
        }
      }) || []

      setEarningsData({
        thisMonth,
        totalEarnings,
        lowestEarning: lowestEarning === Infinity ? 0 : lowestEarning,
        totalDue,
        payments
      })
    } catch (error) {
      console.error('Error fetching earnings:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEarnings()
  }, [fetchEarnings])

  // Method to delete a specific payment
  const deletePaymentRecord = async (paymentId) => {
    try {
      const { error } = await supabase.from('payments').delete().eq('id', paymentId)
      if (error) throw error
      await fetchEarnings()
      return { success: true }
    } catch (error) {
      console.error('Error deleting payment:', error)
      return { error }
    }
  }

  return { earningsData, loading, refetch: fetchEarnings, deletePaymentRecord }
}
