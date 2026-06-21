import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, X, Image as ImageIcon, Video, UserCircle2, Loader2, Star, Upload } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'

const Instagram = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
  </svg>
)

export function ApprovalsPage() {
  const [testimonials, setTestimonials] = useState([])
  const [media, setMedia] = useState([])
  const [loading, setLoading] = useState(true)

  const [uploading, setUploading] = useState(false)
  const [mediaFile, setMediaFile] = useState(null)
  const fileInputRef = useRef(null)

  const [uploadType, setUploadType] = useState('file') // 'file' | 'instagram'
  const [igUrl, setIgUrl] = useState('')

  const handleOfficialUpload = async (e) => {
    e.preventDefault()

    if (uploadType === 'instagram') {
      if (!igUrl) {
        toast.error('Please paste an Instagram link.')
        return
      }
      setUploading(true)
      try {
        const { error: insertError } = await supabase
          .from('community_media')
          .insert([{
            uploader_name: 'Official',
            ig_handle: 'muscleup.1',
            media_type: 'instagram',
            url: igUrl,
            status: 'approved'
          }])

        if (insertError) throw insertError
        toast.success('Instagram reel published successfully!')
        setIgUrl('')
      } catch (err) {
        console.error(err)
        toast.error('Failed to save Instagram link.')
      } finally {
        setUploading(false)
      }
      return
    }

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
            Add Official Content
          </CardTitle>
          <div className="flex gap-4 mt-4">
            <button type="button" onClick={() => setUploadType('file')} className={`text-sm font-bold pb-1 border-b-2 transition-all ${uploadType === 'file' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>Upload File</button>
            <button type="button" onClick={() => setUploadType('instagram')} className={`text-sm font-bold pb-1 border-b-2 transition-all ${uploadType === 'instagram' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>Paste Instagram Link</button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleOfficialUpload} className="flex flex-col md:flex-row items-end gap-6">
            <div className="flex-1 space-y-2 w-full">
              {uploadType === 'file' ? (
                <>
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
                </>
              ) : (
                <>
                  <Label>Instagram Reel Link</Label>
                  <Input 
                    placeholder="https://www.instagram.com/reel/..." 
                    value={igUrl} 
                    onChange={e => setIgUrl(e.target.value)} 
                    className="bg-background h-14"
                  />
                </>
              )}
            </div>
            <Button type="submit" disabled={uploading} className="h-14 px-8 font-bold w-full md:w-auto">
              {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Publish to Gallery'}
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
                <div className="aspect-square bg-muted relative flex items-center justify-center p-2">
                  {m.media_type === 'video' ? (
                    <video src={m.url} className="w-full h-full object-cover rounded-md" controls />
                  ) : m.media_type === 'instagram' ? (
                    <div className="w-full h-full bg-secondary/30 rounded-md flex flex-col items-center justify-center text-center p-4">
                      <Instagram className="w-8 h-8 text-pink-500 mb-2" />
                      <p className="text-xs text-muted-foreground break-all">{m.url}</p>
                    </div>
                  ) : (
                    <img src={m.url} alt="Upload" className="w-full h-full object-cover rounded-md" />
                  )}
                  <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-xs text-white font-medium flex items-center gap-1">
                    {m.media_type === 'video' ? <Video className="w-3 h-3" /> : m.media_type === 'instagram' ? <Instagram className="w-3 h-3 text-pink-500" /> : <ImageIcon className="w-3 h-3" />}
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

