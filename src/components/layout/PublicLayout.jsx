import React from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { Menu, X, Dumbbell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useGymSettings } from '@/hooks/useGymSettings'

export function PublicLayout() {
  const [isScrolled, setIsScrolled] = React.useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const location = useLocation()
  const { gymDetails } = useGymSettings()

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Plans', path: '/plans' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Reviews', path: '/testimonials' },
    { name: 'Enquiry', path: '/enquiry' },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Navbar */}
      <header
        className={cn(
          'fixed top-0 w-full z-50 transition-all duration-300 border-b border-transparent',
          isScrolled ? 'bg-background/80 backdrop-blur-md border-border shadow-sm py-3' : 'bg-transparent py-5'
        )}
      >
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <img 
              src="/assets/images/Muscle-Up-Fitness-Logo.jpg" 
              alt="Muscle Up Fitness Logo" 
              className="w-12 h-12 object-contain rounded-lg"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="flex flex-col items-start hidden">
              <span className="text-xl md:text-2xl font-black tracking-tighter italic text-white leading-none">
                <span className="text-3xl text-primary">M</span>USCLE<span className="text-primary">U</span>P
              </span>
              <span className="text-[0.6rem] font-bold tracking-[0.2em] text-white/80">FITNESS</span>
            </div>
            <span className="text-xl font-bold tracking-tight hidden md:block ml-2">Muscle Up Fitness</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary relative',
                  location.pathname === link.path ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {link.name}
                {location.pathname === link.path && (
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Button asChild variant="outline" className="border-primary/50 hover:bg-primary/10">
              <Link to="/admin/login">Admin Login</Link>
            </Button>
            <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
              <Link to="/enquiry">Join Now</Link>
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-muted-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-background border-b border-border shadow-lg py-4 px-4 flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  'text-lg font-medium p-2 rounded-md',
                  location.pathname === link.path ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="flex flex-col gap-2 pt-4 border-t border-border">
              <Button asChild variant="outline" className="w-full justify-center">
                <Link to="/admin/login" onClick={() => setMobileMenuOpen(false)}>Admin Login</Link>
              </Button>
              <Button asChild className="w-full justify-center">
                <Link to="/enquiry" onClick={() => setMobileMenuOpen(false)}>Join Now</Link>
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-muted/30 border-t border-border py-12 mt-auto">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4 md:col-span-2">
              <Link to="/" className="flex items-center gap-2">
                <div className="bg-primary p-1.5 rounded-md">
                  <Dumbbell className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold">Muscle Up Gym</span>
              </Link>
              <p className="text-muted-foreground max-w-sm">
                Transform your body, elevate your mind. The ultimate fitness destination with state-of-the-art equipment and expert trainers.
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Quick Links</h4>
              <ul className="space-y-2">
                {navLinks.map((link) => (
                  <li key={link.path}>
                    <Link to={link.path} className="text-muted-foreground hover:text-primary transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Contact Us</h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li>{gymDetails?.address}</li>
                <li>{gymDetails?.timings}</li>
                <li>Pankaj Nagar: {gymDetails?.phone}</li>
                <li>Irfan Mirza: {gymDetails?.phone2}</li>
                <li className="pt-2">
                  <Link to="/admin/login" className="text-sm text-primary hover:underline">
                    Admin Portal
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-12 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Muscle Up Gym. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      {gymDetails?.phone && (
        <a 
          href={`https://wa.me/91${gymDetails.phone.replace(/[^0-9]/g, '').slice(-10)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#128C7E] text-white p-4 rounded-full shadow-2xl transition-transform hover:scale-110 hover:-translate-y-2 flex items-center justify-center group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
            <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
          </svg>
          <span className="absolute right-full mr-4 bg-background border border-border px-3 py-1 rounded-full whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity text-sm font-semibold pointer-events-none">
            Chat on WhatsApp
          </span>
        </a>
      )}
    </div>
  )
}
