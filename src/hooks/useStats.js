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
    expiringMembers: [] // For the alerts section
  })
  const [loading, setLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)

      // Total Members
      const { count: totalMembers } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .eq('is_deleted', false)

      // Active Members (from memberships)
      const { count: activeMembers } = await supabase
        .from('memberships')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')

      // Expiring Soon (from active_members view)
      const { data: expiringData, count: expiringSoon } = await supabase
        .from('active_members')
        .select('*', { count: 'exact' })
        .eq('expiry_status', 'expiring')

      // Expired Memberships
      const { count: expired } = await supabase
        .from('memberships')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'expired')

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
        expiringSoon: expiringSoon || 0,
        expired: expired || 0,
        paymentPending,
        newThisMonth: newThisMonth || 0,
        expiringMembers: expiringData || []
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
