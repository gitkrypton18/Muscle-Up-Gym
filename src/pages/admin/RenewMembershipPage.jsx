import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { RefreshCw, Loader2, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { useCustomers } from '@/hooks/useCustomers'
import { useMemberships } from '@/hooks/useMemberships'
import { usePayments } from '@/hooks/usePayments'
import { PLANS } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function RenewMembershipPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { fetchCustomerById } = useCustomers()
  const { addMembership, updateMembershipStatus } = useMemberships()
  const { addPayment } = usePayments()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [customer, setCustomer] = useState(null)
  
  const [formData, setFormData] = useState({
    plan_name: PLANS[1].name,
    amount: PLANS[1].amount,
    durationDays: PLANS[1].durationDays,
    start_date: new Date().toISOString().split('T')[0],
    paid_amount: PLANS[1].amount,
    payment_method: 'Cash',
    payment_notes: ''
  })

  useEffect(() => {
    async function loadData() {
      const data = await fetchCustomerById(id)
      if (data) {
        setCustomer(data)
        // Set default start date based on previous active membership
        const memberships = data.memberships?.sort((a, b) => new Date(b.end_date) - new Date(a.end_date)) || []
        if (memberships.length > 0) {
          const lastEnd = new Date(memberships[0].end_date)
          const today = new Date()
          if (lastEnd > today) {
            // If active, start date is day after end date
            const nextDay = new Date(lastEnd)
            nextDay.setDate(lastEnd.getDate() + 1)
            setFormData(p => ({ ...p, start_date: nextDay.toISOString().split('T')[0] }))
          }
        }
      }
      setLoading(false)
    }
    loadData()
  }, [id, fetchCustomerById])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlePlanSelect = (plan) => {
    setFormData(prev => ({
      ...prev,
      plan_name: plan.name,
      amount: plan.amount,
      durationDays: plan.durationDays,
      paid_amount: plan.amount
    }))
  }

  const calculateEndDate = (startDate, days) => {
    if (!startDate || !days) return ''
    const date = new Date(startDate)
    date.setDate(date.getDate() + days)
    return date.toISOString().split('T')[0]
  }

  const handleSubmit = async () => {
    if (!formData.paid_amount || formData.paid_amount < 0) {
      toast.error('Valid Paid Amount is required')
      return
    }

    if (Number(formData.paid_amount) > Number(formData.amount)) {
      toast.error('Paid Amount cannot be greater than Total Amount')
      return
    }

    setSaving(true)
    try {
      // 1. We no longer expire existing active memberships. 
      // The new membership will simply act as a consecutive active period.

      // 2. Add New Membership
      const endDate = calculateEndDate(formData.start_date, formData.durationDays)
      const { data: membershipData, error: memError } = await addMembership({
        customer_id: id,
        plan_name: formData.plan_name,
        amount: formData.amount,
        start_date: formData.start_date,
        end_date: endDate,
        status: 'active'
      })
      if (memError) throw new Error(memError.message || 'Failed to add membership')

      // 3. Add Payment
      const { error: payError } = await addPayment({
        membership_id: membershipData.id,
        total_amount: formData.amount,
        paid_amount: formData.paid_amount,
        payment_method: formData.payment_method,
        notes: formData.payment_notes || null
      })
      if (payError) throw new Error(payError.message || 'Failed to add payment')

      toast.success('Membership renewed successfully!')
      navigate(`/admin/customers/${id}`)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
  if (!customer) return <div className="text-center py-12">Customer not found.</div>

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Profile
      </Button>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            Renew Membership for {customer.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 sm:p-8 space-y-8">
          
          {/* Plan Selection */}
          <div>
            <Label className="text-lg mb-4 block">Select Plan</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {PLANS.map(plan => (
                <div 
                  key={plan.id}
                  onClick={() => handlePlanSelect(plan)}
                  className={`relative cursor-pointer rounded-xl p-4 border-2 transition-all ${
                    formData.plan_name === plan.name 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border bg-background hover:border-primary/50'
                  }`}
                >
                  {plan.isPopular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-black text-xs font-bold px-2 py-0.5 rounded-full">POPULAR</span>}
                  {plan.isBestValue && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-black text-xs font-bold px-2 py-0.5 rounded-full">BEST VALUE</span>}
                  <div className="text-center space-y-2 mt-2">
                    <h4 className="font-bold text-lg text-foreground">{plan.name}</h4>
                    <p className="text-2xl font-black text-primary">₹{plan.amount}</p>
                    <p className="text-sm text-muted-foreground">{plan.durationDays} days</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dates & Payment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-border">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Duration</h3>
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="date" name="start_date" value={formData.start_date} onChange={handleChange} className="bg-background border-border" />
              </div>
              <div className="space-y-2">
                <Label>End Date (Auto-calculated)</Label>
                <Input type="date" value={calculateEndDate(formData.start_date, formData.durationDays)} readOnly className="bg-secondary/50 border-border text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-4 bg-secondary/30 p-4 rounded-xl border border-border">
              <h3 className="text-lg font-semibold text-foreground">Payment</h3>
              <div className="flex justify-between items-center bg-background p-3 rounded-lg border border-border">
                <span className="text-muted-foreground">Total Amount</span>
                <span className="text-xl font-bold text-foreground">₹{formData.amount}</span>
              </div>
              <div className="space-y-2">
                <Label>Paid Amount</Label>
                <Input type="number" name="paid_amount" value={formData.paid_amount} onChange={handleChange} className="bg-background border-border text-lg font-bold text-green-500" />
              </div>
              <div className="flex justify-between items-center px-1">
                <span className="text-muted-foreground">Due Amount:</span>
                <span className={`font-bold ${formData.amount - formData.paid_amount > 0 ? 'text-amber-500' : 'text-green-500'}`}>
                  ₹{Math.max(0, formData.amount - formData.paid_amount)}
                </span>
              </div>
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select value={formData.payment_method} onValueChange={(v) => setFormData(p => ({...p, payment_method: v}))}>
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="Card">Card</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Payment Notes (Optional)</Label>
                <Input name="payment_notes" value={formData.payment_notes} onChange={handleChange} className="bg-background border-border" placeholder="e.g. Reference ID" />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-border mt-6">
            <Button onClick={handleSubmit} disabled={saving} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold min-w-[150px]">
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><RefreshCw className="w-4 h-4 mr-2" /> Renew Plan</>}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
