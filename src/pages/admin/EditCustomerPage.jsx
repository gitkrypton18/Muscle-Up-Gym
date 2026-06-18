import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Save, Loader2, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { useCustomers } from '@/hooks/useCustomers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'

export function EditCustomerPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { fetchCustomerById, updateCustomer } = useCustomers()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState(null)

  useEffect(() => {
    async function loadData() {
      const data = await fetchCustomerById(id)
      if (data) {
        setFormData({
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
  }, [id, fetchCustomerById])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.phone) {
      toast.error('Name and Phone are required')
      return
    }

    setSaving(true)
    const { error } = await updateCustomer(id, {
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

    setSaving(false)
    if (error) {
      toast.error(error.message || 'Failed to update customer')
    } else {
      toast.success('Customer updated successfully')
      navigate(`/admin/customers/${id}`)
    }
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
  if (!formData) return <div className="text-center py-12">Customer not found.</div>

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Profile
      </Button>

      <Card className="bg-card border-border">
        <CardContent className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input name="name" value={formData.name} onChange={handleChange} className="bg-background border-border" />
            </div>
            <div className="space-y-2">
              <Label>Phone Number *</Label>
              <Input name="phone" value={formData.phone} onChange={handleChange} className="bg-background border-border" />
            </div>
            <div className="space-y-2">
              <Label>WhatsApp Number</Label>
              <Input name="whatsapp" value={formData.whatsapp} onChange={handleChange} className="bg-background border-border" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input name="email" type="email" value={formData.email} onChange={handleChange} className="bg-background border-border" />
            </div>
            <div className="space-y-2">
              <Label>Age</Label>
              <Input name="age" type="number" value={formData.age} onChange={handleChange} className="bg-background border-border" />
            </div>
            <div className="space-y-2">
              <Label>Gender</Label>
              <Select value={formData.gender} onValueChange={(v) => setFormData(p => ({...p, gender: v}))}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue />
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
              <Textarea name="medical" value={formData.medical} onChange={handleChange} className="bg-background border-border resize-none" rows={2} />
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
          <div className="flex justify-end pt-6 border-t border-border mt-6">
            <Button onClick={handleSubmit} disabled={saving} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold min-w-[120px]">
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
