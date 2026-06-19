import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, X, Image as ImageIcon, Video, UserCircle2, Loader2, Star } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'

export function ApprovalsPage() {
  const [testimonials, setTestimonials] = useState([])
  const [media, setMedia] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPending()
  }, [])

  const fetchPending = async () => {
    setLoading(true)
    try {
      const [testRes, mediaRes] = await Promise.all([
        supabase.from('testimonials').select('*').eq('status', 'pending').order('created_at', { ascending: false }),
        supabase.from('community_media').select('*').eq('status', 'pending').order('created_at', { ascending: false })
      ])

      if (testRes.error) console.error('Testimonials error:', testRes.error)
      else setTestimonials(testRes.data || [])

      if (mediaRes.error) console.error('Media error:', mediaRes.error)
      else setMedia(mediaRes.data || [])

    } catch (err) {
      console.error(err)
      toast.error('Failed to load pending approvals. Is the database setup?')
    } finally {
      setLoading(false)
    }
  }

  const handleTestimonialAction = async (id, action) => {
    try {
      if (action === 'approved') {
        await supabase.from('testimonials').update({ status: 'approved' }).eq('id', id)
        toast.success('Testimonial Approved! It is now live.')
      } else {
        await supabase.from('testimonials').delete().eq('id', id)
        toast.success('Testimonial Rejected & Deleted.')
      }
      setTestimonials(p => p.filter(t => t.id !== id))
    } catch (err) {
      console.error(err)
      toast.error('Action failed.')
    }
  }

  const handleMediaAction = async (item, action) => {
    try {
      if (action === 'approved') {
        await supabase.from('community_media').update({ status: 'approved' }).eq('id', item.id)
        toast.success('Media Approved! It is now live.')
      } else {
        // Also delete from storage if possible, for simplicity we just delete the row
        await supabase.from('community_media').delete().eq('id', item.id)
        toast.success('Media Rejected & Deleted.')
      }
      setMedia(p => p.filter(m => m.id !== item.id))
    } catch (err) {
      console.error(err)
      toast.error('Action failed.')
    }
  }

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Community Approvals</h1>
        <p className="text-muted-foreground mt-2">Approve or reject community submitted testimonials and gallery media.</p>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold border-b border-border pb-2">Pending Testimonials ({testimonials.length})</h2>
        {testimonials.length === 0 ? (
          <p className="text-muted-foreground">No pending testimonials.</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                    <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Pending</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < t.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'}`} />
                    ))}
                  </div>
                  <p className="text-sm italic border-l-2 border-primary/50 pl-3">"{t.review}"</p>
                  <div className="flex gap-2 pt-2">
                    <Button onClick={() => handleTestimonialAction(t.id, 'approved')} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                      <Check className="w-4 h-4 mr-2" /> Approve
                    </Button>
                    <Button onClick={() => handleTestimonialAction(t.id, 'rejected')} variant="destructive" className="flex-1">
                      <X className="w-4 h-4 mr-2" /> Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-6 pt-6 border-t border-border">
        <h2 className="text-2xl font-bold border-b border-border pb-2">Pending Gallery Media ({media.length})</h2>
        {media.length === 0 ? (
          <p className="text-muted-foreground">No pending media uploads.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {media.map(m => (
              <Card key={m.id} className="bg-card overflow-hidden">
                <div className="aspect-square bg-muted relative flex items-center justify-center">
                  {m.media_type === 'video' ? (
                    <video src={m.url} className="w-full h-full object-cover" controls />
                  ) : (
                    <img src={m.url} alt="Upload" className="w-full h-full object-cover" />
                  )}
                  <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-xs text-white font-medium flex items-center gap-1">
                    {m.media_type === 'video' ? <Video className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                    {m.media_type.toUpperCase()}
                  </div>
                </div>
                <CardContent className="p-4 space-y-4">
                  <div>
                    <p className="font-bold">{m.uploader_name}</p>
                    <p className="text-sm text-muted-foreground">{m.ig_handle ? `@${m.ig_handle}` : 'No IG provided'}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleMediaAction(m, 'approved')} className="flex-1 bg-green-600 hover:bg-green-700 text-white" size="sm">
                      <Check className="w-4 h-4 mr-1" /> Approve
                    </Button>
                    <Button onClick={() => handleMediaAction(m, 'rejected')} variant="destructive" size="sm" className="flex-1">
                      <X className="w-4 h-4 mr-1" /> Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
