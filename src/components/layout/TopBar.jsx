import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation } from 'react-router-dom'
import { Bell, Menu, X } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Sidebar } from './Sidebar'

export function TopBar() {
  const { user } = useAuth()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const getPageTitle = () => {
    const path = location.pathname
    if (path.includes('/dashboard')) return 'Dashboard'
    if (path.includes('/customers/add')) return 'Add Customer'
    if (path.includes('/customers/') && path.includes('/edit')) return 'Edit Customer'
    if (path.includes('/customers/') && path.includes('/renew')) return 'Renew'
    if (path.includes('/customers/')) return 'Customer'
    if (path.includes('/customers')) return 'Customers'
    if (path.includes('/leads')) return 'Leads'
    if (path.includes('/settings')) return 'Settings'
    return 'Admin'
  }

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/95 px-4 sm:px-6 backdrop-blur">
        {/* Hamburger - mobile only */}
        <Button variant="ghost" size="icon" className="md:hidden shrink-0 h-9 w-9" onClick={() => setIsMobileMenuOpen(true)}>
          <Menu className="h-5 w-5" />
        </Button>

        {/* Page title */}
        <h2 className="text-base sm:text-lg font-semibold tracking-tight text-foreground truncate flex-1">
          {getPageTitle()}
        </h2>

        {/* Right side */}
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-9 w-9">
            <Bell className="h-4 w-4" />
          </Button>
          <div className="hidden md:flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center text-primary font-bold text-sm">
              A
            </div>
            <span className="text-sm font-medium text-muted-foreground max-w-[150px] truncate">
              {user?.email || 'admin'}
            </span>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay - rendered via portal to escape any parent stacking context */}
      {isMobileMenuOpen && createPortal(
        <div
          className="fixed inset-0 md:hidden"
          style={{ zIndex: 9999 }}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70" />
          {/* Sidebar panel */}
          <div
            className="absolute inset-y-0 left-0 w-[280px] bg-card shadow-2xl border-r border-border overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-3 top-3 h-9 w-9"
              style={{ zIndex: 10000 }}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
            <div onClick={() => setIsMobileMenuOpen(false)} className="h-full">
              <Sidebar />
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
