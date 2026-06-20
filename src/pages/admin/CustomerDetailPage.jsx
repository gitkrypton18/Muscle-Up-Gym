import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Edit, History, Calendar, CreditCard, Activity, Trash2, ArrowLeft, Unlink, Target, Mail, Clock, Droplets, AlertTriangle } from 'lucide-react'
import { useCustomers } from '@/hooks/useCustomers'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ActionButtons } from '@/components/shared/ActionButtons'
import { ExpiryBadge } from '@/components/shared/ExpiryBadge'
import { calculateDaysRemaining, getInitials, formatCurrency, generateWhatsAppMessage } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export function CustomerDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { fetchCustomerById, deleteCustomer, deleteMembership, settlePaymentDue, deletePayment, updateCustomer } = useCustomers()
  const [customer, setCustomer] = useState(null)
  const [partner, setPartner] = useState(null)
  const [loading, setLoading] = useState(true)
  const [paymentToDelete, setPaymentToDelete] = useState(null)

  const reloadData = async () => {
    setLoading(true)
    const data = await fetchCustomerById(id)
    setCustomer(data)
    if (data?.partner_id) {
      const pData = await fetchCustomerById(data.partner_id)
      setPartner(pData)
    } else {
      setPartner(null)
    }
    setLoading(false)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reloadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, fetchCustomerById])

  if (loading) return <LoadingSpinner />
  if (!customer) return <div className="text-center py-12">Customer not found.</div>

  const memberships = customer.memberships?.sort((a, b) => new Date(b.end_date) - new Date(a.end_date)) || []
  
  const todayStr = new Date().toISOString().split('T')[0]
  // Strictly find the plan that covers today
  let currentMembership = memberships.find(m => m.status === 'active' && m.start_date <= todayStr && m.end_date >= todayStr)
  // Fallback to the latest active plan (if future-only), or just the latest plan
  if (!currentMembership) {
    currentMembership = memberships.find(m => m.status === 'active') || memberships[0]
  }
  const allPayments = memberships.flatMap(m => m.payments || []).sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date))

  const totalDueAmount = allPayments.reduce((sum, p) => sum + (p.due_amount || 0), 0)
  const daysLeft = currentMembership ? calculateDaysRemaining(currentMembership.end_date) : 0

  const handleDeleteCustomer = async () => {
    if (totalDueAmount > 0) {
      toast.error(`Cannot delete ${customer.name}: Outstanding dues of ₹${totalDueAmount} must be paid first.`)
      return
    }
    if (window.confirm(`Are you sure you want to delete ${customer.name}? This action cannot be undone.`)) {
      const { error } = await deleteCustomer(id)
      if (error) {
        toast.error(error.message || `Failed to delete ${customer.name}`)
      } else {
        toast.success(`${customer.name} deleted successfully`)
        navigate('/admin/customers')
      }
    }
  }

  const handleUnlinkCouple = async () => {
    if (!partner) return
    if (window.confirm(`Are you sure you want to unlink ${customer.name} and ${partner.name}? They will no longer share a couple membership.`)) {
      try {
        await updateCustomer(customer.id, { partner_id: null })
        await updateCustomer(partner.id, { partner_id: null })
        toast.success('Couple unlinked successfully')
        reloadData()
      } catch {
        toast.error('Failed to unlink couple')
      }
    }
  }

  const handleDeleteMembership = async (membershipId) => {
    if (window.confirm('Are you sure you want to delete this membership record?')) {
      const { error } = await deleteMembership(membershipId)
      if (error) {
        toast.error(error.message || 'Failed to delete membership. Please delete its payments first.')
      } else {
        toast.success('Membership deleted successfully.')
        reloadData()
      }
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Back button + Title + Actions */}
      <div className="space-y-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-muted-foreground -ml-2">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Member Profile</h2>
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 w-full sm:w-auto">
            {partner && (
              <Button variant="outline" onClick={handleUnlinkCouple} className="border-amber-500/20 text-amber-500 hover:bg-amber-500/10 w-full sm:w-auto text-sm h-10 col-span-2 sm:col-span-1">
                <Unlink className="w-4 h-4 mr-2" /> Unlink Couple
              </Button>
            )}
            <Button variant="outline" asChild className="border-border hover:bg-secondary w-full sm:w-auto text-sm h-10">
              <Link to={`/admin/customers/${id}/edit`}>
                <Edit className="w-4 h-4 mr-2" /> Edit
              </Link>
            </Button>
            <Button variant="outline" onClick={handleDeleteCustomer} className="border-red-500/20 text-red-500 hover:bg-red-500/10 w-full sm:w-auto text-sm h-10">
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Profile Header Card - Mobile optimized */}
      <Card className="bg-card border-border">
        <CardContent className="p-4 sm:p-6">
          <div className={`flex flex-col sm:flex-row ${partner ? 'sm:items-stretch sm:divide-x sm:divide-border' : 'items-center'} gap-6`}>
            
            {/* Primary Member */}
            <div className="flex items-center gap-4 flex-1">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/20 border-2 border-primary/50 flex items-center justify-center text-primary font-bold text-2xl sm:text-3xl shrink-0">
                {getInitials(customer.name)}
              </div>
              <div className="min-w-0 flex-1">
                {partner && <Badge variant="outline" className="mb-1 text-[10px] bg-primary/10 text-primary border-primary/20">Primary</Badge>}
                <h3 className="text-xl sm:text-2xl font-bold text-foreground truncate">{customer.name}</h3>
                <p className="text-muted-foreground text-sm">{customer.phone}</p>
                {customer.email && <p className="text-muted-foreground text-xs flex items-center mt-0.5"><Mail className="w-3 h-3 mr-1" />{customer.email}</p>}
                <div className="mt-2">
                  <ActionButtons 
                    phone={customer.phone} 
                    whatsapp={customer.whatsapp} 
                    message={generateWhatsAppMessage({ name: customer.name, daysLeft, dueAmount: totalDueAmount })}
                  />
                </div>
              </div>
            </div>

            {/* Partner Member */}
            {partner && (
              <div className="flex items-center gap-4 flex-1 pt-6 border-t border-border sm:pt-0 sm:border-t-0 sm:pl-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/20 border-2 border-primary/50 flex items-center justify-center text-primary font-bold text-2xl sm:text-3xl shrink-0">
                  {getInitials(partner.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <Badge variant="outline" className="mb-1 text-[10px] bg-primary/10 text-primary border-primary/20">Partner</Badge>
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground truncate">
                    <Link to={`/admin/customers/${partner.id}`} className="hover:underline">{partner.name}</Link>
                  </h3>
                  <p className="text-muted-foreground text-sm">{partner.phone}</p>
                  {partner.email && <p className="text-muted-foreground text-xs flex items-center mt-0.5"><Mail className="w-3 h-3 mr-1" />{partner.email}</p>}
                  <div className="mt-2">
                    <ActionButtons 
                      phone={partner.phone} 
                      whatsapp={partner.whatsapp} 
                      message={generateWhatsAppMessage({ name: partner.name, daysLeft, dueAmount: totalDueAmount })}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick info grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-border">
            <div>
              <p className="text-xs text-muted-foreground">Age</p>
              <p className="text-sm font-medium text-foreground">{customer.age || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Gender</p>
              <p className="text-sm font-medium text-foreground">{customer.gender || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Weight</p>
              <p className="text-sm font-medium text-foreground">{customer.weight ? `${customer.weight} kg` : 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Height</p>
              <p className="text-sm font-medium text-foreground">{customer.height ? `${customer.height} cm` : 'N/A'}</p>
            </div>
          </div>

          {/* Extra info */}
          {customer.fitness_goals && (
            <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
              <p className="text-xs text-primary font-semibold mb-0.5 flex items-center"><Target className="w-3 h-3 mr-1" /> Fitness Goals</p>
              <p className="text-sm text-foreground">{customer.fitness_goals}</p>
            </div>
          )}

          {/* Health & Logistics */}
          <div className="mt-6 space-y-4">
            {customer.medical && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-xs text-destructive font-semibold mb-0.5 flex items-center"><AlertTriangle className="w-3 h-3 mr-1" /> Medical Alert</p>
                <p className="text-sm text-foreground font-medium">{customer.medical}</p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              {customer.preferred_batch && (
                <div className="p-3 bg-secondary/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-0.5 flex items-center"><Clock className="w-3 h-3 mr-1" /> Batch Preference</p>
                  <p className="text-sm font-medium text-foreground">{customer.preferred_batch}</p>
                </div>
              )}
              {customer.blood_group && (
                <div className="p-3 bg-secondary/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-0.5 flex items-center"><Droplets className="w-3 h-3 mr-1 text-red-500" /> Blood Group</p>
                  <p className="text-sm font-medium text-foreground">{customer.blood_group}</p>
                </div>
              )}
            </div>
          </div>

          {customer.address && (
            <div className="mt-4 p-3 bg-secondary/30 rounded-lg">
              <p className="text-xs text-muted-foreground mb-0.5">Address</p>
              <p className="text-sm text-foreground">{customer.address}</p>
            </div>
          )}

          {customer.medical && (
            <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-xs text-red-500 font-semibold mb-0.5 flex items-center"><Activity className="w-3 h-3 mr-1" /> Medical Notes</p>
              <p className="text-sm text-red-400">{customer.medical}</p>
            </div>
          )}

          {(customer.emergency_name || customer.emergency_phone) && (
            <div className="mt-3 p-3 bg-secondary/30 rounded-lg border border-border">
              <p className="text-xs text-muted-foreground mb-0.5">Emergency Contact</p>
              <p className="text-sm font-medium text-foreground">{customer.emergency_name || 'Unknown'} · {customer.emergency_phone || 'No number'}</p>
            </div>
          )}

          {customer.notes && (
            <div className="mt-3 p-3 bg-secondary/30 rounded-lg border border-border">
              <p className="text-xs text-muted-foreground mb-0.5">General Notes</p>
              <p className="text-sm text-foreground whitespace-pre-wrap">{customer.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Plan */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg">Current Plan</CardTitle>
          {currentMembership && <ExpiryBadge daysRemaining={calculateDaysRemaining(currentMembership.end_date)} />}
        </CardHeader>
        <CardContent>
          {currentMembership ? (
            <div className="space-y-4">
              {/* Plan info */}
              <div className="p-4 bg-secondary/30 rounded-xl border border-border">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">Plan</p>
                    <h4 className="text-lg sm:text-xl font-bold text-foreground flex items-center mt-0.5">
                      <Calendar className="w-4 h-4 mr-1.5 text-primary shrink-0" />
                      <span className="truncate">{currentMembership.plan_name}</span>
                    </h4>
                    <div className="mt-3 space-y-1 text-sm">
                      <p><span className="text-muted-foreground">Start:</span> <span className="text-foreground font-medium">{new Date(currentMembership.start_date).toLocaleDateString('en-IN')}</span></p>
                      <p><span className="text-muted-foreground">End:</span> <span className="text-foreground font-medium">{new Date(currentMembership.end_date).toLocaleDateString('en-IN')}</span></p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-muted-foreground">Days Left</p>
                    <div className={`text-3xl sm:text-4xl font-black ${calculateDaysRemaining(currentMembership.end_date) <= 5 ? 'text-amber-500' : 'text-primary'}`}>
                      {Math.max(0, calculateDaysRemaining(currentMembership.end_date))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border/50">
                  <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground flex-1 h-10 text-sm font-semibold flex justify-center items-center">
                    <Link to={`/admin/customers/${id}/renew`}>Modify / Renew</Link>
                  </Button>
                  <Button size="icon" variant="outline" onClick={() => handleDeleteMembership(currentMembership.id)} className="border-red-500/20 text-red-500 hover:bg-red-500/10 shrink-0 h-10 w-10 flex items-center justify-center" title="Delete Membership">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Payment Details */}
              <div>
                <h4 className="font-semibold text-foreground mb-3 flex items-center text-sm">
                  <CreditCard className="w-4 h-4 mr-1.5" /> Payment Details
                </h4>
                <div className="space-y-2">
                  {allPayments.map(payment => (
                    <div key={payment.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg border border-border bg-background">
                      <div className="min-w-0">
                        <p className="font-medium text-foreground text-sm truncate">{formatCurrency(payment.paid_amount)} via {payment.payment_method}</p>
                        <p className="text-xs text-muted-foreground">{new Date(payment.payment_date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                      </div>
                      {payment.due_amount > 0 ? (
                        <div className="flex items-center gap-2 self-start sm:self-center">
                          <Badge className="bg-red-500/15 text-red-400 border-red-500/30 text-xs">₹{payment.due_amount} Due</Badge>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-6 text-[10px] px-2 border-green-500/30 text-green-500 hover:bg-green-500/10"
                            onClick={async () => {
                              const calculatedTotal = payment.paid_amount + payment.due_amount;
                              if (window.confirm(`Settle pending due of ₹${payment.due_amount} for this payment?`)) {
                                const { error } = await settlePaymentDue(payment.id, calculatedTotal)
                                if (error) {
                                  toast.error(error.message || 'Failed to settle payment')
                                } else {
                                  toast.success('Payment settled successfully')
                                  reloadData()
                                }
                              }
                            }}
                          >
                            Settle Due
                          </Button>
                          <Button size="icon" variant="outline" className="h-6 w-6 border-red-500/20 text-red-500 hover:bg-red-500/10" onClick={() => setPaymentToDelete(payment)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 self-start sm:self-center">
                          <Badge className="bg-green-500/15 text-green-500 border-green-500/30 text-xs">Paid</Badge>
                          <Button size="icon" variant="outline" className="h-6 w-6 border-red-500/20 text-red-500 hover:bg-red-500/10" onClick={() => setPaymentToDelete(payment)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4 text-sm">No active membership found.</p>
              <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Link to={`/admin/customers/${id}/renew`}>Assign Membership</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Membership History */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <History className="w-4 h-4 mr-2" /> History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {memberships.length === 0 ? (
            <p className="text-muted-foreground text-sm">No history available.</p>
          ) : (
            <div className="space-y-3">
              {memberships.map((membership, i) => (
                <div key={membership.id} className={`p-3 sm:p-4 rounded-xl border ${i === 0 ? 'border-primary/40 bg-primary/5' : 'border-border bg-secondary/10'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h4 className="font-semibold text-foreground text-base truncate">{membership.plan_name}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(membership.start_date).toLocaleDateString('en-IN', {day:'2-digit', month:'short', year:'2-digit'})} → {new Date(membership.end_date).toLocaleDateString('en-IN', {day:'2-digit', month:'short', year:'2-digit'})}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-bold text-foreground text-sm">{formatCurrency(membership.amount)}</span>
                      <Badge className={`text-[11px] ${membership.status === 'active' ? 'bg-green-500/15 text-green-400 border-green-500/30' : 'bg-red-500/15 text-red-400 border-red-500/30'}`}>
                        {membership.status === 'active' ? 'Active' : 'Expired'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Advanced Deletion Modal */}
      {paymentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4 border border-red-500/30">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-center text-foreground mb-2">Delete Payment Record</h3>
            <p className="text-center text-sm text-muted-foreground mb-6">
              You are about to delete a payment of <strong className="text-foreground">₹{paymentToDelete.paid_amount}</strong>. What exactly do you want to delete?
            </p>
            
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start h-auto py-3 px-4 border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-500"
                onClick={async () => {
                  const { error } = await deletePayment(paymentToDelete.id)
                  if (error) {
                    toast.error(error.message || 'Failed to delete payment')
                  } else {
                    toast.success('Only payment record was deleted.')
                    setPaymentToDelete(null)
                    reloadData()
                  }
                }}
              >
                <div className="text-left">
                  <div className="font-bold flex items-center">Delete Payment ONLY</div>
                  <div className="text-xs opacity-80 font-normal mt-1">Keeps the membership active, just removes this financial record.</div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start h-auto py-3 px-4 border-red-500/30 hover:bg-red-500/10 hover:text-red-500"
                onClick={async () => {
                  const { error: payErr } = await deletePayment(paymentToDelete.id)
                  if (!payErr) {
                    const memToDelete = memberships.find(m => m.id === paymentToDelete.membership_id)
                    await deleteMembership(paymentToDelete.membership_id)
                    
                    // Delete partner's matching membership if it exists
                    if (partner && memToDelete) {
                      const matchingPartnerMem = (partner.memberships || []).find(
                        m => m.start_date === memToDelete.start_date && m.end_date === memToDelete.end_date
                      )
                      if (matchingPartnerMem) {
                        await deleteMembership(matchingPartnerMem.id)
                      }
                    }

                    toast.success('Payment AND Membership deleted.')
                    setPaymentToDelete(null)
                    reloadData()
                  } else {
                    toast.error(payErr.message || 'Failed to delete payment')
                  }
                }}
              >
                <div className="text-left">
                  <div className="font-bold flex items-center text-red-500">Delete Payment AND Membership</div>
                  <div className="text-xs opacity-80 font-normal mt-1 text-red-400">Completely wipes this plan and payment.</div>
                </div>
              </Button>
            </div>
            
            <Button 
              variant="ghost" 
              className="w-full mt-4 text-muted-foreground hover:text-foreground"
              onClick={() => setPaymentToDelete(null)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
