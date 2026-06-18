import React from 'react'
import { useLocation } from 'react-router-dom'
import { Bell, Menu } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Sidebar } from './Sidebar'

export function TopBar() {
  const { user } = useAuth()
  const location = useLocation()

  const getPageTitle = () => {
    const path = location.pathname
    if (path.includes('/dashboard')) return 'Dashboard'
    if (path.includes('/customers/add')) return 'Add Customer'
    if (path.includes('/customers/') && path.includes('/edit')) return 'Edit Customer'
    if (path.includes('/customers/') && path.includes('/renew')) return 'Renew Membership'
    if (path.includes('/customers/')) return 'Customer Details'
    if (path.includes('/customers')) return 'Customers'
    if (path.includes('/leads')) return 'Leads'
    if (path.includes('/settings')) return 'Settings'
    return 'Admin Panel'
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/95 px-6 backdrop-blur">
      <div className="flex md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[260px] border-border bg-card">
            <Sidebar />
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex-1">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {getPageTitle()}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Bell className="h-5 w-5" />
        </Button>
        <div className="hidden md:flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center text-primary font-bold">
            A
          </div>
          <span className="text-sm font-medium text-muted-foreground">
            {user?.email || 'admin@muscleup.local'}
          </span>
        </div>
      </div>
    </header>
  )
}
