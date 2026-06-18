import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Edit, History, Calendar, CreditCard, Activity, Trash2 } from 'lucide-react'
import { useCustomers } from '@/hooks/useCustomers'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ActionButtons } from '@/components/shared/ActionButtons'
import { ExpiryBadge } from '@/components/shared/ExpiryBadge'
import { calculateDaysRemaining, getInitials, formatCurrency } from '@/lib/utils'

export function CustomerDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { fetchCustomerById, deleteCustomer } = useCustomers()
  const [customer, setCustomer] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const data = await fetchCustomerById(id)
      setCustomer(data)
      setLoading(false)
    }
    loadData()
  }, [id, fetchCustomerById])

  if (loading) return <LoadingSpinner />
  if (!customer) return <div className="text-center py-12">Customer not found.</div>

  const memberships = customer.memberships?.sort((a, b) => new Date(b.start_date) - new Date(a.start_date)) || []
  const currentMembership = memberships.find(m => m.status === 'active') || memberships[0]
  const allPayments = customer.payments?.sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date)) || []

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Member Profile</h2>
        <div className="flex gap-2">
          <Button variant="outline" asChild className="border-border hover:bg-secondary">
            <Link to={`/admin/customers/${id}/edit`}>
              <Edit className="w-4 h-4 mr-2" /> Edit
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Col 1: Profile Details */}
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center pb-6 border-b border-border">
              <div className="w-24 h-24 rounded-full bg-primary/20 border-2 border-primary/50 flex items-center justify-center text-primary font-bold text-3xl mb-4">
                {getInitials(customer.name)}
              </div>
              <h3 className="text-2xl font-bold text-foreground">{customer.name}</h3>
              <p className="text-muted-foreground">{customer.phone}</p>
              <div className="mt-4">
                <ActionButtons phone={customer.phone} whatsapp={customer.whatsapp} />
              </div>
            </div>

            <div className="pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Age</p>
                  <p className="font-medium text-foreground">{customer.age || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Gender</p>
                  <p className="font-medium text-foreground">{customer.gender || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Weight</p>
                  <p className="font-medium text-foreground">{customer.weight ? `${customer.weight} kg` : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Height</p>
                  <p className="font-medium text-foreground">{customer.height ? `${customer.height} cm` : 'N/A'}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Address</p>
                <p className="text-sm font-medium text-foreground">{customer.address || 'Not provided'}</p>
              </div>

              {customer.medical && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-xs text-red-500 font-semibold mb-1 flex items-center"><Activity className="w-3 h-3 mr-1" /> Medical Notes</p>
                  <p className="text-sm text-red-400">{customer.medical}</p>
                </div>
              )}

              {(customer.emergency_name || customer.emergency_phone) && (
                <div className="p-3 bg-secondary/50 rounded-lg border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Emergency Contact</p>
                  <p className="text-sm font-medium text-foreground">{customer.emergency_name || 'Unknown'}</p>
                  <p className="text-sm text-muted-foreground">{customer.emergency_phone || 'No number'}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Col 2: Current Membership */}
        <Card className="bg-card border-border lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xl">Current Plan</CardTitle>
            {currentMembership && <ExpiryBadge daysRemaining={calculateDaysRemaining(currentMembership.end_date)} />}
          </CardHeader>
          <CardContent>
            {currentMembership ? (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between gap-6 p-6 bg-secondary/30 rounded-xl border border-border">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium mb-1">Plan Name</p>
                    <h4 className="text-2xl font-bold text-foreground flex items-center">
                      <Calendar className="w-5 h-5 mr-2 text-primary" />
                      {currentMembership.plan_name}
                    </h4>
                    <div className="mt-4 space-y-1 text-sm">
                      <p><span className="text-muted-foreground">Start:</span> <span className="text-foreground font-medium">{new Date(currentMembership.start_date).toLocaleDateString()}</span></p>
                      <p><span className="text-muted-foreground">End:</span> <span className="text-foreground font-medium">{new Date(currentMembership.end_date).toLocaleDateString()}</span></p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end justify-center">
                    <p className="text-sm text-muted-foreground mb-2">Days Remaining</p>
                    <div className={`text-5xl font-black ${calculateDaysRemaining(currentMembership.end_date) <= 5 ? 'text-amber-500' : 'text-primary'}`}>
                      {Math.max(0, calculateDaysRemaining(currentMembership.end_date))}
                    </div>
                    <Button asChild className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground">
                      <Link to={`/admin/customers/${id}/renew`}>Renew Now</Link>
                    </Button>
                  </div>
                </div>

                {/* Payments for current membership */}
                <div>
                  <h4 className="font-semibold text-foreground mb-3 flex items-center">
                    <CreditCard className="w-4 h-4 mr-2" /> Payment Details
                  </h4>
                  <div className="space-y-3">
                    {allPayments.filter(p => p.membership_id === currentMembership.id).map(payment => (
                      <div key={payment.id} className="flex justify-between items-center p-3 rounded-lg border border-border bg-background">
                        <div>
                          <p className="font-medium text-foreground">{formatCurrency(payment.paid_amount)} paid via {payment.payment_method}</p>
                          <p className="text-xs text-muted-foreground">{new Date(payment.payment_date).toLocaleDateString()}</p>
                        </div>
                        {payment.due_amount > 0 ? (
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Due Amount</p>
                            <p className="font-bold text-red-500">{formatCurrency(payment.due_amount)}</p>
                          </div>
                        ) : (
                          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Fully Paid</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No active membership found.</p>
                <Button asChild>
                  <Link to={`/admin/customers/${id}/renew`}>Assign Membership</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Col 3: History (Full width below) */}
        <Card className="bg-card border-border lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <History className="w-5 h-5 mr-2" /> Membership History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {memberships.length === 0 ? (
              <p className="text-muted-foreground">No history available.</p>
            ) : (
              <div className="space-y-4">
                {memberships.map((membership, i) => (
                  <div key={membership.id} className={`flex flex-col md:flex-row justify-between items-start md:items-center p-4 rounded-xl border ${i === 0 ? 'border-primary/50 bg-primary/5' : 'border-border bg-secondary/20'}`}>
                    <div>
                      <h4 className="font-semibold text-foreground text-lg">{membership.plan_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(membership.start_date).toLocaleDateString()} - {new Date(membership.end_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 mt-4 md:mt-0">
                      <p className="font-bold text-foreground">{formatCurrency(membership.amount)}</p>
                      <Badge variant="outline" className={membership.status === 'active' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}>
                        {membership.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
