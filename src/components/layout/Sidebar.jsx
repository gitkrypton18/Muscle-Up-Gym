import React from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, UserPlus, FileText, Settings, LogOut, IndianRupee, Home, CheckCircle, MessageSquare } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import gymLogo from '@/assets/gym-logo.jpg'

const navItems = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Earnings', path: '/admin/earnings', icon: IndianRupee },
  { name: 'Customers', path: '/admin/customers', icon: Users },
  { name: 'Add Customer', path: '/admin/customers/add', icon: UserPlus },
  { name: 'Inquiries', path: '/admin/leads', icon: FileText },
  { name: 'Approvals', path: '/admin/approvals', icon: CheckCircle },
  { name: 'Testimonials', path: '/admin/testimonials', icon: MessageSquare },
  { name: 'Settings', path: '/admin/settings', icon: Settings },
]

export function Sidebar() {
  const { signOut } = useAuth()

  return (
    <div className="flex flex-col h-full w-[260px] bg-card border-r border-border text-foreground">
      {/* Logo */}
      <NavLink to="/admin/dashboard" className="p-6 flex items-center gap-3 hover:opacity-80 transition-opacity">
        <div className="w-12 h-12 rounded-lg overflow-hidden border border-primary/50 shadow-[0_0_15px_rgba(212,133,44,0.3)] bg-black shrink-0">
          <img src={gymLogo} alt="Gym Logo" className="w-full h-full object-cover" />
        </div>
        <h1 className="text-2xl font-black tracking-tight text-primary uppercase leading-tight">
          MuscleUp
          <span className="text-foreground block text-xs font-medium tracking-normal opacity-70">
            Fitness
          </span>
        </h1>
      </NavLink>

      {/* Nav Links */}
      <div className="flex-1 px-4 py-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 ${
                  isActive
                    ? 'bg-primary/10 text-primary font-medium border border-primary/20'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {item.name}
            </NavLink>
          )
        })}
      </div>

      {/* Public Site Link */}
      <div className="p-4 border-t border-border pb-0">
        <NavLink
          to="/"
          className="flex w-full items-center gap-3 px-3 py-2.5 text-muted-foreground rounded-lg hover:bg-secondary hover:text-foreground transition-all duration-150"
        >
          <Home className="w-5 h-5" />
          Back to Website
        </NavLink>
      </div>

      {/* Logout */}
      <div className="p-4">
        <button
          onClick={() => signOut()}
          className="flex w-full items-center gap-3 px-3 py-2.5 text-muted-foreground rounded-lg hover:bg-destructive/10 hover:text-destructive transition-all duration-150"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  )
}
