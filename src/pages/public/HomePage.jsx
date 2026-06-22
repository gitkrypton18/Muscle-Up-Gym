import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Dumbbell, Users, Trophy, Target, ChevronLeft, ChevronRight, Play, Upload, X, Loader2, Image as ImageIcon, Video, AtSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'


const fallbackImages = [
  { url: '/assets/images/SaveClip.App_623842267_18073333688117521_5819781928970786734_n.jpg', uploader_name: 'Official', media_type: 'image', category: 'general', ig_handle: 'muscleup.1' },
  { url: '/assets/images/SaveClip.App_626803963_18183544633366717_4837534250355868249_n.jpg', uploader_name: 'Official', media_type: 'image', category: 'general', ig_handle: 'muscleup.1' },
  { url: '/assets/images/SaveClip.App_649222532_17903139405384455_4106029166490521891_n.jpg', uploader_name: 'Official', media_type: 'image', category: 'general', ig_handle: 'muscleup.1' },
  { url: '/assets/images/SaveClip.App_653858963_17964573957022537_2839338754343810393_n.jpg', uploader_name: 'Official', media_type: 'image', category: 'general', ig_handle: 'muscleup.1' },
  { url: '/assets/images/SaveClip.App_655198488_18116354113645365_5737051318748731806_n.jpg', uploader_name: 'Official', media_type: 'image', category: 'general', ig_handle: 'muscleup.1' },
  { url: '/assets/images/SaveClip.App_655238798_18102237650304609_811661863512581477_n.jpg', uploader_name: 'Official', media_type: 'image', category: 'general', ig_handle: 'muscleup.1' },
  { url: '/assets/images/SaveClip.App_655614549_18171361543398453_1062577139582213994_n.jpg', uploader_name: 'Official', media_type: 'image', category: 'general', ig_handle: 'muscleup.1' },
  { url: '/assets/images/SaveClip.App_657372565_18087772088249323_321275352817532260_n.jpg', uploader_name: 'Official', media_type: 'image', category: 'general', ig_handle: 'muscleup.1' },
  { url: '/assets/images/SaveClip.App_657386195_18068937389289410_3712540365567703324_n.jpg', uploader_name: 'Official', media_type: 'image', category: 'general', ig_handle: 'muscleup.1' },
  { url: '/assets/images/SaveClip.App_662274601_18120769123720791_2941504078796601949_n.jpg', uploader_name: 'Official', media_type: 'image', category: 'general', ig_handle: 'muscleup.1' }
]

const fallbackGymVideos = [
  { url: '/assets/videos/gym/gym-tbf3na.mp4', uploader_name: 'Official', media_type: 'video', category: 'gym', ig_handle: 'muscleup.1' },
  { url: '/assets/videos/gym/20250527_211701.mp4', uploader_name: 'Official', media_type: 'video', category: 'gym', ig_handle: 'muscleup.1' },
  { url: '/assets/videos/gym/20250527_211433.mp4', uploader_name: 'Official', media_type: 'video', category: 'gym', ig_handle: 'muscleup.1' }
]

const fallbackTripVideos = [
  { url: '/assets/videos/trip/trip-1s3tva.mp4', uploader_name: 'Official', media_type: 'video', category: 'trip', ig_handle: 'muscleup.1' },
  { url: '/assets/videos/trip/trip-87v9oc.mp4', uploader_name: 'Official', media_type: 'video', category: 'trip', ig_handle: 'muscleup.1' },
  { url: '/assets/videos/trip/trip-hyvqme.mp4', uploader_name: 'Official', media_type: 'video', category: 'trip', ig_handle: 'muscleup.1' }
]

const features = [
  {
    icon: <Dumbbell className="w-8 h-8 text-primary" />,
    title: 'Premium Equipment',
    description: 'State-of-the-art machines and free weights for all your fitness needs.'
  },
  {
    icon: <Users className="w-8 h-8 text-primary" />,
    title: 'Expert Trainers',
    description: 'Learn from the best. Raju Bhai and Pankaj Bhai are here to guide you.'
  },
  {
    icon: <Trophy className="w-8 h-8 text-primary" />,
    title: 'Proven Results',
    description: 'Join hundreds of members who have transformed their lives with us.'
  },
  {
    icon: <Target className="w-8 h-8 text-primary" />,
    title: 'Personalized Plans',
    description: 'Custom workout and diet plans tailored specifically to your goals.'
  }
]

export function HomePage() {
  const [firstVideoEnded, setFirstVideoEnded] = useState(false)
  const [dbMedia, setDbMedia] = useState([])
  const [activeFilter, setActiveFilter] = useState('all') // 'all' | 'official' | 'community'

  // Upload Modal State
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({ name: '', ig_handle: '' })
  const [videoCategory, setVideoCategory] = useState('gym') // 'gym' | 'trip'
  const [mediaFile, setMediaFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)


  const gymVideosRef = useRef(null)
  const tripVideosRef = useRef(null)

  useEffect(() => {
    let active = true
    async function load() {
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
        
        if (!active) return
        if (data) setDbMedia(data)
      } catch (err) {
        console.error(err)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  const allMedia = [...dbMedia, ...fallbackImages, ...fallbackGymVideos, ...fallbackTripVideos]

  const filteredMedia = allMedia.filter(item => {
    if (activeFilter === 'official') {
      return item.uploader_name === 'Official'
    } else if (activeFilter === 'community') {
      return item.uploader_name !== 'Official'
    }
    return true
  })

  const filteredImages = filteredMedia.filter(item => item.media_type === 'image')
  const filteredGymVideos = filteredMedia.filter(item => item.media_type === 'video' && item.category === 'gym')
  const filteredTripVideos = filteredMedia.filter(item => item.media_type === 'video' && item.category === 'trip')

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
      const category = isVideo ? videoCategory : 'general'
      
      const fileExt = mediaFile.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `gallery/${fileName}`

      const { error: uploadError } = await supabase.storage
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
          category,
          status: 'pending'
        }])

      if (insertError) throw insertError

      toast.success('Awesome! Your media is pending admin approval.', { duration: 5000 })
      setShowModal(false)
      setFormData({ name: '', ig_handle: '' })
      setMediaFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''

    } catch (error) {
      console.error(error)
      toast.error('Failed to submit media. Ensure the database is setup.')
    } finally {
      setUploading(false)
    }
  }

  const scroll = (ref, direction) => {
    if (ref.current) {
      const scrollAmount = ref.current.clientWidth * 0.75
      ref.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Video Background Sequence */}
        <div className="absolute inset-0 z-0 bg-black">
          {/* First Video */}
          <video
            autoPlay
            muted
            playsInline
            onEnded={() => setFirstVideoEnded(true)}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${firstVideoEnded ? 'opacity-0' : 'opacity-100'}`}
          >
            <source src="/assets/videos/gym/gym-tbf3na.mp4" type="video/mp4" />
          </video>

          {/* Second Video (Loops) */}
          <video
            autoPlay
            loop
            muted
            playsInline
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ${firstVideoEnded ? 'opacity-80 blur-sm' : 'opacity-0'}`}
          >
            <source src="/assets/videos/gym/hero-bg.mp4" type="video/mp4" />
          </video>
          
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
          <div className="absolute inset-0 bg-black/30" />
        </div>

        {/* Hero Content */}
        <div className="container relative z-10 mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto space-y-6"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary font-medium text-sm mb-4 border border-primary/30"
            >
              <Dumbbell className="w-4 h-4" />
              <span>Welcome to the Elite Vibe</span>
            </motion.div>
            
            <motion.h1 
              initial={{ scale: 0.9, opacity: 0, rotateX: 20 }}
              animate={{ scale: 1, opacity: 1, rotateX: 0 }}
              transition={{ delay: 0.3, duration: 0.8, type: "spring" }}
              className="text-6xl md:text-8xl font-black tracking-tighter text-white drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]"
            >
              FORGE YOUR <span className="text-primary drop-shadow-[0_0_15px_rgba(234,88,12,0.5)]">LEGACY</span>
            </motion.h1>
            
            <p className="text-xl md:text-2xl text-gray-200 font-medium max-w-2xl mx-auto drop-shadow-xl mt-6">
              More than just a gym. Muscle Up Gym is a community dedicated to pushing boundaries and achieving greatness.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-10">
              <Button asChild size="lg" className="w-full sm:w-auto h-16 px-10 text-xl font-bold bg-primary hover:bg-primary/90 shadow-[0_0_20px_rgba(234,88,12,0.4)] hover:shadow-[0_0_30px_rgba(234,88,12,0.6)] transition-all hover:-translate-y-1 rounded-full">
                <Link to="/enquiry">Start Your Journey</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full sm:w-auto h-16 px-10 text-xl font-bold border-white/40 text-white hover:bg-white/10 hover:border-white transition-all hover:-translate-y-1 rounded-full backdrop-blur-sm">
                <Link to="/plans">View Pricing</Link>
              </Button>
            </div>
          </motion.div>
        </div>
        
        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/50"
        >
          <div className="w-[30px] h-[50px] rounded-full border-2 border-white/30 flex justify-center p-2">
            <div className="w-1.5 h-3 bg-white/50 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Why Choose Us?</h2>
            <p className="text-muted-foreground text-lg">
              We provide the best environment for your fitness goals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30, rotateX: 45 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: index * 0.15, duration: 0.6, type: "spring" }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="bg-card border border-border/50 p-8 rounded-3xl shadow-lg hover:shadow-primary/20 hover:border-primary/50 transition-all duration-300 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full transition-transform duration-500 group-hover:scale-150" />
                <div className="bg-primary/10 w-20 h-20 rounded-2xl flex items-center justify-center mb-6 relative z-10">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4 relative z-10">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-lg relative z-10">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Gallery Section */}
      <section className="py-24 bg-secondary/10 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Experience the <span className="text-primary">Vibe</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl">
                Glimpses of our intense workouts, amazing community, and epic gym trips.
              </p>
            </div>
            <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
              <Button onClick={() => setShowModal(true)} size="lg" className="h-14 px-8 rounded-full text-lg font-bold bg-primary hover:bg-primary/90 shadow-[0_0_15px_rgba(234,88,12,0.4)]">
                <Upload className="w-5 h-5 mr-2" /> Upload Your Vibe
              </Button>
            </motion.div>
          </div>

          {/* Filter Tabs */}
          <div className="flex justify-center md:justify-start gap-4 mb-12 border-b border-border/40 pb-4">
            <button
              onClick={() => setActiveFilter('all')}
              className={`pb-2 px-4 text-lg font-bold border-b-2 transition-all ${
                activeFilter === 'all'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              All Vibes
            </button>
            <button
              onClick={() => setActiveFilter('official')}
              className={`pb-2 px-4 text-lg font-bold border-b-2 transition-all ${
                activeFilter === 'official'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Official Gallery
            </button>
            <button
              onClick={() => setActiveFilter('community')}
              className={`pb-2 px-4 text-lg font-bold border-b-2 transition-all ${
                activeFilter === 'community'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Member Uploads
            </button>
          </div>

          {/* Photos Carousel */}
          <div className="mb-16 relative group/carousel">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold border-l-4 border-primary pl-4">Community Photos</h3>
            </div>
            
            <div 
              className="flex overflow-hidden pb-12 pt-8 -mt-8 -mx-4 px-4 [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]"
              style={{ perspective: "1200px" }}
            >
              <div className="flex gap-6 animate-infinite-scroll">
                {[...filteredImages, ...filteredImages].map((item, index) => (
                  <div
                    key={index}
                    className="flex-shrink-0 w-80 h-80 rounded-2xl overflow-hidden aspect-square bg-muted relative group cursor-pointer reel-item border border-border/50"
                  >
                    <img 
                      src={item.url} 
                      alt={`Gym ${index}`} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/20 opacity-0 group-hover:opacity-100 transition-all duration-500 flex justify-between items-end p-4 border-[3px] border-primary/0 group-hover:border-primary/80 rounded-2xl z-10">
                      <span className="text-white font-bold text-sm shadow-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        {item.uploader_name === 'Official' ? 'Muscle Up Gym' : item.uploader_name}
                      </span>
                      {item.uploader_name === 'Official' && (
                        <span className="text-[10px] bg-primary text-black font-extrabold px-2 py-0.5 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75 shadow-lg">Official</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Gym Videos Carousel */}
          <div className="mb-16 relative group/carousel">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold border-l-4 border-primary pl-4">Muscle Up Gym Videos</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={() => scroll(gymVideosRef, 'left')} className="rounded-full border-primary/20 hover:bg-primary/10">
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => scroll(gymVideosRef, 'right')} className="rounded-full border-primary/20 hover:bg-primary/10">
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div 
              ref={gymVideosRef}
              className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 select-none scrollbar-hide"
            >
              {filteredGymVideos.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05, duration: 0.5, type: "spring" }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="flex-shrink-0 w-64 aspect-[9/16] bg-card rounded-[2rem] overflow-hidden border border-border/50 shadow-lg relative group cursor-pointer snap-start"
                >
                  <div className="absolute inset-0 bg-black flex items-center justify-center">
                    <video 
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                    >
                      <source src={item.url} type="video/mp4" />
                    </video>
                  </div>
                  
                  <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80 pointer-events-none" />
                  
                  <div className="absolute bottom-6 left-4 right-4 pointer-events-auto">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center border-2 border-white pointer-events-none">
                        <Play className="w-3 h-3 text-white fill-white" />
                      </div>
                      <a href={`https://instagram.com/${item.ig_handle || 'muscleup.1'}`} target="_blank" rel="noreferrer" className="font-bold text-white shadow-black drop-shadow-md hover:text-primary transition-colors cursor-pointer z-10 block">
                        @{item.ig_handle || 'muscleup.1'}
                      </a>
                      {item.uploader_name === 'Official' && (
                        <span className="text-[10px] bg-primary text-black font-extrabold px-2 py-0.5 rounded-full ml-auto pointer-events-none">Official</span>
                      )}
                    </div>
                    <p className="text-sm text-white/90 font-medium line-clamp-2 drop-shadow-md pointer-events-none">
                      {item.uploader_name === 'Official' ? 'Official gym reels. Elite workout vibes! 🔥' : `Community gym reel uploaded by ${item.uploader_name}`}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Trip Videos Carousel */}
          <div className="relative group/carousel">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold border-l-4 border-primary pl-4">Trips & Activities</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={() => scroll(tripVideosRef, 'left')} className="rounded-full border-primary/20 hover:bg-primary/10">
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => scroll(tripVideosRef, 'right')} className="rounded-full border-primary/20 hover:bg-primary/10">
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div 
              ref={tripVideosRef}
              className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 select-none scrollbar-hide"
            >
              {filteredTripVideos.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05, duration: 0.5, type: "spring" }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="flex-shrink-0 w-64 aspect-[9/16] bg-card rounded-[2rem] overflow-hidden border border-border/50 shadow-lg relative group cursor-pointer snap-start"
                >
                  <div className="absolute inset-0 bg-black flex items-center justify-center">
                    <video 
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                    >
                      <source src={item.url} type="video/mp4" />
                    </video>
                  </div>
                  
                  <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80 pointer-events-none" />
                  
                  <div className="absolute bottom-6 left-4 right-4 pointer-events-auto">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center border-2 border-white pointer-events-none">
                        <Play className="w-3 h-3 text-white fill-white" />
                      </div>
                      <a href={`https://instagram.com/${item.ig_handle || 'muscleup.1'}`} target="_blank" rel="noreferrer" className="font-bold text-white shadow-black drop-shadow-md hover:text-primary transition-colors cursor-pointer z-10 block">
                        @{item.ig_handle || 'muscleup.1'}
                      </a>
                      {item.uploader_name === 'Official' && (
                        <span className="text-[10px] bg-primary text-black font-extrabold px-2 py-0.5 rounded-full ml-auto pointer-events-none">Official</span>
                      )}
                    </div>
                    <p className="text-sm text-white/90 font-medium line-clamp-2 drop-shadow-md pointer-events-none">
                      {item.uploader_name === 'Official' ? 'Official trip reels. The fam goes out! 🏕️' : `Trip reel uploaded by ${item.uploader_name}`}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

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

              <form onSubmit={handleUploadSubmit} className="space-y-4 mt-6">
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

                {mediaFile && mediaFile.type.startsWith('video') && (
                  <div className="space-y-1.5 pt-2 animate-in fade-in slide-in-from-top-2">
                    <Label>Video Category *</Label>
                    <select 
                      value={videoCategory}
                      onChange={(e) => setVideoCategory(e.target.value)}
                      className="w-full h-12 rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      <option value="gym">Gym Workout Video</option>
                      <option value="trip">Gym Trip & Activity Video</option>
                    </select>
                  </div>
                )}

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
