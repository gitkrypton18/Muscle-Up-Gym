import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Star, MessageSquareQuote, Send, UserCircle2, UploadCloud, AtSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'

const fallbackTestimonials = [
  { name: 'Rahul Sharma', rating: 5, review: 'Best gym in the city! The vibe is unmatched and Raju Bhai always pushes you to your limits. Completely transformed my physique in 6 months.', created_at: new Date('2025-10-12').toISOString() },
  { name: 'Amit Kumar', rating: 5, review: 'Pankaj bhai\'s diet plans are magical. Combined with the hardcore equipment here, you are guaranteed to see results. The community is like a family.', created_at: new Date('2025-11-05').toISOString() },
  { name: 'Neha Singh', rating: 4, review: 'Very supportive trainers and a clean environment. The new equipment is top-notch. Highly recommend for both beginners and pros.', created_at: new Date('2025-12-22').toISOString() },
  { name: 'Vikas Verma', rating: 5, review: 'God level gym! The trips they organize are epic. It is not just about lifting weights, it is about building a lifestyle.', created_at: new Date('2026-01-15').toISOString() }
]

export function TestimonialsPage() {
  const [formData, setFormData] = useState({ name: '', ig_handle: '', rating: 5, review: '' })
  const [photoFile, setPhotoFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading] = useState(true)
  const fileInputRef = useRef(null)

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const fetchTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching testimonials:', error)
        setTestimonials(fallbackTestimonials)
      } else {
        if (data && data.length > 0) {
          setTestimonials(data)
        } else {
          setTestimonials(fallbackTestimonials)
        }
      }
    } catch (err) {
      setTestimonials(fallbackTestimonials)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.review) {
      toast.error('Please provide at least your name and a review.')
      return
    }
    
    setSubmitting(true)
    let photo_url = null

    try {
      // 1. Upload photo if exists
      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `testimonials/${fileName}`

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('community_media')
          .upload(filePath, photoFile)

        if (uploadError) {
          console.error('Upload Error:', uploadError)
          toast.error('Could not upload photo. Is the storage bucket configured?')
          // We will continue without the photo
        } else {
          const { data: publicUrlData } = supabase.storage
            .from('community_media')
            .getPublicUrl(filePath)
          photo_url = publicUrlData.publicUrl
        }
      }

      // 2. Insert into database
      const { error: insertError } = await supabase
        .from('testimonials')
        .insert([{
          name: formData.name,
          ig_handle: formData.ig_handle,
          rating: formData.rating,
          review: formData.review,
          photo_url: photo_url,
          status: 'approved' 
        }])

      if (insertError) throw insertError

      toast.success('Review submitted successfully! It is now live.', { duration: 5000 })
      
      // Reset form
      setFormData({ name: '', ig_handle: '', rating: 5, review: '' })
      setPhotoFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''

    } catch (error) {
      console.error('Submission Error:', error)
      toast.error('Failed to submit review. Make sure the database is configured.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-20 bg-background relative overflow-hidden">
      {/* Dynamic Backgrounds */}
      <div className="absolute top-1/4 left-0 w-[600px] h-[600px] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto mb-20">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-bold text-sm mb-6 border border-primary/20"
          >
            <MessageSquareQuote className="w-4 h-4" />
            <span>Success Stories</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30, rotateX: -20 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ delay: 0.1, duration: 0.8, type: "spring" }}
            className="text-5xl md:text-7xl font-black mb-8 drop-shadow-lg"
          >
            What Our <span className="text-primary">Family</span> Says
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-xl md:text-2xl text-muted-foreground leading-relaxed"
          >
            Real results from real people. Hear from the community that makes Muscle Up Gym the best.
          </motion.p>
        </div>

        {/* Masonry/Grid of Reviews */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24 max-w-6xl mx-auto">
          {testimonials.map((t, idx) => (
            <motion.div
              key={t.id || idx}
              initial={{ opacity: 0, scale: 0.8, rotate: idx % 2 === 0 ? -2 : 2 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: idx * 0.1, duration: 0.7, type: "spring", bounce: 0.4 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-card/50 backdrop-blur-md border border-border/50 p-8 rounded-3xl shadow-xl hover:shadow-primary/20 hover:border-primary/50 transition-all relative group"
            >
              <MessageSquareQuote className="absolute top-6 right-6 w-12 h-12 text-primary/10 group-hover:text-primary/20 transition-colors" />
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-primary/20 w-16 h-16 rounded-full flex items-center justify-center overflow-hidden border-2 border-primary/30">
                  {t.photo_url ? (
                    <img src={t.photo_url} alt={t.name} className="w-full h-full object-cover" />
                  ) : (
                    <UserCircle2 className="w-10 h-10 text-primary" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{t.name}</h3>
                  {t.ig_handle && (
                    <a href={`https://instagram.com/${t.ig_handle.replace('@', '')}`} target="_blank" rel="noreferrer" className="text-primary/80 hover:text-primary text-sm flex items-center gap-1 mt-0.5">
                      <AtSign className="w-3 h-3" /> {t.ig_handle.replace('@', '')}
                    </a>
                  )}
                  <div className="flex gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < t.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'}`} />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground text-lg italic leading-relaxed relative z-10">
                "{t.review}"
              </p>
              <p className="text-sm text-muted-foreground/60 mt-6 font-medium">
                {new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Submit Review Form */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto bg-card border border-primary/20 p-8 md:p-12 rounded-[3rem] shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-bl-full pointer-events-none" />
          <div className="text-center mb-10 relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Leave Your Mark</h2>
            <p className="text-muted-foreground text-lg">Tell the world about your transformation.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-lg">Your Name *</Label>
                <Input 
                  id="name"
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData(p => ({...p, name: e.target.value}))}
                  className="bg-background/50 h-14 text-lg rounded-2xl"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ig" className="text-lg">Instagram Handle</Label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <AtSign className="w-5 h-5" />
                  </div>
                  <Input 
                    id="ig"
                    placeholder="muscleup.1"
                    value={formData.ig_handle}
                    onChange={(e) => setFormData(p => ({...p, ig_handle: e.target.value}))}
                    className="bg-background/50 h-14 text-lg pl-12 rounded-2xl"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-lg">Rating *</Label>
                <div className="flex gap-2 h-14 items-center bg-background/50 px-4 rounded-2xl border border-input">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData(p => ({...p, rating: star}))}
                      className="focus:outline-none transition-transform hover:scale-125"
                    >
                      <Star className={`w-8 h-8 ${star <= formData.rating ? 'text-yellow-500 fill-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]' : 'text-gray-600'}`} />
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-lg">Upload Photo (Optional)</Label>
                <div className="relative h-14 bg-background/50 border border-input rounded-2xl flex items-center px-4 hover:border-primary/50 transition-colors">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => setPhotoFile(e.target.files[0])}
                    ref={fileInputRef}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <UploadCloud className="w-6 h-6 text-muted-foreground mr-3" />
                  <span className="text-muted-foreground truncate">
                    {photoFile ? photoFile.name : 'Choose an image file...'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="review" className="text-lg">Your Review *</Label>
              <Textarea 
                id="review"
                placeholder="Share your experience..."
                value={formData.review}
                onChange={(e) => setFormData(p => ({...p, review: e.target.value}))}
                className="bg-background/50 min-h-[150px] text-lg rounded-2xl resize-none"
                required
              />
            </div>

            <Button type="submit" disabled={submitting} className="w-full h-16 text-xl font-bold rounded-2xl bg-primary hover:bg-primary/90 shadow-[0_0_20px_rgba(234,88,12,0.3)] transition-all hover:shadow-[0_0_30px_rgba(234,88,12,0.5)] hover:-translate-y-1">
              {submitting ? 'Submitting...' : <><Send className="w-6 h-6 mr-3" /> Submit Review</>}
            </Button>
            <p className="text-center text-sm text-muted-foreground mt-2">
              Note: Your review will be publicly visible immediately.
            </p>
          </form>
        </motion.div>

      </div>
    </div>
  )
}
