import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Trash2, UserCircle2, Loader2, Star, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'

export function TestimonialsManager() {
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({ name: '', ig_handle: '', rating: 5, review: '' })
  const [showAdd, setShowAdd] = useState(false)

  useEffect(() => {
    fetchApproved()
  }, [])

  const fetchApproved = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })

      if (error) throw error
      setTestimonials(data || [])
    } catch (err) {
      console.error(err)
      toast.error('Failed to load testimonials.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) return
    try {
      await supabase.from('testimonials').delete().eq('id', id)
      toast.success('Testimonial deleted.')
      setTestimonials(p => p.filter(t => t.id !== id))
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete.')
    }
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.review) {
      toast.error('Name and Review are required.')
      return
    }
    setSubmitting(true)
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .insert([{
          name: formData.name,
          ig_handle: formData.ig_handle,
          rating: formData.rating,
          review: formData.review,
          status: 'approved',
          is_admin_created: true
        }])
        .select()

      if (error) throw error
      
      toast.success('Testimonial created successfully!')
      setTestimonials(p => [data[0], ...p])
      setFormData({ name: '', ig_handle: '', rating: 5, review: '' })
      setShowAdd(false)
    } catch (err) {
      console.error(err)
      toast.error('Failed to create testimonial.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Manage Testimonials</h1>
          <p className="text-muted-foreground mt-2">View approved testimonials or manually add new ones.</p>
        </div>
        <Button onClick={() => setShowAdd(!showAdd)} className="gap-2">
          {showAdd ? 'Cancel' : <><Plus className="w-4 h-4" /> Add Testimonial</>}
        </Button>
      </div>

      {showAdd && (
        <Card className="bg-card border-primary/20">
          <CardHeader>
            <CardTitle>Add New Testimonial</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input required value={formData.name} onChange={e => setFormData(p => ({...p, name: e.target.value}))} placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <Label>IG Handle</Label>
                  <Input value={formData.ig_handle} onChange={e => setFormData(p => ({...p, ig_handle: e.target.value}))} placeholder="john.doe" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Rating (1-5) *</Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData(p => ({...p, rating: star}))}
                      className="focus:outline-none"
                    >
                      <Star className={`w-8 h-8 ${star <= formData.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Review *</Label>
                <Textarea required value={formData.review} onChange={e => setFormData(p => ({...p, review: e.target.value}))} placeholder="Write the review here..." className="min-h-[100px]" />
              </div>
              <Button type="submit" disabled={submitting} className="w-full md:w-auto">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : 'Save Testimonial'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {testimonials.length === 0 && !showAdd && (
          <p className="text-muted-foreground col-span-2">No approved testimonials found.</p>
        )}
        {testimonials.map(t => (
          <Card key={t.id} className="bg-card">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  {t.photo_url ? (
                    <img src={t.photo_url} alt="User" className="w-10 h-10 rounded-full object-cover border border-border" />
                  ) : (
                    <UserCircle2 className="w-10 h-10 text-muted-foreground" />
                  )}
                  <div>
                    <CardTitle className="text-lg">{t.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{t.ig_handle ? `@${t.ig_handle}` : 'No IG provided'}</p>
                  </div>
                </div>
                <Button onClick={() => handleDelete(t.id)} variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < t.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'}`} />
                ))}
              </div>
              <p className="text-sm italic border-l-2 border-primary/50 pl-3">"{t.review}"</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
