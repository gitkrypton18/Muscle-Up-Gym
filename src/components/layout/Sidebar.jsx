import React from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, UserPlus, FileText, Settings, LogOut } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const navItems = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Customers', path: '/admin/customers', icon: Users },
  { name: 'Add Customer', path: '/admin/customers/add', icon: UserPlus },
  { name: 'Leads', path: '/admin/leads', icon: FileText },
  { name: 'Settings', path: '/admin/settings', icon: Settings },
]

export function Sidebar() {
  const { signOut } = useAuth()

  return (
    <div className="flex flex-col h-full w-[260px] bg-card border-r border-border text-foreground">
      {/* Logo */}
      <div className="p-6">
        <h1 className="text-2xl font-black tracking-tight text-primary uppercase">
          MuscleUp
          <span className="text-foreground block text-sm font-medium tracking-normal mt-1 opacity-70">
            Fitness
          </span>
        </h1>
      </div>

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

      {/* Logout */}
      <div className="p-4 border-t border-border">
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
