import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export function useStats() {
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    expiringSoon: 0,
    expired: 0,
    paymentPending: 0,
    newThisMonth: 0,
    attentionMembers: [] // Both expiring AND expired (who haven't renewed)
  })
  const [loading, setLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)

      // Total Members (non-deleted)
      const { count: totalMembers } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .eq('is_deleted', false)

      // Active Members (non-deleted customers only)
      const { count: activeMembers } = await supabase
        .from('memberships')
        .select('*, customers!inner(is_deleted)', { count: 'exact', head: true })
        .eq('status', 'active')
        .gte('end_date', new Date().toISOString().split('T')[0])
        .eq('customers.is_deleted', false)

      // Expiring Memberships (from view)
      const { data: rawExpiringData } = await supabase
        .from('active_members')
        .select('*', { count: 'exact' })
        .eq('expiry_status', 'expiring')

      // Healthy Memberships (from view) to filter out false-positives
      const { data: healthyData } = await supabase
        .from('active_members')
        .select('id')
        .eq('expiry_status', 'healthy')

      const healthyIds = new Set((healthyData || []).map(m => m.id))
      const expiringData = (rawExpiringData || []).filter(m => !healthyIds.has(m.id))

      // Expired Memberships - only those whose customer has NOT renewed
      // (i.e., customer has NO active membership currently)
      const { data: expiredMemberships } = await supabase
        .from('memberships')
        .select('*, customers!inner(id, name, phone, whatsapp, is_deleted)')
        .eq('status', 'expired')
        .eq('customers.is_deleted', false)

      // Filter out customers who already have an active membership (they renewed)
      const { data: activeMembershipCustomerIds } = await supabase
        .from('memberships')
        .select('customer_id')
        .eq('status', 'active')
        .gte('end_date', new Date().toISOString().split('T')[0])

      const activeCustomerIds = new Set((activeMembershipCustomerIds || []).map(m => m.customer_id))

      // Expired members who have NOT renewed
      const trueExpiredMembers = (expiredMemberships || []).filter(
        m => !activeCustomerIds.has(m.customer_id)
      )

      // Deduplicate by customer_id (keep latest expired membership per customer)
      const expiredByCustomer = new Map()
      trueExpiredMembers.forEach(m => {
        const existing = expiredByCustomer.get(m.customer_id)
        if (!existing || new Date(m.end_date) > new Date(existing.end_date)) {
          expiredByCustomer.set(m.customer_id, m)
        }
      })
      const uniqueExpiredMembers = Array.from(expiredByCustomer.values())

      // Unpaid Members (joining payments, memberships, and customers)
      const { data: unpaidRawData } = await supabase
        .from('payments')
        .select(`
          due_amount,
          memberships!inner (
            id, plan_name, start_date, end_date,
            customers!inner (
              id, name, phone, whatsapp, is_deleted
            )
          )
        `)
        .gt('due_amount', 0)
        .eq('memberships.customers.is_deleted', false)

      const unpaidData = (unpaidRawData || []).map(p => ({
        id: p.memberships.customers.id,
        name: p.memberships.customers.name,
        phone: p.memberships.customers.phone,
        whatsapp: p.memberships.customers.whatsapp,
        plan_name: p.memberships.plan_name,
        start_date: p.memberships.start_date,
        end_date: p.memberships.end_date,
        due_amount: p.due_amount
      }))

      // Build attention list: expiring members + truly expired members + unpaid members
      const attentionMap = new Map()

      // Add expiring
      ;(expiringData || []).forEach(m => {
        attentionMap.set(m.id, { ...m, _attentionType: 'expiring' })
      })

      // Add expired (will overwrite expiring if somehow both exist, but they shouldn't)
      uniqueExpiredMembers.forEach(m => {
        attentionMap.set(m.customers.id, {
          id: m.customers.id,
          name: m.customers.name,
          phone: m.customers.phone,
          whatsapp: m.customers.whatsapp,
          plan_name: m.plan_name,
          end_date: m.end_date,
          start_date: m.start_date,
          _attentionType: 'expired'
        })
      })

      // Add unpaid (if already in list, change type to unpaid to prioritize payment alert, or keep both? Let's prioritize unpaid)
      ;(unpaidData || []).forEach(m => {
        const existing = attentionMap.get(m.id)
        attentionMap.set(m.id, { 
          ...(existing || m), 
          _attentionType: 'unpaid',
          due_amount: m.due_amount 
        })
      })

      const attentionMembers = Array.from(attentionMap.values())

      // Payment Pending
      const { data: payments } = await supabase
        .from('payments')
        .select('due_amount')
        .gt('due_amount', 0)

      const paymentPending = payments?.reduce((sum, p) => sum + Number(p.due_amount), 0) || 0

      // New this month
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const { count: newThisMonth } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .eq('is_deleted', false)
        .gte('created_at', startOfMonth.toISOString())

      setStats({
        totalMembers: totalMembers || 0,
        activeMembers: activeMembers || 0,
        expiringSoon: expiringData.length,
        expired: uniqueExpiredMembers.length,
        paymentPending,
        newThisMonth: newThisMonth || 0,
        attentionMembers
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return { stats, loading, refetch: fetchStats }
}
