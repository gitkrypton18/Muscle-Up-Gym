import { useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff, Loader2, Phone, KeyRound, ShieldCheck, X, Lock, User, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'

// Import assets
import gymLogo from '@/assets/gym-logo.jpg'
import businessPhoto from '@/assets/business-photo.jpg'

// ── Constants ─────────────────────────────────────────────────────────────────
const OWNER_PHONE     = '9352048617'
const ADMIN_EMAIL     = 'admin@muscleup.local'   // exposed after verification
const ADMIN_USER_ID   = 'admin@muscleup.local'   // shown as "user id"

// ── Zod Schemas ───────────────────────────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const newPasswordSchema = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your password'),
}).refine(d => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

// ── Forgot-Password Modal ──────────────────────────────────────────────────────
function ForgotPasswordModal({ onClose }) {
  // step: 'phone' | 'verified' | 'done'
  const [step, setStep]             = useState('phone')
  const [phone, setPhone]           = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [verifying, setVerifying]   = useState(false)
  const [resetting, setResetting]   = useState(false)
  const [showNew, setShowNew]       = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(newPasswordSchema) })

  // ── Step 1: Verify phone ──────────────────────────────────────────────────
  const handlePhoneVerify = async (e) => {
    e.preventDefault()
    setPhoneError('')
    setVerifying(true)

    // Simulate a brief "checking" delay for UX
    await new Promise(r => setTimeout(r, 700))

    const cleaned = phone.replace(/\D/g, '')
    if (cleaned !== OWNER_PHONE) {
      setPhoneError('❌ Phone number does not match our records.')
      setVerifying(false)
      return
    }

    // Phone matched → move to verified step
    setVerifying(false)
    setStep('verified')
    toast.success('Identity verified! You can now reset your password.', { duration: 4000 })
  }

  // ── Step 2: Set new password ──────────────────────────────────────────────
  const onPasswordReset = async (data) => {
    setResetting(true)

    // Attempt to use Supabase Admin update (needs current session)
    // Since user is NOT logged in, we use resetPasswordForEmail as primary
    // and also try to update directly if a session exists.
    const { data: sessionData } = await supabase.auth.getSession()

    if (sessionData?.session) {
      // Active session — can directly update
      const { error } = await supabase.auth.updateUser({ password: data.newPassword })
      setResetting(false)
      if (error) {
        toast.error('Reset failed: ' + error.message)
      } else {
        toast.success('🎉 Password updated successfully! Please log in with your new password.')
        setStep('done')
      }
    } else {
      // No session — send a password-reset email (Supabase sends a magic link)
      const { error } = await supabase.auth.resetPasswordForEmail(ADMIN_EMAIL, {
        redirectTo: window.location.origin + '/admin/reset-password',
      })
      setResetting(false)
      if (error) {
        toast.error('Could not send reset email: ' + error.message)
      } else {
        toast.success('📧 A password-reset link has been sent to the admin email!', { duration: 6000 })
        setStep('done')
      }
    }
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl border border-border shadow-2xl overflow-hidden"
        style={{ background: 'hsl(var(--card))', animation: 'modalIn 0.25s ease' }}
      >
        {/* Header gradient bar */}
        <div className="h-1 w-full bg-gradient-to-r from-primary via-yellow-400 to-primary" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6">

          {/* ── STEP: phone ─────────────────────────────────────── */}
          {step === 'phone' && (
            <>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-base">Forgot Password?</h3>
                  <p className="text-xs text-muted-foreground">Enter the registered owner phone to continue</p>
                </div>
              </div>

              <form onSubmit={handlePhoneVerify} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">Owner Phone Number</Label>
                  <Input
                    type="tel"
                    placeholder="e.g. 9352048617"
                    value={phone}
                    onChange={e => { setPhone(e.target.value); setPhoneError('') }}
                    className={`h-11 bg-background/60 border-border focus-visible:ring-primary ${phoneError ? 'border-destructive' : ''}`}
                    maxLength={15}
                    autoFocus
                  />
                  {phoneError && (
                    <p className="text-destructive text-xs mt-1">{phoneError}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-primary text-black font-bold hover:bg-primary/90 transition-all"
                  disabled={verifying || !phone.trim()}
                >
                  {verifying
                    ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Verifying…</>
                    : <><ShieldCheck className="w-4 h-4 mr-2" />Verify Identity</>
                  }
                </Button>
              </form>
            </>
          )}

          {/* ── STEP: verified ──────────────────────────────────── */}
          {step === 'verified' && (
            <>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-green-500/15 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-base">Identity Verified ✓</h3>
                  <p className="text-xs text-muted-foreground">Set your new admin password below</p>
                </div>
              </div>

              {/* Revealed User Info */}
              <div className="mb-5 p-3 rounded-xl border border-primary/20 bg-primary/5 space-y-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Admin User ID</p>
                    <p className="text-sm font-bold text-foreground select-all">{ADMIN_USER_ID}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Email on File</p>
                    <p className="text-sm font-bold text-foreground select-all">{ADMIN_EMAIL}</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit(onPasswordReset)} className="space-y-4">
                {/* New Password */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">New Password</Label>
                  <div className="relative">
                    <Input
                      type={showNew ? 'text' : 'password'}
                      placeholder="Min 6 characters"
                      {...register('newPassword')}
                      className={`h-11 bg-background/60 pr-10 border-border focus-visible:ring-primary ${errors.newPassword ? 'border-destructive' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.newPassword && <p className="text-destructive text-xs">{errors.newPassword.message}</p>}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Re-enter password"
                      {...register('confirmPassword')}
                      className={`h-11 bg-background/60 pr-10 border-border focus-visible:ring-primary ${errors.confirmPassword ? 'border-destructive' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-destructive text-xs">{errors.confirmPassword.message}</p>}
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-primary text-black font-bold hover:bg-primary/90"
                  disabled={resetting}
                >
                  {resetting
                    ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Updating…</>
                    : <><KeyRound className="w-4 h-4 mr-2" />Reset Password</>
                  }
                </Button>
              </form>
            </>
          )}

          {/* ── STEP: done ──────────────────────────────────────── */}
          {step === 'done' && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-8 h-8 text-green-500" />
              </div>
              <div>
                <h3 className="text-lg font-black text-foreground">All Done!</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Your password has been reset. Please log in with your new credentials.
                </p>
              </div>
              <Button
                onClick={onClose}
                className="w-full h-11 bg-primary text-black font-bold hover:bg-primary/90"
              >
                Back to Login
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Modal animation keyframe injected inline */}
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.93) translateY(12px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
      `}</style>
    </div>
  )
}

// ── Main Login Page ────────────────────────────────────────────────────────────
export function LoginPage() {
  const { user, signIn } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading]           = useState(false)
  const [showForgot, setShowForgot]     = useState(false)

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
    <>
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
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-foreground font-semibold">Password</Label>
                    {/* ── Forgot Password Link ── */}
                    <button
                      type="button"
                      id="forgot-password-btn"
                      onClick={() => setShowForgot(true)}
                      className="text-xs text-primary hover:text-primary/80 font-semibold transition-colors underline-offset-2 hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
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
              
              <div className="mt-6">
                <Button variant="outline" asChild className="w-full text-muted-foreground hover:text-foreground">
                  <Link to="/">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Main Website
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Developer Credit */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center text-xs text-muted-foreground w-full">
            <p>Developed by <span className="font-semibold text-foreground">Kalpit Nagar</span> © 2026</p>
            <div className="flex justify-center items-center gap-2 mt-1">
              <a href="https://github.com/gitkrypton18" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">GitHub</a>
              <span>•</span>
              <a href="https://linkedin.com/in/kalpitnagar312" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">LinkedIn</a>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}
    </>
  )
}
