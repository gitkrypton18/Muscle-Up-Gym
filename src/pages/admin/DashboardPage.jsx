import React from 'react'
import { Link } from 'react-router-dom'
import { Users, UserCheck, AlertTriangle, XCircle, CreditCard, UserPlus, Phone, MessageCircle, Eye } from 'lucide-react'
import { useStats } from '@/hooks/useStats'
import { StatCard } from '@/components/shared/StatCard'
import { ExpiryBadge } from '@/components/shared/ExpiryBadge'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { formatCurrency, calculateDaysRemaining } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ActionButtons } from '@/components/shared/ActionButtons'

export function DashboardPage() {
  const { stats, loading } = useStats()

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Members"
          value={stats.totalMembers}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Active Members"
          value={stats.activeMembers}
          icon={UserCheck}
          color="green"
        />
        <StatCard
          title="Expiring Soon (5 days)"
          value={stats.expiringSoon}
          icon={AlertTriangle}
          color="orange"
        />
        <StatCard
          title="Expired Memberships"
          value={stats.expired}
          icon={XCircle}
          color="red"
        />
        <StatCard
          title="Payment Pending"
          value={formatCurrency(stats.paymentPending)}
          icon={CreditCard}
          color="yellow"
        />
        <StatCard
          title="New This Month"
          value={stats.newThisMonth}
          icon={UserPlus}
          color="purple"
        />
      </div>

      {/* Action Center - Expiring Soon */}
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl text-foreground">Needs Attention: Expiring Soon</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Memberships expiring within the next 5 days.
            </p>
          </div>
          {stats.expiringMembers?.length > 0 && (
            <div className="bg-amber-500/10 text-amber-500 px-4 py-2 rounded-lg text-sm font-medium border border-amber-500/20">
              {stats.expiringMembers.length} member(s) to call
            </div>
          )}
        </CardHeader>
        <CardContent>
          {stats.expiringMembers?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <UserCheck className="w-12 h-12 mx-auto opacity-20 mb-3" />
              <p>No memberships are expiring soon.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead>Member</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.expiringMembers.map((member) => (
                    <TableRow key={member.id} className="border-border hover:bg-secondary/50 transition-colors">
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-foreground">{member.plan_name}</p>
                        <p className="text-sm text-muted-foreground">End: {new Date(member.end_date).toLocaleDateString()}</p>
                      </TableCell>
                      <TableCell>
                        <ExpiryBadge daysRemaining={calculateDaysRemaining(member.end_date)} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end items-center gap-2">
                          <ActionButtons phone={member.phone} whatsapp={member.whatsapp} />
                          <Button variant="outline" size="icon" asChild className="h-8 w-8 border-border">
                            <Link to={`/admin/customers/${member.id}`}>
                              <Eye className="w-4 h-4 text-muted-foreground" />
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
