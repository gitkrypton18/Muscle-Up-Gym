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
        .from('customers')
        .select(`
          *,
          memberships (
            id, plan_name, start_date, end_date, status
          ),
          partner:customers!partner_id (name)
        `)
        .eq('is_deleted', false)
        .order('name')
      
      if (error) throw error

      // Fetch pending payments with customer_id
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select(`due_amount, memberships!inner(customer_id)`)
        .gt('due_amount', 0)

      if (paymentsError) throw paymentsError

      const dueAmountByCustomer = new Map()
      paymentsData?.forEach(p => {
        if (p.memberships?.customer_id) {
          const cId = p.memberships.customer_id
          dueAmountByCustomer.set(cId, (dueAmountByCustomer.get(cId) || 0) + Number(p.due_amount))
        }
      })

      const todayStr = new Date().toISOString().split('T')[0]
      const mergedData = (data || []).map(customer => {
        const memberships = customer.memberships?.sort((a, b) => new Date(b.end_date) - new Date(a.end_date)) || []
        
        let currentMembership = memberships.find(m => m.status === 'active' && m.start_date <= todayStr && m.end_date >= todayStr)
        if (!currentMembership) {
          currentMembership = memberships.find(m => m.status === 'active') || memberships[0]
        }

        // We explicitly delete memberships array from top level to match old structure, 
        // but it's fine to keep it.
        return {
          ...customer,
          plan_name: currentMembership?.plan_name || 'No Plan',
          start_date: currentMembership?.start_date || '',
          end_date: currentMembership?.end_date || '',
          status: currentMembership?.status || 'expired',
          membership_id: currentMembership?.id,
          due_amount: dueAmountByCustomer.get(customer.id) || 0,
          partner_name: customer.partner?.name || null
        }
      })

      setCustomers(mergedData)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching customers:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchCustomerById = useCallback(async (id) => {
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
  }, [])

  const addCustomer = useCallback(async (customerData) => {
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
  }, [])

  const updateCustomer = useCallback(async (id, updates) => {
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
  }, [])

  const deleteCustomer = useCallback(async (id) => {
    return updateCustomer(id, { is_deleted: true })
  }, [updateCustomer])

  const deleteMembership = useCallback(async (membershipId) => {
    try {
      setLoading(true)
      const { error } = await supabase
        .from('memberships')
        .delete()
        .eq('id', membershipId)
      if (error) throw error
      return { error: null }
    } catch (err) {
      setError(err.message)
      return { error: err }
    } finally {
      setLoading(false)
    }
  }, [])

  const settlePaymentDue = useCallback(async (paymentId, totalAmount) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('payments')
        .update({ paid_amount: totalAmount })
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
  }, [])

  const deletePayment = useCallback(async (paymentId) => {
    try {
      setLoading(true)
      const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', paymentId)
      if (error) throw error
      return { error: null }
    } catch (err) {
      setError(err.message)
      return { error: err }
    } finally {
      setLoading(false)
    }
  }, [])

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
    settlePaymentDue,
    deletePayment
  }
}
