import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export function usePayments() {
  const [loading, setLoading] = useState(false)

  const addPayment = async (paymentData) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('payments')
        .insert([paymentData])
        .select()
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (err) {
      console.error('Error adding payment:', err)
      return { data: null, error: err }
    } finally {
      setLoading(false)
    }
  }

  const fetchPaymentsByMembership = async (membershipId) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('membership_id', membershipId)
        .order('payment_date', { ascending: false })

      if (error) throw error
      return { data, error: null }
    } catch (err) {
      console.error('Error fetching payments:', err)
      return { data: null, error: err }
    } finally {
      setLoading(false)
    }
  }

  const updatePayment = async (id, updates) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('payments')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (err) {
      console.error('Error updating payment:', err)
      return { data: null, error: err }
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    addPayment,
    fetchPaymentsByMembership,
    updatePayment
  }
}
