import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export function useCustomers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('active_members')
        .select('*')
        .order('name')
      
      if (error) throw error

      // Fetch pending payments
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('membership_id, due_amount')
        .gt('due_amount', 0)

      if (paymentsError) throw paymentsError

      const dueAmountMap = new Map()
      paymentsData?.forEach(p => {
        dueAmountMap.set(p.membership_id, p.due_amount)
      })

      const mergedData = (data || []).map(member => ({
        ...member,
        due_amount: dueAmountMap.get(member.membership_id) || 0
      }))

      setCustomers(mergedData)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching customers:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchCustomerById = async (id) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('customers')
        .select(`
          *,
          memberships(
            *,
            payments(*)
          )
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  const addCustomer = async (customerData) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('customers')
        .insert([customerData])
        .select()
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (err) {
      setError(err.message)
      return { data: null, error: err }
    } finally {
      setLoading(false)
    }
  }

  const updateCustomer = async (id, updates) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (err) {
      setError(err.message)
      return { data: null, error: err }
    } finally {
      setLoading(false)
    }
  }

  const deleteCustomer = async (id) => {
    return updateCustomer(id, { is_deleted: true })
  }

  const deleteMembership = async (membershipId) => {
    try {
      setLoading(true)
      const { error } = await supabase
        .from('memberships')
        .delete()
        .eq('id', membershipId)
      if (error) throw error
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const settlePaymentDue = async (paymentId, totalAmount) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('payments')
        .update({ due_amount: 0, paid_amount: totalAmount })
        .eq('id', paymentId)
        .select()
        .single()
      if (error) throw error
      return { data, error: null }
    } catch (err) {
      setError(err.message)
      return { data: null, error: err }
    } finally {
      setLoading(false)
    }
  }

  return {
    customers,
    loading,
    error,
    fetchCustomers,
    fetchCustomerById,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    deleteMembership,
    settlePaymentDue
  }
}
