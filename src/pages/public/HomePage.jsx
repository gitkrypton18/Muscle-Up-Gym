import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Dumbbell, Users, Trophy, Target, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
            <source src="/assets/videos/gym/SaveClip.App_AQPOZ667nwSQW6Nay30PugR7clxmguitE6vUXc3zE4i5JZ7vgyt96C_4f9gmLIZ-mSQC1DDEdl_WJ8KDssF0uj-EYw1vBq-dUdU_5Mo.mp4" type="video/mp4" />
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

      {/* Mini Gallery/CTA Section */}
      <section className="py-24 bg-secondary/30 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:w-1/2 space-y-6"
            >
              <h2 className="text-3xl md:text-5xl font-bold">Experience the Vibe</h2>
              <p className="text-lg text-muted-foreground">
                Our gym isn't just about heavy weights, it's about the culture. From intense workout sessions to gym trips, we build a family.
              </p>
              <Button asChild size="lg" className="mt-4 gap-2">
                <Link to="/gallery">
                  View Full Gallery <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="lg:w-1/2 grid grid-cols-2 gap-4"
            >
              <div className="space-y-4">
                <video autoPlay loop muted playsInline className="rounded-2xl object-cover w-full h-64 shadow-lg">
                  <source src="/assets/videos/gym/hero-bg.mp4" type="video/mp4" />
                </video>
                <img src="/assets/images/SaveClip.App_662274601_18120769123720791_2941504078796601949_n.jpg" alt="Gym" className="rounded-2xl object-cover w-full h-48 shadow-lg" />
              </div>
              <div className="space-y-4 pt-8">
                <img src="/assets/images/SaveClip.App_655614549_18171361543398453_1062577139582213994_n.jpg" alt="Gym" className="rounded-2xl object-cover w-full h-64 shadow-lg" />
                <img src="/assets/images/SaveClip.App_623842267_18073333688117521_5819781928970786734_n.jpg" alt="Gym" className="rounded-2xl object-cover w-full h-48 shadow-lg" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
