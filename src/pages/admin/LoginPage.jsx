import React, { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

// Import assets
import gymLogo from '@/assets/gym-logo.jpg'
import businessPhoto from '@/assets/business-photo.jpg'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export function LoginPage() {
  const { user, signIn } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  })

  if (user) {
    return <Navigate to="/admin/dashboard" replace />
  }

  const onSubmit = async (data) => {
    setLoading(true)
    const { error } = await signIn(data.email, data.password)
    
    if (error) {
      toast.error(error.message || 'Failed to login')
    } else {
      toast.success('Logged in successfully')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen w-full flex bg-background relative overflow-hidden">
      
      {/* Left Column - Business Photo */}
      <div className="hidden lg:flex w-1/2 relative bg-black items-end justify-center pb-20">
        <img 
          src={businessPhoto} 
          alt="MuscleUp Gym Business" 
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        {/* Heavy dark gradient from bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30" />
        <div className="relative z-10 text-center px-12 max-w-xl">
          <h1 className="text-4xl xl:text-5xl font-black text-white tracking-tight uppercase mb-4">
            Empower Your <span className="text-primary">Business</span>
          </h1>
          <p className="text-lg text-gray-300 font-medium">
            Manage your members, track payments, and grow your fitness empire with ease.
          </p>
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 relative">
        {/* Subtle background glow for mobile */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/8 via-background to-background lg:hidden" />
        
        <Card className="w-full max-w-md relative glass-card border-none shadow-2xl bg-card/90">
          <CardHeader className="space-y-4 items-center text-center pb-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-primary/50 shadow-[0_0_20px_rgba(212,133,44,0.2)] bg-black shrink-0">
              <img src={gymLogo} alt="Gym Logo" className="w-full h-full object-cover" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-2xl sm:text-3xl font-black tracking-tight text-primary uppercase">
                MuscleUp <span className="text-foreground">Fitness</span>
              </CardTitle>
              <CardDescription className="text-muted-foreground font-medium text-sm sm:text-base">
                Admin Control Panel
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2 relative">
                <Label htmlFor="email" className="text-foreground font-semibold">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@muscleup.local"
                  {...register('email')}
                  className={`bg-background/50 border-border focus-visible:ring-primary h-12 text-base ${errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  disabled={loading}
                />
                {errors.email && <p className="text-destructive text-sm mt-1">{errors.email.message}</p>}
              </div>
              <div className="space-y-2 relative">
                <Label htmlFor="password" className="text-foreground font-semibold">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...register('password')}
                    className={`bg-background/50 border-border focus-visible:ring-primary h-12 text-base pr-12 ${errors.password ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-destructive text-sm mt-1">{errors.password.message}</p>}
              </div>
              <Button
                type="submit"
                className="w-full h-12 text-black font-bold text-base bg-primary hover:bg-primary/90 transition-all duration-300"
                disabled={loading}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'LOGIN SECURELY'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
