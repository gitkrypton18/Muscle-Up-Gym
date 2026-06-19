import React from 'react'
import { Dumbbell, Target } from 'lucide-react'
import { motion } from 'framer-motion'

export function LoadingSpinner({ className = '' }) {
  return (
    <div className={`flex flex-col justify-center items-center h-full w-full py-12 space-y-8 ${className}`}>
      <div className="relative w-32 h-32 flex items-center justify-center [perspective:1000px]">
        
        {/* The 20KG Plate Spinning in 3D */}
        <motion.div
          animate={{ rotateY: 360, rotateZ: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 flex items-center justify-center opacity-30"
        >
          <div className="w-24 h-24 rounded-full border-[8px] border-foreground flex items-center justify-center bg-background shadow-[0_0_15px_rgba(212,133,44,0.3)]">
            <div className="w-16 h-16 rounded-full border-4 border-dashed border-foreground flex items-center justify-center">
              <span className="font-black text-xs">20 KG</span>
            </div>
          </div>
        </motion.div>

        {/* The Target (Archery) */}
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="absolute text-primary"
        >
          <Target className="w-12 h-12" strokeWidth={1.5} />
        </motion.div>

        {/* The Dumbbell acting as a Dart hitting the target */}
        <motion.div
          animate={{ 
            x: [60, 0, 60],
            y: [-60, 0, -60],
            rotate: [-45, -45, -45],
            scale: [0.5, 1.2, 0.5]
          }}
          transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
          className="absolute z-10 text-foreground"
        >
          <Dumbbell className="w-8 h-8 drop-shadow-lg" />
        </motion.div>

      </div>
      <p className="text-sm font-bold tracking-widest text-primary animate-pulse uppercase">Hitting Targets...</p>
    </div>
  )
}
