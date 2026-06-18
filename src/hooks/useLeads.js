import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export function useLeads() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setLeads(data || [])
    } catch (err) {
      setError(err.message)
      console.error('Error fetching leads:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const addLead = async (leadData) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('leads')
        .insert([leadData])
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

  const updateLeadStatus = async (id, status) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('leads')
        .update({ status })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      
      // Update local state
      setLeads(current => current.map(lead => lead.id === id ? { ...lead, status } : lead))
      
      return { data, error: null }
    } catch (err) {
      setError(err.message)
      return { data: null, error: err }
    } finally {
      setLoading(false)
    }
  }

  const deleteLead = async (id) => {
    try {
      setLoading(true)
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      setLeads(current => current.filter(lead => lead.id !== id))
      return { error: null }
    } catch (err) {
      setError(err.message)
      return { error: err }
    } finally {
      setLoading(false)
    }
  }

  return {
    leads,
    loading,
    error,
    fetchLeads,
    addLead,
    updateLeadStatus,
    deleteLead
  }
}
