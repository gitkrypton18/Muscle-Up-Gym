import React from 'react'
import { motion } from 'framer-motion'
import { MapPin, Clock, Phone, Code, Heart, Link as LinkIcon, Building2 } from 'lucide-react'
import { useGymSettings } from '@/hooks/useGymSettings'

const Instagram = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" height="24" viewBox="0 0 24 24" fill="none" 
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
)

export function AboutPage() {
  const { gymDetails } = useGymSettings()
  
  const team = [
    { name: 'Pankaj Nagar', role: 'Co-Founder & Coach', ig: 'pankaj.nagar.17', phone: gymDetails.phone, photo: '/assets/images/pankaj.jpg', objectPosition: 'object-top' },
    { name: 'Irfan Mirza (Raju Bhai)', role: 'Head Trainer', ig: 'irfan_mirza786', phone: gymDetails.phone2, photo: '/assets/images/irfan.jpg', objectPosition: 'object-top' },
    { name: 'Ummed Gurjar', role: 'Gym Manager', ig: '_.ummii._1', phone: '6376952143', photo: '/assets/images/ummed.jpg', objectPosition: 'object-center' }
  ]

  return (
    <div className="min-h-screen pt-24 pb-20 bg-background overflow-hidden relative">
      {/* Dynamic Background */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-[400px] h-[400px] bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-20">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-bold text-sm mb-6 border border-primary/20"
          >
            <Building2 className="w-4 h-4" />
            <span>Our Story</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30, rotateX: 20 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ delay: 0.1, duration: 0.8, type: "spring" }}
            className="text-5xl md:text-7xl font-black mb-8 drop-shadow-lg"
          >
            About <span className="text-primary">Muscle Up Gym</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-xl md:text-2xl text-muted-foreground leading-relaxed"
          >
            A brotherhood dedicated to fitness. Established by fitness enthusiasts, for fitness enthusiasts. 
            Follow our journey on Instagram: 
            <a href="https://www.instagram.com/muscleup.1/" target="_blank" rel="noreferrer" className="text-primary hover:underline ml-2 inline-flex items-center gap-1 font-bold">
              <Instagram className="w-5 h-5" /> @muscleup.1
            </a>
          </motion.p>
        </div>

        {/* Team Section */}
        <div className="mb-24">
          <h2 className="text-4xl font-bold mb-10 text-center">Meet The <span className="text-primary border-b-4 border-primary pb-1">Masters</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {team.map((member, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 40, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.6, type: "spring" }}
                whileHover={{ y: -10, rotateY: 5 }}
                className="bg-card/80 backdrop-blur-sm border border-border/50 p-8 rounded-3xl shadow-xl hover:shadow-primary/20 transition-all text-center group flex flex-col items-center"
              >
                <div className="w-32 h-32 mx-auto bg-primary/20 rounded-full mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 overflow-hidden border-4 border-primary/30">
                  <img src={member.photo} alt={member.name} className={`w-full h-full object-cover ${member.objectPosition || 'object-center'} fallback-bg`} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                  <span className="text-5xl font-black text-primary hidden w-full h-full items-center justify-center">{member.name[0]}</span>
                </div>
                <h3 className="text-2xl font-bold mb-2">{member.name}</h3>
                <p className="text-primary font-medium mb-4">{member.role}</p>
                
                <div className="mt-auto space-y-2">
                  {member.ig && (
                    <a href={`https://www.instagram.com/${member.ig}/`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 text-muted-foreground hover:text-white transition-colors bg-secondary/50 px-4 py-2 rounded-full text-sm">
                      <Instagram className="w-4 h-4" /> @{member.ig}
                    </a>
                  )}
                  {member.phone && (
                    <a href={`tel:${member.phone}`} className="flex items-center justify-center gap-2 text-muted-foreground hover:text-white transition-colors bg-secondary/50 px-4 py-2 rounded-full text-sm">
                      <Phone className="w-4 h-4" /> {member.phone}
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Info & Map Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-24">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8 bg-card border border-border p-8 rounded-3xl shadow-lg"
          >
            <h3 className="text-3xl font-bold mb-6">Location & Hours</h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-background/50 border border-border/50 hover:border-primary/50 transition-colors">
                <MapPin className="w-8 h-8 text-primary shrink-0" />
                <div>
                  <h4 className="font-bold text-xl">Address</h4>
                  <p className="text-muted-foreground mt-1 text-lg">{gymDetails.address}</p>
                  <a href="https://maps.app.goo.gl/NfgFKo4cWbPaz5jJ6" target="_blank" rel="noreferrer" className="text-primary hover:underline text-sm font-medium mt-2 inline-block">
                    Open in Google Maps
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-background/50 border border-border/50 hover:border-primary/50 transition-colors">
                <Clock className="w-8 h-8 text-primary shrink-0" />
                <div>
                  <h4 className="font-bold text-xl">Timings</h4>
                  <p className="text-muted-foreground mt-1 text-lg">{gymDetails.timings}</p>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl overflow-hidden shadow-2xl border border-border/50 h-[400px] relative"
          >
            <a href="https://maps.app.goo.gl/NfgFKo4cWbPaz5jJ6" target="_blank" rel="noreferrer" className="absolute inset-0 z-10"></a>
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d114002.50294792683!2d76.10309990151978!3d26.758362705051833!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x396c2e39cdcbaf21%3A0xe5469af3ceba1526!2sMuscleUp%20Fitness%20Gym!5e0!3m2!1sen!2sin!4v1718804910384!5m2!1sen!2sin" 
              width="100%" 
              height="100%" 
              style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) contrast(100%)' }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            />
          </motion.div>
        </div>

        {/* Sister Business & Developer Credits */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-pink-900/40 to-purple-900/40 border border-pink-500/30 p-8 rounded-3xl shadow-lg relative overflow-hidden"
          >
            <Heart className="absolute -right-6 -bottom-6 w-32 h-32 text-pink-500/10 rotate-12" />
            <h3 className="text-2xl font-bold mb-2">Partner Business</h3>
            <p className="text-xl font-medium text-pink-400 mb-4">Shree Dwarka Collection & Cosmetics</p>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white rounded-full overflow-hidden border-2 border-pink-500">
                <img src="/assets/images/dwarka-logo.jpg" alt="Dwarka Logo" className="w-full h-full object-cover" onError={(e) => e.target.style.display='none'} />
              </div>
              <p className="text-muted-foreground text-lg leading-relaxed relative z-10 flex-1">
                Another business collectively managed by <strong className="text-white">Ummed Gurjar</strong> and <strong className="text-white">Pankaj Nagar</strong> together.
              </p>
            </div>
            <div className="flex flex-col gap-3 relative z-10">
              <a href="https://www.instagram.com/dwarka_collection_cosmetic/" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 bg-pink-500/20 text-pink-300 hover:bg-pink-500/40 transition-colors px-6 py-3 rounded-full font-bold">
                <Instagram className="w-5 h-5" /> @dwarka_collection_cosmetic
              </a>
              <a href="tel:6376952143" className="inline-flex items-center justify-center gap-2 bg-pink-500/20 text-pink-300 hover:bg-pink-500/40 transition-colors px-6 py-3 rounded-full font-bold">
                <Phone className="w-5 h-5" /> Ummed Gurjar: 6376952143
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 border border-blue-500/30 p-8 rounded-3xl shadow-lg relative overflow-hidden"
          >
            <Code className="absolute -right-6 -bottom-6 w-32 h-32 text-blue-500/10 -rotate-12" />
            <h3 className="text-2xl font-bold mb-2">Crafted With Perfection</h3>
            <p className="text-xl font-medium text-blue-400 mb-4">Developed by Kalpit Nagar</p>
            <p className="text-muted-foreground mb-6 text-lg leading-relaxed relative z-10">
              The "God-Level" developer behind this blazing fast, immersive web application.
            </p>
            <div className="flex flex-wrap gap-4 relative z-10">
              <a href="https://www.instagram.com/kalpit_nagar.312/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 hover:bg-blue-500/40 transition-colors px-4 py-2 rounded-full font-bold text-sm">
                <Instagram className="w-4 h-4" /> @kalpit_nagar.312
              </a>
              <a href="#" className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 hover:bg-blue-500/40 transition-colors px-4 py-2 rounded-full font-bold text-sm">
                <LinkIcon className="w-4 h-4" /> LinkedIn
              </a>
              <a href="#" className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 hover:bg-blue-500/40 transition-colors px-4 py-2 rounded-full font-bold text-sm">
                <Code className="w-4 h-4" /> GitHub
              </a>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  )
}
