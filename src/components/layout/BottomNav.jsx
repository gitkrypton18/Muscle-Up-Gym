import React from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, UserPlus, Settings } from 'lucide-react'

const navItems = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Customers', path: '/admin/customers', icon: Users },
  { name: 'Add', path: '/admin/customers/add', icon: UserPlus },
  { name: 'Settings', path: '/admin/settings', icon: Settings },
]

export function BottomNav() {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/90 backdrop-blur-lg border-t border-border pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`p-1 rounded-xl transition-all duration-300 ${
                      isActive ? 'bg-primary/20 scale-110' : ''
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : ''}`} />
                  </div>
                  <span className={`text-[10px] font-medium transition-all duration-300 ${isActive ? 'font-bold' : ''}`}>
                    {item.name}
                  </span>
                </>
              )}
            </NavLink>
          )
        })}
      </div>
    </div>
  )
}
