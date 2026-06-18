import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, ChevronRight, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useCustomers } from '@/hooks/useCustomers'
import { useMemberships } from '@/hooks/useMemberships'
import { usePayments } from '@/hooks/usePayments'
import { PLANS } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'

export function AddCustomerPage() {
  const navigate = useNavigate()
  const { addCustomer } = useCustomers()
  const { addMembership } = useMemberships()
  const { addPayment } = usePayments()
  
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  
  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Personal
    name: '', phone: '', whatsapp: '', email: '', address: '',
    age: '', gender: 'Male', height: '', weight: '',
    medical: '', emergency_name: '', emergency_phone: '', notes: '',
    // Step 2: Membership
    plan_name: PLANS[1].name,
    amount: PLANS[1].amount,
    durationDays: PLANS[1].durationDays,
    start_date: new Date().toISOString().split('T')[0],
    paid_amount: PLANS[1].amount,
    payment_method: 'Cash',
    payment_notes: ''
  })

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
      paid_amount: plan.amount // default full payment
    }))
  }

  const calculateEndDate = (startDate, days) => {
    if (!startDate || !days) return ''
    const date = new Date(startDate)
    date.setDate(date.getDate() + days)
    return date.toISOString().split('T')[0]
  }

  const handleNext = () => {
    if (!formData.name || !formData.phone) {
      toast.error('Name and Phone are required')
      return
    }
    setStep(2)
  }

  const handleSubmit = async () => {
    if (!formData.paid_amount || formData.paid_amount < 0) {
      toast.error('Valid Paid Amount is required')
      return
    }

    setLoading(true)
    try {
      // 1. Add Customer
      const { data: customerData, error: custError } = await addCustomer({
        name: formData.name,
        phone: formData.phone,
        whatsapp: formData.whatsapp || null,
        email: formData.email || null,
        address: formData.address || null,
        age: formData.age ? parseInt(formData.age) : null,
        gender: formData.gender,
        height: formData.height ? parseFloat(formData.height) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        medical: formData.medical || null,
        emergency_name: formData.emergency_name || null,
        emergency_phone: formData.emergency_phone || null,
        notes: formData.notes || null
      })
      if (custError) throw new Error(custError.message || 'Failed to add customer')

      // 2. Add Membership
      const endDate = calculateEndDate(formData.start_date, formData.durationDays)
      const { data: membershipData, error: memError } = await addMembership({
        customer_id: customerData.id,
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

      toast.success('Customer added successfully!')
      navigate('/admin/customers')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Progress Wizard */}
      <div className="flex items-center justify-center mb-8">
        <div className={`flex items-center ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 ${step >= 1 ? 'border-primary bg-primary/10' : 'border-muted-foreground'}`}>
            1
          </div>
          <span className="ml-2 font-medium">Personal Details</span>
        </div>
        <div className="w-16 h-[2px] mx-4 bg-border">
          <div className={`h-full bg-primary transition-all duration-300 ${step >= 2 ? 'w-full' : 'w-0'}`} />
        </div>
        <div className={`flex items-center ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 ${step >= 2 ? 'border-primary bg-primary/10' : 'border-muted-foreground'}`}>
            2
          </div>
          <span className="ml-2 font-medium">Membership</span>
        </div>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-6 sm:p-8">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Full Name *</Label>
                  <Input name="name" value={formData.name} onChange={handleChange} className="bg-background border-border" placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number *</Label>
                  <Input name="phone" value={formData.phone} onChange={handleChange} className="bg-background border-border" placeholder="9876543210" />
                </div>
                <div className="space-y-2">
                  <Label>WhatsApp Number</Label>
                  <Input name="whatsapp" value={formData.whatsapp} onChange={handleChange} className="bg-background border-border" placeholder="Leave empty if same as phone" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input name="email" type="email" value={formData.email} onChange={handleChange} className="bg-background border-border" placeholder="john@example.com" />
                </div>
                <div className="space-y-2">
                  <Label>Age</Label>
                  <Input name="age" type="number" value={formData.age} onChange={handleChange} className="bg-background border-border" />
                </div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select value={formData.gender} onValueChange={(v) => setFormData(p => ({...p, gender: v}))}>
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Height (cm)</Label>
                  <Input name="height" type="number" value={formData.height} onChange={handleChange} className="bg-background border-border" />
                </div>
                <div className="space-y-2">
                  <Label>Weight (kg)</Label>
                  <Input name="weight" type="number" value={formData.weight} onChange={handleChange} className="bg-background border-border" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Address</Label>
                  <Textarea name="address" value={formData.address} onChange={handleChange} className="bg-background border-border resize-none" rows={2} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Medical Conditions / History</Label>
                  <Textarea name="medical" value={formData.medical} onChange={handleChange} className="bg-background border-border resize-none" rows={2} placeholder="Any past injuries, asthma, BP, etc." />
                </div>
                <div className="space-y-2">
                  <Label>Emergency Contact Name</Label>
                  <Input name="emergency_name" value={formData.emergency_name} onChange={handleChange} className="bg-background border-border" />
                </div>
                <div className="space-y-2">
                  <Label>Emergency Contact Phone</Label>
                  <Input name="emergency_phone" value={formData.emergency_phone} onChange={handleChange} className="bg-background border-border" />
                </div>
              </div>
              <div className="flex justify-end pt-4 border-t border-border mt-6">
                <Button onClick={handleNext} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Next Step <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
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

              <div className="flex justify-between pt-4 border-t border-border mt-6">
                <Button variant="outline" onClick={() => setStep(1)} className="border-border hover:bg-secondary">
                  Back
                </Button>
                <Button onClick={handleSubmit} disabled={loading} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold min-w-[120px]">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle2 className="w-5 h-5 mr-2" /> Complete setup</>}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
