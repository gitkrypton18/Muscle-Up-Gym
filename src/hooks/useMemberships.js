import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export function useMemberships() {
  const [loading, setLoading] = useState(false)

  const addMembership = useCallback(async (membershipData) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('memberships')
        .insert([membershipData])
        .select()
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (err) {
      console.error('Error adding membership:', err)
      return { data: null, error: err }
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchMembershipsByCustomer = useCallback(async (customerId) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('memberships')
        .select(`
          *,
          payments(*)
        `)
        .eq('customer_id', customerId)
        .order('start_date', { ascending: false })

      if (error) throw error
      return { data, error: null }
    } catch (err) {
      console.error('Error fetching memberships:', err)
      return { data: null, error: err }
    } finally {
      setLoading(false)
    }
  }, [])

  const updateMembershipStatus = useCallback(async (id, status) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('memberships')
        .update({ status })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (err) {
      console.error('Error updating membership:', err)
      return { data: null, error: err }
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    addMembership,
    fetchMembershipsByCustomer,
    updateMembershipStatus
  }
}
