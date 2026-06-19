import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Users, UserCheck, AlertTriangle, XCircle, CreditCard, UserPlus, Star, Wallet, Calendar } from 'lucide-react'
import { useStats } from '@/hooks/useStats'
import { StatCard } from '@/components/shared/StatCard'
import { ExpiryBadge } from '@/components/shared/ExpiryBadge'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { formatCurrency, calculateDaysRemaining, generateWhatsAppMessage } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ActionButtons } from '@/components/shared/ActionButtons'
import { Badge } from '@/components/ui/badge'

export function DashboardPage() {
  const { stats, loading } = useStats()
  const navigate = useNavigate()

  if (loading) return <LoadingSpinner />

  const attentionCount = stats.attentionMembers?.length || 0

  return (
    <div className="space-y-5">
      {/* Owners Welcome */}
      <div className="flex items-center justify-between">
         <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
         <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-sm">
           <Star className="w-3 h-3 mr-1.5 inline" fill="currentColor" /> 
           Owner: Pankaj
         </Badge>
      </div>

      {/* Stats Grid - 2 columns on mobile, 3 on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Total Members" value={stats.totalMembers} icon={Users} color="blue" onClick={() => navigate('/admin/customers?filter=all')} />
        <StatCard title="Active" value={stats.activeMembers} icon={UserCheck} color="green" onClick={() => navigate('/admin/customers?filter=active')} />
        <StatCard title="Expiring Soon" value={stats.expiringSoon} icon={AlertTriangle} color="orange" onClick={() => navigate('/admin/customers?filter=expiring')} />
        <StatCard title="Expired" value={stats.expired} icon={XCircle} color="red" onClick={() => navigate('/admin/customers?filter=expired')} />
        <StatCard title="Pending ₹" value={formatCurrency(stats.paymentPending)} icon={CreditCard} color="yellow" onClick={() => navigate('/admin/customers?filter=unpaid')} />
        <StatCard title="Earnings This Month" value={formatCurrency(0)} icon={Wallet} color="emerald" />
        <StatCard title="New This Month" value={stats.newThisMonth} icon={UserPlus} color="purple" onClick={() => navigate('/admin/customers?filter=all')} />
        <StatCard title="Today's Date" value={new Date().toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })} icon={Calendar} color="indigo" />
      </div>



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

                const waMessage = generateWhatsAppMessage({
                  name: member.name,
                  daysLeft,
                  dueAmount: isUnpaid ? member.due_amount : 0
                })

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
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <span className="bg-secondary text-foreground text-[10px] px-2 py-0.5 rounded-md border border-border">{member.plan_name}</span>
                        {isUnpaid && (
                          <Badge className="bg-red-500/15 text-red-400 border-red-500/30 text-[10px] px-2 py-0.5 rounded-md leading-none">
                            ₹{member.due_amount} Due
                          </Badge>
                        )}
                        {isExpired ? (
                          <Badge className="bg-red-500/15 text-red-400 border-red-500/30 text-[10px] px-2 py-0.5 rounded-md leading-none">Expired</Badge>
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
