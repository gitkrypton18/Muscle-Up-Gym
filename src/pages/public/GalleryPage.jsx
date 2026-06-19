import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Upload, X, Loader2, Image as ImageIcon, Video, AtSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'

const fallbackImages = [
  '/assets/images/SaveClip.App_623842267_18073333688117521_5819781928970786734_n.jpg',
  '/assets/images/SaveClip.App_626803963_18183544633366717_4837534250355868249_n.jpg',
  '/assets/images/SaveClip.App_649222532_17903139405384455_4106029166490521891_n.jpg',
  '/assets/images/SaveClip.App_653858963_17964573957022537_2839338754343810393_n.jpg',
]
const fallbackVideos = [
  '/assets/videos/trip/SaveClip.App_AQMlUc-tjTvLlNj8e1ffKFz2KJoydrwR6Hv3ATnN8vy5pdWujhXnJBebcUVUI86faYu7A4nXKx740l0eLGTdv0TxI4zQluhdQxPrODg.mp4',
  '/assets/videos/trip/SaveClip.App_AQMzkL1_-QVKPC3KbqT7NwzZ3keHwGa-ORsX66eWYW2T3BPbITE4H1zSz4E2vtx7XM7vxrYZHAczLH27HBPcIMeousRDn-ffxWwFq7I.mp4',
  '/assets/videos/gym/SaveClip.App_AQPOZ667nwSQW6Nay30PugR7clxmguitE6vUXc3zE4i5JZ7vgyt96C_4f9gmLIZ-mSQC1DDEdl_WJ8KDssF0uj-EYw1vBq-dUdU_5Mo.mp4',
]

export function GalleryPage() {
  const [images, setImages] = useState(fallbackImages)
  const [videos, setVideos] = useState(fallbackVideos)
  const [loading, setLoading] = useState(true)

  // Upload Modal State
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({ name: '', ig_handle: '' })
  const [mediaFile, setMediaFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    fetchMedia()
  }, [])

  const fetchMedia = async () => {
    try {
      const { data, error } = await supabase
        .from('community_media')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })

      if (error) {
        console.error(error)
        return
      }
      
      if (data && data.length > 0) {
        const dynamicImages = data.filter(m => m.media_type === 'image').map(m => m.url)
        const dynamicVideos = data.filter(m => m.media_type === 'video').map(m => m.url)
        
        if (dynamicImages.length > 0) setImages([...dynamicImages, ...fallbackImages])
        if (dynamicVideos.length > 0) setVideos([...dynamicVideos, ...fallbackVideos])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleUploadSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !mediaFile) {
      toast.error('Please provide your name and a file to upload.')
      return
    }

    setUploading(true)
    try {
      const isVideo = mediaFile.type.startsWith('video/')
      const media_type = isVideo ? 'video' : 'image'
      
      const fileExt = mediaFile.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `gallery/${fileName}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('community_media')
        .upload(filePath, mediaFile)

      if (uploadError) {
        console.error('Storage error:', uploadError)
        toast.error('Storage bucket is not configured. Upload failed.')
        setUploading(false)
        return
      }

      const { data: publicUrlData } = supabase.storage
        .from('community_media')
        .getPublicUrl(filePath)
        
      const fileUrl = publicUrlData.publicUrl

      const { error: insertError } = await supabase
        .from('community_media')
        .insert([{
          uploader_name: formData.name,
          ig_handle: formData.ig_handle,
          media_type,
          url: fileUrl,
          status: 'pending'
        }])

      if (insertError) throw insertError

      toast.success('Awesome! Your media is pending admin approval.', { duration: 5000 })
      setShowModal(false)
      setFormData({ name: '', ig_handle: '' })
      setMediaFile(null)

    } catch (error) {
      console.error(error)
      toast.error('Failed to submit media. Ensure the database is setup.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-12 bg-background relative">
      <div className="container mx-auto px-4 relative z-10">
        
        <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-6">
          <div className="text-center md:text-left">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-extrabold mb-4"
            >
              Our <span className="text-primary">Gallery</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-muted-foreground max-w-2xl"
            >
              Glimpses of our intense workouts, amazing community, and epic gym trips.
            </motion.p>
          </div>

          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
            <Button onClick={() => setShowModal(true)} size="lg" className="h-14 px-8 rounded-full text-lg font-bold bg-primary hover:bg-primary/90 shadow-[0_0_15px_rgba(234,88,12,0.4)]">
              <Upload className="w-5 h-5 mr-2" /> Upload Your Vibe
            </Button>
          </motion.div>
        </div>

        {/* Photos Section */}
        <div className="mb-24">
          <h2 className="text-3xl font-bold mb-8 border-l-4 border-primary pl-4">Community Photos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((src, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: (index % 4) * 0.1 }}
                className="relative group overflow-hidden rounded-2xl aspect-square bg-muted"
              >
                <img 
                  src={src} 
                  alt={`Gym ${index}`} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <span className="text-white font-bold text-sm shadow-black drop-shadow-md">Muscle Up Fam</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Gym & Trip Reels Section */}
        <div>
          <h2 className="text-3xl md:text-5xl font-black mb-12 border-l-8 border-primary pl-6 drop-shadow-md">Muscle Up <span className="text-primary">Reels</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {videos.map((src, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: index * 0.1, duration: 0.6, type: "spring" }}
                whileHover={{ y: -10, scale: 1.05 }}
                className="bg-card rounded-[2rem] overflow-hidden border border-border/50 shadow-2xl relative group cursor-pointer aspect-[9/16]"
              >
                <div className="absolute inset-0 bg-black flex items-center justify-center">
                  <video 
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                  >
                    <source src={src} type="video/mp4" />
                  </video>
                </div>
                
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80 pointer-events-none" />
                
                <div className="absolute bottom-6 left-4 right-4 pointer-events-none">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center border-2 border-white">
                      <Play className="w-3 h-3 text-white fill-white" />
                    </div>
                    <span className="font-bold text-white shadow-black drop-shadow-md">@muscleup.1</span>
                  </div>
                  <p className="text-sm text-white/90 font-medium line-clamp-2 drop-shadow-md">
                    Community submission. Hardcore vibes! 🔥
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-card w-full max-w-md rounded-3xl p-6 relative border border-border shadow-2xl"
            >
              <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-secondary text-muted-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
              
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                  <Upload className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold">Upload Your Vibe</h3>
                <p className="text-sm text-muted-foreground">Share your gym moments with the fam.</p>
              </div>

              <form onSubmit={handleUploadSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Your Name *</Label>
                  <Input required value={formData.name} onChange={e => setFormData(p => ({...p, name: e.target.value}))} className="bg-background/50 h-12" placeholder="John Doe" />
                </div>
                <div className="space-y-1.5">
                  <Label>Instagram Handle</Label>
                  <div className="relative">
                    <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input value={formData.ig_handle} onChange={e => setFormData(p => ({...p, ig_handle: e.target.value}))} className="bg-background/50 h-12 pl-10" placeholder="muscleup.1" />
                  </div>
                </div>
                
                <div className="space-y-1.5 pt-2">
                  <Label>Photo or Video File *</Label>
                  <div className="relative h-32 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center bg-background/30 hover:bg-background/60 hover:border-primary/50 transition-colors cursor-pointer overflow-hidden">
                    <input 
                      type="file" 
                      accept="image/*,video/*" 
                      required
                      onChange={(e) => setMediaFile(e.target.files[0])}
                      ref={fileInputRef}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    {mediaFile ? (
                      <div className="text-center p-4">
                        {mediaFile.type.startsWith('video') ? <Video className="w-8 h-8 text-primary mx-auto mb-2" /> : <ImageIcon className="w-8 h-8 text-primary mx-auto mb-2" />}
                        <p className="text-sm font-medium text-foreground truncate max-w-[200px]">{mediaFile.name}</p>
                      </div>
                    ) : (
                      <div className="text-center p-4 text-muted-foreground pointer-events-none">
                        <Upload className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm font-medium">Click to select or drag and drop</p>
                        <p className="text-xs mt-1 opacity-70">Images and MP4 Videos supported</p>
                      </div>
                    )}
                  </div>
                </div>

                <Button type="submit" disabled={uploading} className="w-full h-12 font-bold mt-4">
                  {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit for Review'}
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
