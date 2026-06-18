import React from 'react'
import { BarChart, Bar, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Link } from 'react-router-dom'
import { Users, UserCheck, AlertTriangle, XCircle, CreditCard, UserPlus } from 'lucide-react'
import { useStats } from '@/hooks/useStats'
import { StatCard } from '@/components/shared/StatCard'
import { ExpiryBadge } from '@/components/shared/ExpiryBadge'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { formatCurrency, calculateDaysRemaining } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ActionButtons } from '@/components/shared/ActionButtons'
import { Badge } from '@/components/ui/badge'

export function DashboardPage() {
  const { stats, loading } = useStats()

  if (loading) return <LoadingSpinner />

  const attentionCount = stats.attentionMembers?.length || 0

  return (
    <div className="space-y-5">
      {/* Stats Grid - 2 columns on mobile, 3 on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <StatCard title="Total Members" value={stats.totalMembers} icon={Users} color="blue" />
        <StatCard title="Active" value={stats.activeMembers} icon={UserCheck} color="green" />
        <StatCard title="Expiring Soon" value={stats.expiringSoon} icon={AlertTriangle} color="orange" />
        <StatCard title="Expired" value={stats.expired} icon={XCircle} color="red" />
        <StatCard title="Pending ₹" value={formatCurrency(stats.paymentPending)} icon={CreditCard} color="yellow" />
        <StatCard title="New This Month" value={stats.newThisMonth} icon={UserPlus} color="purple" />
      </div>

      {/* Analytics Chart */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
          <CardTitle className="text-base sm:text-lg text-foreground">Membership Overview</CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4 sm:pt-4">
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Active', count: stats.activeMembers, fill: '#eab308' }, // primary color
                { name: 'Expiring', count: stats.expiringSoon, fill: '#f59e0b' }, // amber
                { name: 'Expired', count: stats.expired, fill: '#ef4444' } // red
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: '#334155', opacity: 0.2 }}
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Attention Section - shows both expired & expiring members */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <CardTitle className="text-base sm:text-lg text-foreground">⚠️ Needs Attention</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Expired, expiring, or unpaid memberships
              </p>
            </div>
            {attentionCount > 0 && (
              <Badge className="bg-amber-500/15 text-amber-500 border-amber-500/30 shrink-0">
                {attentionCount}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
          {attentionCount === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <UserCheck className="w-10 h-10 mx-auto opacity-20 mb-2" />
              <p className="text-sm">All memberships are healthy 🎉</p>
            </div>
          ) : (
            <div className="space-y-2">
              {stats.attentionMembers.map((member, idx) => {
                const daysLeft = calculateDaysRemaining(member.end_date)
                const isExpired = member._attentionType === 'expired'
                const isUnpaid = member._attentionType === 'unpaid'

                let waMessage = ''
                const firstName = member.name?.split(' ')[0] || 'Member'
                if (isUnpaid) {
                   waMessage = `Hi ${firstName}, this is a gentle reminder that you have a pending due of ₹${member.due_amount} for your gym membership. Please clear it at the earliest. Thank you! 💪`
                } else if (isExpired) {
                   waMessage = `Hi ${firstName}, your MuscleUp Gym membership has expired. We'd love to see you back in the gym! Please renew your membership. 🏃‍♂️`
                } else {
                   waMessage = `Hi ${firstName}, your MuscleUp Gym membership expires in ${daysLeft} days. Please renew it soon to continue your fitness journey without interruption! 🏋️‍♂️`
                }

                return (
                  <Link
                    key={`${member.id}-${idx}`}
                    to={`/admin/customers/${member.id}`}
                    className={`flex items-center gap-3 p-3 border rounded-xl transition-colors active:scale-[0.99] ${
                      isExpired || isUnpaid
                        ? 'border-red-500/25 hover:bg-red-500/5'
                        : 'border-amber-500/25 hover:bg-amber-500/5'
                    }`}
                  >
                    {/* Avatar */}
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border ${
                      isExpired || isUnpaid
                        ? 'bg-red-500/15 text-red-400 border-red-500/30'
                        : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    }`}>
                      {member.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground text-sm truncate">{member.name}</p>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        <span className="bg-secondary text-foreground text-[10px] px-1.5 py-0.5 rounded border border-border">{member.plan_name}</span>
                        {isUnpaid && (
                          <Badge className="bg-red-500/15 text-red-400 border-red-500/30 text-[10px] px-1.5 py-0">
                            ₹{member.due_amount} Due
                          </Badge>
                        )}
                        {isExpired ? (
                          <Badge className="bg-red-500/15 text-red-400 border-red-500/30 text-[10px] px-1.5 py-0">Expired</Badge>
                        ) : (
                          <ExpiryBadge daysRemaining={daysLeft} />
                        )}
                      </div>
                    </div>

                    {/* Call/WhatsApp - prevent link navigation */}
                    <div className="shrink-0" onClick={(e) => e.preventDefault()}>
                      <ActionButtons phone={member.phone} whatsapp={member.whatsapp} message={waMessage} />
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
