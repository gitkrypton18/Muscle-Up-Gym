import { useEffect, useState } from 'react'
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
  const { fetchCustomerById, addCustomer, updateCustomer } = useCustomers()
  const { addMembership } = useMemberships()
  const { addPayment } = usePayments()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [customer, setCustomer] = useState(null)
  const [showPartnerModal, setShowPartnerModal] = useState(false)
  const [partnerData, setPartnerData] = useState({ 
    name: '', phone: '', whatsapp: '', email: '', 
    age: '', gender: '', height: '', weight: '',
    preferred_batch: 'Flexible', blood_group: '', 
    medical: '', emergency_name: '', emergency_phone: '',
    fitness_goals: '', notes: '' 
  })
  
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

  const handleSubmit = () => {
    if (formData.amount === undefined || formData.amount === '' || Number(formData.amount) < 0) {
      toast.error('Total Amount cannot be negative')
      return
    }
    if (formData.durationDays === undefined || formData.durationDays === '' || Number(formData.durationDays) < 1) {
      toast.error('Duration must be at least 1 day')
      return
    }
    if (formData.paid_amount === undefined || formData.paid_amount === '' || Number(formData.paid_amount) < 0) {
      toast.error('Valid Paid Amount is required')
      return
    }
    if (Number(formData.paid_amount) > Number(formData.amount)) {
      toast.error('Paid Amount cannot be greater than Total Amount')
      return
    }

    if (formData.plan_name.toLowerCase().includes('couple') && !customer.partner_id) {
      setShowPartnerModal(true)
      return
    }
    
    executeRenewal(customer.partner_id)
  }

  const executeRenewal = async (partnerId) => {
    setSaving(true)
    try {
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

      const { error: payError } = await addPayment({
        membership_id: membershipData.id,
        total_amount: formData.amount,
        paid_amount: formData.paid_amount,
        payment_method: formData.payment_method,
        payment_date: new Date().toISOString(),
        notes: formData.payment_notes || null
      })
      if (payError) throw new Error(payError.message || 'Failed to add payment')

      if (formData.plan_name.toLowerCase().includes('couple') && partnerId) {
        await addMembership({
          customer_id: partnerId,
          plan_name: formData.plan_name + ' (Partner)',
          amount: 0,
          start_date: formData.start_date,
          end_date: endDate,
          status: 'active'
        })
      }

      toast.success('Membership renewed successfully!')
      navigate(`/admin/customers/${id}`)
    } catch (error) {
      toast.error(error.message)
      setSaving(false)
    }
  }

  const handleCreatePartnerAndRenew = async () => {
    if (!partnerData.name || !partnerData.phone) {
      toast.error('Partner Name and Phone are required')
      return
    }
    setSaving(true)
    try {
      const { data: newPartner, error: partnerError } = await addCustomer({
        ...partnerData,
        age: partnerData.age || null,
        height: partnerData.height || null,
        weight: partnerData.weight || null,
        gender: partnerData.gender || null,
        partner_id: customer.id
      })
      if (partnerError) throw new Error(partnerError.message || 'Failed to create partner')
      
      await updateCustomer(customer.id, { partner_id: newPartner.id })
      setShowPartnerModal(false)
      
      await executeRenewal(newPartner.id)
    } catch (err) {
      toast.error(err.message)
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
              <div className="space-y-2">
                <Label>Total Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">₹</span>
                  <Input type="number" name="amount" value={formData.amount} onChange={handleChange} className="pl-7 bg-background border-border text-lg font-bold" />
                </div>
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
            <Button onClick={handleSubmit} disabled={saving} className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-bold sm:min-w-[150px]">
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><RefreshCw className="w-4 h-4 mr-2" /> Renew Plan</>}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Add Partner Modal */}
      {showPartnerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border w-full max-w-3xl rounded-2xl shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[95vh]">
            <h3 className="text-xl font-bold text-center text-foreground mb-1 shrink-0">Add Partner</h3>
            <p className="text-center text-sm text-muted-foreground mb-4 shrink-0">
              Complete the partner's profile to continue.
            </p>
            
            <div className="space-y-4 overflow-y-auto pr-2 pb-2 flex-1 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Partner Name *</Label>
                  <Input value={partnerData.name} onChange={(e) => setPartnerData(p => ({...p, name: e.target.value}))} className="bg-background border-border" />
                </div>
                <div className="space-y-2">
                  <Label>Partner Phone *</Label>
                  <Input value={partnerData.phone} onChange={(e) => setPartnerData(p => ({...p, phone: e.target.value}))} className="bg-background border-border" />
                </div>
                <div className="space-y-2">
                  <Label>WhatsApp</Label>
                  <Input value={partnerData.whatsapp} onChange={(e) => setPartnerData(p => ({...p, whatsapp: e.target.value}))} className="bg-background border-border" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={partnerData.email} onChange={(e) => setPartnerData(p => ({...p, email: e.target.value}))} className="bg-background border-border" />
                </div>
                
                <div className="space-y-2">
                  <Label>Age</Label>
                  <Input type="number" value={partnerData.age} onChange={(e) => setPartnerData(p => ({...p, age: e.target.value}))} className="bg-background border-border" />
                </div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select value={partnerData.gender} onValueChange={(v) => setPartnerData(p => ({...p, gender: v}))}>
                    <SelectTrigger className="bg-background border-border"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Height (cm)</Label>
                  <Input type="number" value={partnerData.height} onChange={(e) => setPartnerData(p => ({...p, height: e.target.value}))} className="bg-background border-border" />
                </div>
                <div className="space-y-2">
                  <Label>Weight (kg)</Label>
                  <Input type="number" value={partnerData.weight} onChange={(e) => setPartnerData(p => ({...p, weight: e.target.value}))} className="bg-background border-border" />
                </div>

                <div className="space-y-2">
                  <Label>Preferred Batch</Label>
                  <Select value={partnerData.preferred_batch} onValueChange={(v) => setPartnerData(p => ({...p, preferred_batch: v}))}>
                    <SelectTrigger className="bg-background border-border"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Morning">Morning</SelectItem>
                      <SelectItem value="Evening">Evening</SelectItem>
                      <SelectItem value="Flexible">Flexible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Blood Group</Label>
                  <Select value={partnerData.blood_group} onValueChange={(v) => setPartnerData(p => ({...p, blood_group: v}))}>
                    <SelectTrigger className="bg-background border-border"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem><SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem><SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem><SelectItem value="O-">O-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem><SelectItem value="AB-">AB-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2 mt-4">
                <Label>Medical Conditions / History</Label>
                <Input value={partnerData.medical} onChange={(e) => setPartnerData(p => ({...p, medical: e.target.value}))} className="bg-background border-border" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label>Emergency Contact Name</Label>
                  <Input value={partnerData.emergency_name} onChange={(e) => setPartnerData(p => ({...p, emergency_name: e.target.value}))} className="bg-background border-border" />
                </div>
                <div className="space-y-2">
                  <Label>Emergency Phone</Label>
                  <Input value={partnerData.emergency_phone} onChange={(e) => setPartnerData(p => ({...p, emergency_phone: e.target.value}))} className="bg-background border-border" />
                </div>
              </div>

              <div className="space-y-2 mt-4">
                <Label>Fitness Goals</Label>
                <Input value={partnerData.fitness_goals} onChange={(e) => setPartnerData(p => ({...p, fitness_goals: e.target.value}))} className="bg-background border-border" />
              </div>
            </div>

            <div className="flex gap-3 mt-4 pt-4 border-t border-border shrink-0">
              <Button variant="ghost" className="flex-1 text-muted-foreground hover:text-foreground" onClick={() => setShowPartnerModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePartnerAndRenew} disabled={saving} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create & Renew'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
