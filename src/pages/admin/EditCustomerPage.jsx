import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Save, Loader2, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { useCustomers } from '@/hooks/useCustomers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'

const editCustomerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  whatsapp: z.string().optional(),
  email: z.union([z.string().email('Invalid email'), z.literal('')]).optional(),
  age: z.coerce.number().optional().or(z.literal('')),
  gender: z.string().default('Male'),
  height: z.coerce.number().optional().or(z.literal('')),
  weight: z.coerce.number().optional().or(z.literal('')),
  address: z.string().optional(),
  medical: z.string().optional(),
  emergency_name: z.string().optional(),
  emergency_phone: z.string().optional(),
  notes: z.string().optional(),
})

export function EditCustomerPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { fetchCustomerById, updateCustomer } = useCustomers()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
    resolver: zodResolver(editCustomerSchema),
  })

  useEffect(() => {
    async function loadData() {
      const data = await fetchCustomerById(id)
      if (data) {
        reset({
          name: data.name || '',
          phone: data.phone || '',
          whatsapp: data.whatsapp || '',
          email: data.email || '',
          address: data.address || '',
          age: data.age || '',
          gender: data.gender || 'Male',
          height: data.height || '',
          weight: data.weight || '',
          medical: data.medical || '',
          emergency_name: data.emergency_name || '',
          emergency_phone: data.emergency_phone || '',
          notes: data.notes || ''
        })
      }
      setLoading(false)
    }
    loadData()
  }, [id, fetchCustomerById, reset])

  const onSubmit = async (data) => {
    setSaving(true)
    const { error } = await updateCustomer(id, {
      name: data.name,
      phone: data.phone,
      whatsapp: data.whatsapp || null,
      email: data.email || null,
      address: data.address || null,
      age: data.age ? parseInt(data.age) : null,
      gender: data.gender,
      height: data.height ? parseFloat(data.height) : null,
      weight: data.weight ? parseFloat(data.weight) : null,
      medical: data.medical || null,
      emergency_name: data.emergency_name || null,
      emergency_phone: data.emergency_phone || null,
      notes: data.notes || null
    })

    setSaving(false)
    if (error) {
      toast.error(error.message || 'Failed to update customer')
    } else {
      toast.success('Customer updated successfully')
      navigate(`/admin/customers/${id}`)
    }
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Profile
      </Button>

      <Card className="bg-card border-border">
        <CardContent className="p-6 sm:p-8 space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input {...register('name')} className={`bg-background border-border ${errors.name ? 'border-destructive' : ''}`} />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Phone Number *</Label>
                <Input {...register('phone')} className={`bg-background border-border ${errors.phone ? 'border-destructive' : ''}`} />
                {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>WhatsApp Number</Label>
                <Input {...register('whatsapp')} className="bg-background border-border" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" {...register('email')} className={`bg-background border-border ${errors.email ? 'border-destructive' : ''}`} />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Age</Label>
                <Input type="number" {...register('age')} className={`bg-background border-border ${errors.age ? 'border-destructive' : ''}`} />
                {errors.age && <p className="text-xs text-destructive">{errors.age.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="bg-background border-border">
                        <SelectValue />
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
                {errors.height && <p className="text-xs text-destructive">{errors.height.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Weight (kg)</Label>
                <Input type="number" {...register('weight')} className={`bg-background border-border ${errors.weight ? 'border-destructive' : ''}`} />
                {errors.weight && <p className="text-xs text-destructive">{errors.weight.message}</p>}
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Address</Label>
                <Textarea {...register('address')} className="bg-background border-border resize-none" rows={2} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Medical Conditions / History</Label>
                <Textarea {...register('medical')} className="bg-background border-border resize-none" rows={2} />
              </div>
              <div className="space-y-2">
                <Label>Emergency Contact Name</Label>
                <Input {...register('emergency_name')} className="bg-background border-border" />
              </div>
              <div className="space-y-2">
                <Label>Emergency Contact Phone</Label>
                <Input {...register('emergency_phone')} className="bg-background border-border" />
              </div>
            </div>
            <div className="flex justify-end pt-6 border-t border-border mt-6">
              <Button type="submit" disabled={saving} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold min-w-[120px]">
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
