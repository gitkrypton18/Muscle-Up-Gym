import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
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

const customerSchema = z.object({
  // Step 1
  name: z.string().min(2, 'Name is required'),
  phone: z.string().regex(/^\d{10}$/, 'Phone number must be exactly 10 digits'),
  whatsapp: z.string().optional(),
  email: z.union([z.string().email('Invalid email'), z.literal('')]).optional(),
  age: z.coerce.number().optional().or(z.literal('')),
  gender: z.string().default('Male'),
  height: z.coerce.number().optional().or(z.literal('')),
  weight: z.coerce.number().optional().or(z.literal('')),
  address: z.string().optional(),
  preferred_batch: z.string().optional(),
  blood_group: z.string().optional(),
  medical: z.string().optional(),
  emergency_name: z.string().optional(),
  emergency_phone: z.string().optional(),
  fitness_goals: z.string().optional(),
  notes: z.string().optional(),
  
  // Step 2
  plan_name: z.string(),
  amount: z.coerce.number().min(0, 'Total amount cannot be negative'),
  durationDays: z.coerce.number().min(1, 'Duration must be at least 1 day'),
  start_date: z.string(),
  paid_amount: z.coerce.number().min(0, 'Paid amount cannot be negative'),
  payment_method: z.string(),
  payment_notes: z.string().optional(),

  // Step 3 (Partner - Optional unless Couple plan)
  partner_name: z.string().optional(),
  partner_phone: z.string().optional(),
  partner_whatsapp: z.string().optional(),
  partner_email: z.string().optional(),
  partner_age: z.coerce.number().optional().or(z.literal('')),
  partner_gender: z.string().optional(),
  partner_height: z.coerce.number().optional().or(z.literal('')),
  partner_weight: z.coerce.number().optional().or(z.literal('')),
  partner_preferred_batch: z.string().optional(),
  partner_blood_group: z.string().optional(),
  partner_medical: z.string().optional(),
  partner_emergency_name: z.string().optional(),
  partner_emergency_phone: z.string().optional(),
  partner_fitness_goals: z.string().optional(),
  partner_notes: z.string().optional(),
})

export function AddCustomerPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const prefillName = searchParams.get('name') || ''
  const prefillPhone = searchParams.get('phone') || ''
  
  const { addCustomer, updateCustomer } = useCustomers()
  const { addMembership } = useMemberships()
  const { addPayment } = usePayments()
  
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  
  const { register, handleSubmit, control, trigger, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: prefillName, 
      phone: prefillPhone, 
      whatsapp: '', 
      email: '', 
      address: '',
      age: '', 
      gender: 'Male', 
      height: '', 
      weight: '',
      preferred_batch: 'Flexible',
      blood_group: '',
      medical: '', 
      emergency_name: '', 
      emergency_phone: '', 
      fitness_goals: '',
      notes: '',
      plan_name: PLANS[0].name,
      amount: PLANS[0].amount,
      durationDays: PLANS[0].durationDays,
      start_date: new Date().toISOString().split('T')[0],
      paid_amount: PLANS[0].amount,
      payment_method: 'Cash',
      payment_notes: '',
      partner_name: '',
      partner_phone: '',
      partner_gender: 'Female',
      partner_preferred_batch: 'Flexible',
      partner_blood_group: '',
      partner_fitness_goals: ''
    }
  })

  const plan_name = watch('plan_name')
  const amount = watch('amount')
  const durationDays = watch('durationDays')
  const start_date = watch('start_date')
  const paid_amount = watch('paid_amount')
  const primaryGender = watch('gender')

  const isCouplePlan = plan_name?.toLowerCase().includes('couple')

  // Auto-fill partner gender when primary gender changes
  useEffect(() => {
    setValue('partner_gender', primaryGender === 'Male' ? 'Female' : 'Male')
  }, [primaryGender, setValue])

  const handlePlanSelect = (plan) => {
    setValue('plan_name', plan.name)
    setValue('amount', plan.amount)
    setValue('durationDays', plan.durationDays)
    setValue('paid_amount', plan.amount)
  }

  const calculateEndDate = (startDate, days) => {
    if (!startDate || !days) return ''
    const date = new Date(startDate)
    date.setDate(date.getDate() + days)
    return date.toISOString().split('T')[0]
  }

  const handleNextToStep2 = async () => {
    const isValid = await trigger(['name', 'phone'])
    if (isValid) {
      setStep(2)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleNextToStep3 = async () => {
    if (paid_amount === undefined || paid_amount === '' || Number(paid_amount) < 0) {
      toast.error('Valid Paid Amount is required')
      return
    }
    if (Number(paid_amount) > Number(amount)) {
      toast.error('Paid Amount cannot be greater than Total Amount')
      return
    }
    setStep(3)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const onSubmit = async (data) => {
    // Re-verify payment just in case
    if (data.paid_amount === undefined || data.paid_amount === '' || Number(data.paid_amount) < 0) {
      toast.error('Valid Paid Amount is required')
      return
    }

    if (isCouplePlan) {
      // Validate partner phone
      if (!data.partner_name) {
        toast.error('Partner Name is required for a Couple Plan')
        return
      }
      if (!/^\d{10}$/.test(data.partner_phone)) {
        toast.error('Partner Phone number must be exactly 10 digits')
        return
      }
    } else {
      if (!/^\d{10}$/.test(data.phone)) {
        toast.error('Phone number must be exactly 10 digits')
        return
      }
    }

    setLoading(true)
    try {
      // 1. Add Primary Customer
      const { data: customerData, error: custError } = await addCustomer({
        name: data.name,
        phone: data.phone,
        whatsapp: data.whatsapp || null,
        email: data.email || null,
        address: data.address || null,
        age: data.age ? parseInt(data.age) : null,
        gender: data.gender,
        height: data.height ? parseFloat(data.height) : null,
        weight: data.weight ? parseFloat(data.weight) : null,
        preferred_batch: data.preferred_batch || null,
        blood_group: data.blood_group || null,
        medical: data.medical || null,
        emergency_name: data.emergency_name || null,
        emergency_phone: data.emergency_phone || null,
        fitness_goals: data.fitness_goals || null,
        notes: data.notes || null
      })
      if (custError) throw new Error(custError.message || 'Failed to add primary customer')

      // 2. Add Partner Customer if Couple Plan
      let partnerData = null
      if (isCouplePlan) {
        const res = await addCustomer({
          name: data.partner_name,
          phone: data.partner_phone,
          whatsapp: data.partner_whatsapp || null,
          email: data.partner_email || null,
          address: data.address || null, // Share address
          age: data.partner_age ? parseInt(data.partner_age) : null,
          gender: data.partner_gender,
          height: data.partner_height ? parseFloat(data.partner_height) : null,
          weight: data.partner_weight ? parseFloat(data.partner_weight) : null,
          preferred_batch: data.partner_preferred_batch || null,
          blood_group: data.partner_blood_group || null,
          medical: data.partner_medical || null,
          emergency_name: data.partner_emergency_name || null,
          emergency_phone: data.partner_emergency_phone || null,
          fitness_goals: data.partner_fitness_goals || null,
          notes: data.partner_notes || null,
          partner_id: customerData.id // Link partner to primary
        })
        if (res.error) throw new Error(res.error.message || 'Failed to add partner customer')
        partnerData = res.data

        // Link primary to partner (ignore errors if column doesn't exist yet to prevent blocking)
        try {
          await updateCustomer(customerData.id, { partner_id: partnerData.id })
        } catch (e) {
          console.warn('Failed to backlink partner_id on primary customer', e)
        }
      }

      // 3. Add Primary Membership
      const endDate = calculateEndDate(data.start_date, data.durationDays)
      const { data: membershipData, error: memError } = await addMembership({
        customer_id: customerData.id,
        plan_name: data.plan_name,
        amount: data.amount,
        start_date: data.start_date,
        end_date: endDate,
        status: 'active'
      })
      if (memError) throw new Error(memError.message || 'Failed to add membership')

      // 4. Add Primary Payment
      const { error: payError } = await addPayment({
        membership_id: membershipData.id,
        total_amount: data.amount,
        paid_amount: data.paid_amount,
        payment_method: data.payment_method,
        payment_date: new Date().toISOString(),
        notes: data.payment_notes || null
      })
      if (payError) throw new Error(payError.message || 'Failed to add payment')

      // 5. Add Partner Membership (Amount 0)
      if (isCouplePlan && partnerData) {
        await addMembership({
          customer_id: partnerData.id,
          plan_name: data.plan_name + ' (Partner)',
          amount: 0,
          start_date: data.start_date,
          end_date: endDate,
          status: 'active'
        })
      }

      toast.success(isCouplePlan ? 'Couple added successfully!' : 'Customer added successfully!')
      navigate('/admin/customers')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Wizard */}
      <div className="flex items-center justify-center">
        <div className={`flex items-center ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 ${step >= 1 ? 'border-primary bg-primary/10' : 'border-muted-foreground'}`}>1</div>
          <span className="ml-2 text-sm font-medium hidden sm:inline">Details</span>
        </div>
        <div className="w-8 sm:w-16 h-[2px] mx-2 sm:mx-4 bg-border">
          <div className={`h-full bg-primary transition-all duration-300 ${step >= 2 ? 'w-full' : 'w-0'}`} />
        </div>
        <div className={`flex items-center ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 ${step >= 2 ? 'border-primary bg-primary/10' : 'border-muted-foreground'}`}>2</div>
          <span className="ml-2 text-sm font-medium hidden sm:inline">Membership</span>
        </div>
        {isCouplePlan && (
          <>
            <div className="w-8 sm:w-16 h-[2px] mx-2 sm:mx-4 bg-border">
              <div className={`h-full bg-primary transition-all duration-300 ${step >= 3 ? 'w-full' : 'w-0'}`} />
            </div>
            <div className={`flex items-center ${step >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 ${step >= 3 ? 'border-primary bg-primary/10' : 'border-muted-foreground'}`}>3</div>
              <span className="ml-2 text-sm font-medium hidden sm:inline">Partner</span>
            </div>
          </>
        )}
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Full Name *</Label>
                    <Input {...register('name')} className={`bg-background border-border ${errors.name ? 'border-destructive' : ''}`} placeholder="John Doe" />
                    {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number *</Label>
                    <Input {...register('phone')} className={`bg-background border-border ${errors.phone ? 'border-destructive' : ''}`} placeholder="9876543210" />
                    {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>WhatsApp Number</Label>
                    <Input {...register('whatsapp')} className="bg-background border-border" placeholder="Leave empty if same as phone" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" {...register('email')} className={`bg-background border-border ${errors.email ? 'border-destructive' : ''}`} placeholder="john@example.com" />
                    {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Age</Label>
                    <Input type="number" {...register('age')} className={`bg-background border-border ${errors.age ? 'border-destructive' : ''}`} />
                  </div>
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Controller
                      name="gender"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="bg-background border-border">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Height (cm)</Label>
                    <Input type="number" {...register('height')} className={`bg-background border-border ${errors.height ? 'border-destructive' : ''}`} />
                  </div>
                  <div className="space-y-2">
                    <Label>Weight (kg)</Label>
                    <Input type="number" {...register('weight')} className={`bg-background border-border ${errors.weight ? 'border-destructive' : ''}`} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Address</Label>
                    <Textarea {...register('address')} className="bg-background border-border resize-none" rows={2} />
                  </div>
                  <div className="space-y-2">
                    <Label>Preferred Batch</Label>
                    <Controller
                      name="preferred_batch"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="bg-background border-border">
                            <SelectValue placeholder="Select batch" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Morning">Morning</SelectItem>
                            <SelectItem value="Evening">Evening</SelectItem>
                            <SelectItem value="Flexible">Flexible</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Blood Group</Label>
                    <Controller
                      name="blood_group"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="bg-background border-border">
                            <SelectValue placeholder="Select blood group" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A+">A+</SelectItem>
                            <SelectItem value="A-">A-</SelectItem>
                            <SelectItem value="B+">B+</SelectItem>
                            <SelectItem value="B-">B-</SelectItem>
                            <SelectItem value="O+">O+</SelectItem>
                            <SelectItem value="O-">O-</SelectItem>
                            <SelectItem value="AB+">AB+</SelectItem>
                            <SelectItem value="AB-">AB-</SelectItem>
                            <SelectItem value="">Unknown</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Medical Conditions / History</Label>
                    <Textarea {...register('medical')} className="bg-background border-border resize-none" rows={2} placeholder="Any past injuries, asthma, BP, etc." />
                  </div>
                  <div className="space-y-2">
                    <Label>Emergency Contact Name</Label>
                    <Input {...register('emergency_name')} className="bg-background border-border" />
                  </div>
                  <div className="space-y-2">
                    <Label>Emergency Contact Phone</Label>
                    <Input {...register('emergency_phone')} className="bg-background border-border" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Fitness Goals</Label>
                    <Input {...register('fitness_goals')} className="bg-background border-border" placeholder="e.g. Weight loss, Muscle gain, General fitness" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Notes</Label>
                    <Textarea {...register('notes')} className="bg-background border-border resize-none" rows={2} placeholder="Any additional notes..." />
                  </div>
                </div>
                <div className="flex justify-end pt-4 border-t border-border mt-4">
                  <Button type="button" onClick={handleNextToStep2} className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto">
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
                          plan_name === plan.name 
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
                      <Input type="date" {...register('start_date')} className="bg-background border-border" />
                    </div>
                    <div className="space-y-2">
                      <Label>End Date (Auto-calculated)</Label>
                      <Input type="date" value={calculateEndDate(start_date, durationDays)} readOnly className="bg-secondary/50 border-border text-muted-foreground" />
                    </div>
                  </div>

                  <div className="space-y-4 bg-secondary/30 p-4 rounded-xl border border-border">
                    <h3 className="text-lg font-semibold text-foreground">Payment</h3>
                    <div className="space-y-2">
                      <Label>Total Amount</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">₹</span>
                        <Input type="number" {...register('amount')} className={`pl-7 bg-background border-border text-lg font-bold ${errors.amount ? 'border-destructive' : ''}`} />
                      </div>
                      {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>Paid Amount</Label>
                      <Input type="number" {...register('paid_amount')} className={`bg-background border-border text-lg font-bold text-green-500 ${errors.paid_amount ? 'border-destructive' : ''}`} />
                      {errors.paid_amount && <p className="text-xs text-destructive">{errors.paid_amount.message}</p>}
                    </div>
                    <div className="flex justify-between items-center px-1">
                      <span className="text-muted-foreground">Due Amount:</span>
                      <span className={`font-bold ${amount - paid_amount > 0 ? 'text-amber-500' : 'text-green-500'}`}>
                        ₹{Math.max(0, amount - paid_amount)}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <Label>Payment Method</Label>
                      <Controller
                        name="payment_method"
                        control={control}
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
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
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Payment Notes (Optional)</Label>
                      <Input {...register('payment_notes')} className="bg-background border-border" placeholder="e.g. Reference ID" />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 pt-4 border-t border-border mt-4">
                  <Button type="button" variant="outline" onClick={() => { setStep(1); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="border-border hover:bg-secondary w-full sm:w-auto">
                    Back
                  </Button>
                  
                  {isCouplePlan ? (
                    <Button type="button" onClick={handleNextToStep3} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold w-full sm:w-auto">
                      Add Other Partner <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold w-full sm:w-auto">
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle2 className="w-5 h-5 mr-2" /> Complete Setup</>}
                    </Button>
                  )}
                </div>
              </div>
            )}

            {step === 3 && isCouplePlan && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-foreground">Partner Details</h3>
                  <p className="text-sm text-muted-foreground">Adding partner for {watch('name')}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Full Name *</Label>
                    <Input {...register('partner_name')} className={`bg-background border-border ${errors.partner_name ? 'border-destructive' : ''}`} placeholder="Partner Name" />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number *</Label>
                    <Input {...register('partner_phone')} className={`bg-background border-border ${errors.partner_phone ? 'border-destructive' : ''}`} placeholder="9876543210" />
                  </div>
                  <div className="space-y-2">
                    <Label>WhatsApp Number</Label>
                    <Input {...register('partner_whatsapp')} className="bg-background border-border" placeholder="Leave empty if same as phone" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" {...register('partner_email')} className="bg-background border-border" />
                  </div>
                  <div className="space-y-2">
                    <Label>Age</Label>
                    <Input type="number" {...register('partner_age')} className="bg-background border-border" />
                  </div>
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Controller
                      name="partner_gender"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="bg-background border-border">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Height (cm)</Label>
                    <Input type="number" {...register('partner_height')} className="bg-background border-border" />
                  </div>
                  <div className="space-y-2">
                    <Label>Weight (kg)</Label>
                    <Input type="number" {...register('partner_weight')} className="bg-background border-border" />
                  </div>
                  <div className="space-y-2">
                    <Label>Preferred Batch</Label>
                    <Controller
                      name="partner_preferred_batch"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="bg-background border-border">
                            <SelectValue placeholder="Select batch" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Morning">Morning</SelectItem>
                            <SelectItem value="Evening">Evening</SelectItem>
                            <SelectItem value="Flexible">Flexible</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Blood Group</Label>
                    <Controller
                      name="partner_blood_group"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="bg-background border-border">
                            <SelectValue placeholder="Select blood group" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A+">A+</SelectItem>
                            <SelectItem value="A-">A-</SelectItem>
                            <SelectItem value="B+">B+</SelectItem>
                            <SelectItem value="B-">B-</SelectItem>
                            <SelectItem value="O+">O+</SelectItem>
                            <SelectItem value="O-">O-</SelectItem>
                            <SelectItem value="AB+">AB+</SelectItem>
                            <SelectItem value="AB-">AB-</SelectItem>
                            <SelectItem value="">Unknown</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Medical Conditions / History</Label>
                    <Textarea {...register('partner_medical')} className="bg-background border-border resize-none" rows={2} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Fitness Goals</Label>
                    <Input {...register('partner_fitness_goals')} className="bg-background border-border" placeholder="e.g. Weight loss, Muscle gain, General fitness" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Notes</Label>
                    <Textarea {...register('partner_notes')} className="bg-background border-border resize-none" rows={2} />
                  </div>
                </div>
                
                <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 pt-4 border-t border-border mt-4">
                  <Button type="button" variant="outline" onClick={() => { setStep(2); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="border-border hover:bg-secondary w-full sm:w-auto">
                    Go Back
                  </Button>
                  <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold w-full sm:w-auto">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle2 className="w-5 h-5 mr-2" /> Complete Setup</>}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
