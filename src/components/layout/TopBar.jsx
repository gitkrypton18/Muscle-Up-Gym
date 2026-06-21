import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useLocation, Link } from 'react-router-dom'
import { Bell, Menu, X, MessageSquare, Users, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sidebar } from './Sidebar'
import { supabase } from '@/lib/supabase'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function TopBar() {
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState({
    pendingTestimonials: 0,
    newLeads: 0,
    unpaidMembers: 0,
    total: 0
  })

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { count: testimonialsCount } = await supabase
          .from('testimonials')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending')

        const { count: leadsCount } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'new')

        const { data: unpaidData } = await supabase
          .from('payments')
          .select('due_amount, memberships!inner(customers!inner(is_deleted))')
          .gt('due_amount', 0)
          .eq('memberships.customers.is_deleted', false)

        const unpaidCount = unpaidData?.length || 0

        setNotifications({
          pendingTestimonials: testimonialsCount || 0,
          newLeads: leadsCount || 0,
          unpaidMembers: unpaidCount,
          total: (testimonialsCount || 0) + (leadsCount || 0) + unpaidCount
        })
      } catch (error) {
        console.error('Failed to fetch notifications:', error)
      }
    }
    fetchNotifications()
  }, [location.pathname])

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
    if (path.includes('/approvals')) return 'Approvals'
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
        <div className="flex items-center gap-4 shrink-0">
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground h-9 w-9">
                <Bell className="h-4 w-4" />
                {notifications.total > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground animate-in zoom-in">
                    {notifications.total}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 bg-card border-border">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border" />
              
              {notifications.total === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  You are all caught up!
                </div>
              ) : (
                <>
                  {notifications.pendingTestimonials > 0 && (
                    <DropdownMenuItem asChild className="cursor-pointer hover:bg-secondary">
                      <Link to="/admin/approvals" className="flex items-center gap-3 w-full">
                        <div className="bg-amber-500/20 text-amber-500 p-1.5 rounded-full">
                          <MessageSquare className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm text-foreground">Testimonials</span>
                          <span className="text-xs text-muted-foreground">{notifications.pendingTestimonials} pending review</span>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {notifications.newLeads > 0 && (
                    <DropdownMenuItem asChild className="cursor-pointer hover:bg-secondary mt-1">
                      <Link to="/admin/leads" className="flex items-center gap-3 w-full">
                        <div className="bg-blue-500/20 text-blue-500 p-1.5 rounded-full">
                          <Users className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm text-foreground">New Inquiries</span>
                          <span className="text-xs text-muted-foreground">{notifications.newLeads} new leads</span>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {notifications.unpaidMembers > 0 && (
                    <DropdownMenuItem asChild className="cursor-pointer hover:bg-secondary mt-1">
                      <Link to="/admin/dashboard" className="flex items-center gap-3 w-full">
                        <div className="bg-destructive/20 text-destructive p-1.5 rounded-full">
                          <AlertCircle className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm text-foreground">Pending Payments</span>
                          <span className="text-xs text-muted-foreground">{notifications.unpaidMembers} members unpaid</span>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  )}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="hidden md:flex items-center gap-3 pl-2 border-l border-border">
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-primary to-amber-200 flex items-center justify-center text-primary-foreground font-bold text-lg shadow-lg shadow-primary/20">
              P
            </div>
            <span className="text-[15px] font-bold text-foreground typing-effect">
              Welcome, Pankaj Sir
            </span>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && createPortal(
        <div
          className="fixed inset-0 md:hidden"
          style={{ zIndex: 9999 }}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in" />
          {/* Sidebar panel */}
          <div
            className="absolute inset-y-0 left-0 w-[280px] bg-card shadow-2xl border-r border-border overflow-y-auto animate-in slide-in-from-left"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-3 top-3 h-9 w-9 text-muted-foreground hover:text-foreground"
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
