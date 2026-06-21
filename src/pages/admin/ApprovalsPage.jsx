import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, X, Image as ImageIcon, Video, UserCircle2, Loader2, Star, Upload } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'

export function ApprovalsPage() {
  const [testimonials, setTestimonials] = useState([])
  const [media, setMedia] = useState([])
  const [loading, setLoading] = useState(true)

  const [uploading, setUploading] = useState(false)
  const [mediaFile, setMediaFile] = useState(null)
  const fileInputRef = useRef(null)

  const handleOfficialUpload = async (e) => {
    e.preventDefault()
    if (!mediaFile) {
      toast.error('Please select a file to upload.')
      return
    }

    setUploading(true)
    try {
      if (!mediaFile.type.startsWith('image/') && !mediaFile.type.startsWith('video/')) {
        toast.error('Only image and video files are allowed.')
        setUploading(false)
        return
      }
      if (mediaFile.size > 50 * 1024 * 1024) {
        toast.error('File size must be less than 50MB.')
        setUploading(false)
        return
      }
      
      const isVideo = mediaFile.type.startsWith('video/')
      const media_type = isVideo ? 'video' : 'image'
      
      const fileExt = mediaFile.name.split('.').pop()
      const fileName = `official-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `gallery/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('community_media')
        .upload(filePath, mediaFile)

      if (uploadError) {
        console.error('Storage error:', uploadError)
        toast.error('Storage upload failed.')
        setUploading(false)
        return
      }

      const { data: publicUrlData } = supabase.storage
        .from('community_media')
        .getPublicUrl(filePath)
        
      const fileUrl = publicUrlData.publicUrl

      const { data: inserted, error: insertError } = await supabase
        .from('community_media')
        .insert([{
          uploader_name: 'Official',
          ig_handle: 'muscleup.1',
          media_type,
          url: fileUrl,
          status: 'pending'
        }])
        .select()

      if (insertError) throw insertError

      if (inserted && inserted[0]) {
        const { error: updateError } = await supabase
          .from('community_media')
          .update({ status: 'approved' })
          .eq('id', inserted[0].id)

        if (updateError) throw updateError
      }

      toast.success('Official media uploaded and published successfully!')
      setMediaFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''

    } catch (err) {
      console.error(err)
      toast.error('Failed to upload official media.')
    } finally {
      setUploading(false)
    }
  }

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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPending()
  }, [])

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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Community Approvals & Media</h1>
          <p className="text-muted-foreground mt-2">Approve or reject community submitted testimonials and gallery media, or upload official content.</p>
        </div>
      </div>

      {/* Official Media Upload Section */}
      <Card className="bg-card border-border/80 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            Upload Official Media
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleOfficialUpload} className="flex flex-col md:flex-row items-end gap-6">
            <div className="flex-1 space-y-2 w-full">
              <Label>Select Photo or Video</Label>
              <div className="relative border border-dashed border-border rounded-xl p-4 flex flex-col items-center justify-center bg-background/50 hover:bg-background/80 transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => setMediaFile(e.target.files[0])}
                  ref={fileInputRef}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {mediaFile ? (
                  <p className="text-sm font-medium text-primary">{mediaFile.name}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">Click to select a file (Image or MP4 Video)</p>
                )}
              </div>
            </div>
            <Button type="submit" disabled={uploading} className="h-14 px-8 font-bold w-full md:w-auto">
              {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Upload & Publish'}
            </Button>
          </form>
        </CardContent>
      </Card>

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
