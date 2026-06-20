import { useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Phone, Clock, Loader2, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useLeads } from '@/hooks/useLeads'
import { useLocation } from 'react-router-dom'
import { useGymSettings } from '@/hooks/useGymSettings'

export function EnquiryPage() {
  const { addLead } = useLeads()
  const location = useLocation()
  const { gymDetails } = useGymSettings()
  
  const params = new URLSearchParams(location.search)
  const plan = params.get('plan')

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    message: plan ? `I am interested in the ${plan} plan.` : ''
  })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.phone) {
      toast.error('Name and Phone are required')
      return
    }

    setSubmitting(true)
    // Assuming addLead just inserts it into the DB and returns { error }
    const { error } = await addLead(formData)
    setSubmitting(false)

    if (error) {
      toast.error(error.message || 'Failed to submit enquiry')
    } else {
      toast.success('Enquiry submitted! We will contact you soon.')
      setFormData({ name: '', phone: '', message: '' })
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-extrabold mb-6"
          >
            Let's Get In <span className="text-primary">Touch</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-muted-foreground"
          >
            Have a question or want to join? Fill out the form below or contact us directly.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Information */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            <div className="bg-card border border-border p-8 rounded-3xl shadow-sm">
              <h3 className="text-2xl font-bold mb-6">Contact Details</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/20 p-3 rounded-xl mt-1">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">Call Us Directly</h4>
                    <p className="text-muted-foreground mt-1">Pankaj Nagar: <a href={`tel:${gymDetails.phone}`} className="text-foreground hover:text-primary transition-colors">{gymDetails.phone}</a></p>
                    <p className="text-muted-foreground">Irfan Mirza: <a href={`tel:${gymDetails.phone2}`} className="text-foreground hover:text-primary transition-colors">{gymDetails.phone2}</a></p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-primary/20 p-3 rounded-xl mt-1">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">Location</h4>
                    <p className="text-muted-foreground mt-1 whitespace-pre-wrap">
                      {gymDetails.address}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-primary/20 p-3 rounded-xl mt-1">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">Opening Hours</h4>
                    <p className="text-muted-foreground mt-1 whitespace-pre-wrap">{gymDetails.timings}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Enquiry Form */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="bg-card border border-border p-8 rounded-3xl shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-full pointer-events-none" />
              <h3 className="text-2xl font-bold mb-6 relative z-10">Send an Enquiry</h3>
              
              <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input 
                    id="name"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) => setFormData(p => ({...p, name: e.target.value}))}
                    className="bg-background/50 h-12"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input 
                    id="phone"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={(e) => setFormData(p => ({...p, phone: e.target.value}))}
                    className="bg-background/50 h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message / Plan Interest</Label>
                  <Textarea 
                    id="message"
                    placeholder="Tell us what you're looking for..."
                    value={formData.message}
                    onChange={(e) => setFormData(p => ({...p, message: e.target.value}))}
                    className="bg-background/50 min-h-[120px] resize-none"
                  />
                </div>

                <Button type="submit" disabled={submitting} className="w-full h-12 text-lg font-semibold bg-primary hover:bg-primary/90">
                  {submitting ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    <Send className="w-5 h-5 mr-2" />
                  )}
                  {submitting ? 'Sending...' : 'Submit Enquiry'}
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-4">
                  By submitting this form, you agree to be contacted by our team.
                </p>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
