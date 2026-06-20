
import { motion } from 'framer-motion'
import { Check, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { PLANS } from '@/lib/constants'

export function PlansPage() {
  return (
    <div className="min-h-screen pt-24 pb-20 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-primary/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-primary/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6"
          >
            <Shield className="w-4 h-4" />
            <span>No Hidden Fees</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-extrabold mb-6"
          >
            Simple, Transparent <span className="text-primary">Pricing</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-muted-foreground"
          >
            Choose the plan that best fits your fitness journey.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {PLANS.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative bg-card rounded-3xl p-8 border ${plan.isPopular || plan.isBestValue ? 'border-primary shadow-lg shadow-primary/20 scale-105 z-10' : 'border-border shadow-sm'} flex flex-col`}
            >
              {(plan.isPopular || plan.isBestValue) && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-bold tracking-wide">
                  {plan.isPopular ? 'MOST POPULAR' : 'BEST VALUE'}
                </div>
              )}
              
              <div className="mb-8">
                <h3 className="text-xl font-bold text-muted-foreground mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold">₹{plan.amount}</span>
                  <span className="text-muted-foreground">/{plan.durationDays} days</span>
                </div>
              </div>

              <div className="flex-1 space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/20 p-1 rounded-full mt-0.5">
                    <Check className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="text-foreground">Full Gym Access</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-primary/20 p-1 rounded-full mt-0.5">
                    <Check className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="text-foreground">Free Weights & Cardio</span>
                </div>
                {plan.durationDays >= 90 && (
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/20 p-1 rounded-full mt-0.5">
                      <Check className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="text-foreground">Personalized Diet Plan</span>
                  </div>
                )}
                {plan.durationDays >= 365 && (
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/20 p-1 rounded-full mt-0.5">
                      <Check className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="text-foreground">VIP Support</span>
                  </div>
                )}
              </div>

              <Button asChild size="lg" variant={plan.isPopular || plan.isBestValue ? 'default' : 'outline'} className={`w-full ${plan.isPopular || plan.isBestValue ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : ''}`}>
                <Link to={`/enquiry?plan=${plan.name.replace(' ', '+')}`}>Choose Plan</Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
