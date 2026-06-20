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
    collectedThisMonth: 0,
    attentionMembers: [] // Both expiring AND expired (who haven't renewed)
  })
  const [loading, setLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)

      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)
      const todayStr = new Date().toISOString().split('T')[0]

      const [
        { count: totalMembers },
        {},
        { data: rawExpiringData },
        { data: healthyData },
        { data: expiredMemberships },
        { data: activeMembershipCustomerIds },
        { data: unpaidRawData },
        { count: newThisMonth },
        { data: paymentsThisMonth }
      ] = await Promise.all([
        // Total Members
        supabase.from('customers').select('*', { count: 'exact', head: true }).eq('is_deleted', false),
        // Active Members
        supabase.from('memberships').select('*, customers!inner(is_deleted)', { count: 'exact', head: true }).eq('status', 'active').gte('end_date', todayStr).eq('customers.is_deleted', false),
        // Expiring Memberships
        supabase.from('active_members').select('*', { count: 'exact' }).eq('expiry_status', 'expiring'),
        // Healthy Memberships
        supabase.from('active_members').select('id').eq('expiry_status', 'healthy'),
        // Expired Memberships
        supabase.from('memberships').select('*, customers!inner(id, name, phone, whatsapp, is_deleted)').eq('status', 'expired').eq('customers.is_deleted', false),
        // Active Customer IDs
        supabase.from('memberships').select('customer_id, customers!inner(is_deleted)').eq('status', 'active').gte('end_date', todayStr).eq('customers.is_deleted', false),
        // Unpaid Members
        supabase.from('payments').select(`due_amount, memberships!inner (id, plan_name, start_date, end_date, customers!inner (id, name, phone, whatsapp, is_deleted))`).gt('due_amount', 0).eq('memberships.customers.is_deleted', false),
        // New this month
        supabase.from('customers').select('*', { count: 'exact', head: true }).eq('is_deleted', false).gte('created_at', startOfMonth.toISOString()),
        // Payments this month
        supabase.from('payments').select('paid_amount').gte('payment_date', startOfMonth.toISOString())
      ])

      const healthyIds = new Set((healthyData || []).map(m => m.id))
      const expiringData = (rawExpiringData || []).filter(m => !healthyIds.has(m.id))

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

      // Add expired
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

      // Add unpaid
      ;(unpaidData || []).forEach(m => {
        const existing = attentionMap.get(m.id)
        attentionMap.set(m.id, { 
          ...(existing || m), 
          _attentionType: 'unpaid',
          due_amount: (existing?.due_amount || 0) + Number(m.due_amount)
        })
      })

      const attentionMembers = Array.from(attentionMap.values())

      const paymentPending = unpaidData.reduce((sum, p) => sum + Number(p.due_amount), 0)

      setStats({
        totalMembers: totalMembers || 0,
        activeMembers: activeCustomerIds.size || 0,
        expiringSoon: expiringData.length,
        expired: uniqueExpiredMembers.length,
        paymentPending,
        newThisMonth: newThisMonth || 0,
        collectedThisMonth: (paymentsThisMonth || []).reduce((sum, p) => sum + (Number(p.paid_amount) || 0), 0),
        attentionMembers
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStats()
  }, [fetchStats])

  return { stats, loading, refetch: fetchStats }
}
