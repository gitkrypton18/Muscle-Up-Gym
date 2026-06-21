import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, Plus, Trash2, ChevronRight } from 'lucide-react'
import { useCustomers } from '@/hooks/useCustomers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ExpiryBadge } from '@/components/shared/ExpiryBadge'
import { ActionButtons } from '@/components/shared/ActionButtons'
import { calculateDaysRemaining, getInitials, generateWhatsAppMessage } from '@/lib/utils'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'

export function CustomersPage() {
  const { customers, loading, fetchCustomers, deleteCustomer } = useCustomers()
  const [searchTerm, setSearchTerm] = useState('')
  const [searchParams, setSearchParams] = useSearchParams()
  const filter = searchParams.get('filter') || 'all'
  const setFilter = (val) => setSearchParams({ filter: val })

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  // Sort: expired first, then expiring, then active
  const sortedCustomers = [...customers].sort((a, b) => {
    const daysA = calculateDaysRemaining(a.end_date)
    const daysB = calculateDaysRemaining(b.end_date)
    // Expired first (negative days), then expiring soon (0-5), then active
    if (daysA < 0 && daysB >= 0) return -1
    if (daysA >= 0 && daysB < 0) return 1
    if (daysA <= 5 && daysA >= 0 && daysB > 5) return -1
    if (daysB <= 5 && daysB >= 0 && daysA > 5) return 1
    return daysA - daysB
  })

  // Helper to check if a customer matches current filter
  const matchesFilter = (c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.phone.includes(searchTerm)
    if (!matchesSearch) return false

    const daysLeft = calculateDaysRemaining(c.end_date)
    if (filter === 'active') return daysLeft > 5
    if (filter === 'expiring') return daysLeft >= 0 && daysLeft <= 5
    if (filter === 'expired') return daysLeft < 0
    if (filter === 'paid') return !c.due_amount || c.due_amount <= 0
    if (filter === 'unpaid') return c.due_amount > 0
    return true
  }

  // Group into singles and couples BEFORE filtering
  const groupedCustomers = []
  const processedIds = new Set()

  sortedCustomers.forEach(c => {
    if (processedIds.has(c.id)) return

    // Find if they have a partner
    const partner = sortedCustomers.find(p => p.id === c.partner_id || p.partner_id === c.id)
    
    if (partner && !processedIds.has(partner.id)) {
      groupedCustomers.push({ type: 'couple', primary: c.partner_id ? partner : c, partner: c.partner_id ? c : partner })
      processedIds.add(c.id)
      processedIds.add(partner.id)
    } else {
      groupedCustomers.push({ type: 'single', customer: c })
      processedIds.add(c.id)
    }
  })

  // Filter the groups (if either partner matches, show the couple)
  const filteredGroups = groupedCustomers.filter(group => {
    if (group.type === 'single') return matchesFilter(group.customer)
    return matchesFilter(group.primary) || matchesFilter(group.partner)
  })

  const filterTabs = [
    { id: 'all', label: 'All', count: customers.length },
    { id: 'active', label: 'Active', count: customers.filter(c => calculateDaysRemaining(c.end_date) > 5).length },
    { id: 'expiring', label: 'Expiring', count: customers.filter(c => { const d = calculateDaysRemaining(c.end_date); return d >= 0 && d <= 5 }).length },
    { id: 'expired', label: 'Expired', count: customers.filter(c => calculateDaysRemaining(c.end_date) < 0).length },
    { id: 'unpaid', label: 'Due', count: customers.filter(c => c.due_amount > 0).length },
  ]

  const handleDelete = async (e, customerObj) => {
    e.preventDefault()
    e.stopPropagation()
    if (customerObj.due_amount > 0) {
      toast.error(`Cannot delete ${customerObj.name}: Outstanding dues of ₹${customerObj.due_amount} must be paid first.`)
      return
    }
    if (window.confirm(`Are you sure you want to delete ${customerObj.name}?`)) {
      const { error } = await deleteCustomer(customerObj.id)
      if (error) {
        toast.error(error.message || `Failed to delete ${customerObj.name}`)
      } else {
        toast.success(`${customerObj.name} deleted successfully`)
        fetchCustomers()
      }
    }
  }

  const handleDeleteCouple = async (e, p1, p2) => {
    e.preventDefault()
    e.stopPropagation()
    if (p1.due_amount > 0 || p2.due_amount > 0) {
      const duesText = []
      if (p1.due_amount > 0) duesText.push(`${p1.name} has ₹${p1.due_amount} due`)
      if (p2.due_amount > 0) duesText.push(`${p2.name} has ₹${p2.due_amount} due`)
      toast.error(`Cannot delete couple: ${duesText.join(' and ')}. Dues must be settled first.`)
      return
    }
    if (window.confirm(`Are you sure you want to delete BOTH ${p1.name} and ${p2.name}?`)) {
      const res1 = await deleteCustomer(p1.id)
      if (res1.error) {
        toast.error(res1.error.message || `Failed to delete ${p1.name}`)
        return
      }
      const res2 = await deleteCustomer(p2.id)
      if (res2.error) {
        // Rollback first deletion
        await supabase.from('customers').update({ is_deleted: false }).eq('id', p1.id)
        toast.error(res2.error.message || `Failed to delete ${p2.name}. Rolled back changes.`)
        return
      }
      toast.success(`Deleted couple ${p1.name} and ${p2.name} successfully`)
      fetchCustomers()
    }
  }

  const getPaymentBadge = (customer) => {
    if (customer.due_amount > 0) {
      return <Badge className="bg-red-500/15 text-red-400 border-red-500/30 text-[11px] px-2 py-0.5">₹{customer.due_amount} Due</Badge>
    }
    return <Badge className="bg-green-500/15 text-green-400 border-green-500/30 text-[11px] px-2 py-0.5">Paid</Badge>
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search name or phone..."
            className="pl-9 bg-card border-border h-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shrink-0 h-10">
          <Link to="/admin/customers/add">
            <Plus className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Add Customer</span>
          </Link>
        </Button>
      </div>

      {/* Filter Tabs - scrollable on mobile */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        {filterTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === tab.id
                ? 'bg-primary text-black'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
            {tab.count > 0 && <span className="ml-1 opacity-70">({tab.count})</span>}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-3">
        {loading ? (
          <LoadingSpinner />
        ) : filteredGroups.length === 0 ? (
          <div className="text-center py-16 px-4 bg-card border border-border rounded-xl">
            <div className="w-14 h-14 bg-secondary rounded-full flex items-center justify-center mx-auto mb-3">
              <Search className="w-7 h-7 text-muted-foreground" />
            </div>
            <h3 className="text-base font-semibold text-foreground">No customers found</h3>
            <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          filteredGroups.map(group => {
            if (group.type === 'single') {
              const customer = group.customer
              const daysLeft = calculateDaysRemaining(customer.end_date)
              const isExpired = daysLeft < 0
              const isExpiring = daysLeft >= 0 && daysLeft <= 5

              return (
                <Link
                  key={customer.id}
                  to={`/admin/customers/${customer.id}`}
                  className={`block bg-card border rounded-xl p-4 transition-all active:scale-[0.98] hover:shadow-lg hover:shadow-primary/5 ${
                    isExpired ? 'border-red-500/30' : isExpiring ? 'border-amber-500/30' : 'border-border hover:border-primary/30'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border ${
                      isExpired ? 'bg-red-500/15 text-red-400 border-red-500/30' :
                      isExpiring ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' :
                      'bg-primary/15 text-primary border-primary/30'
                    }`}>
                      {getInitials(customer.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold text-foreground text-[15px] truncate">{customer.name}</h3>
                        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                      </div>
                      <p className="text-sm text-muted-foreground">{customer.phone}</p>
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        <Badge className="bg-secondary text-foreground border-border text-[11px] px-2 py-0.5">{customer.plan_name}</Badge>
                        <ExpiryBadge daysRemaining={daysLeft} />
                        {getPaymentBadge(customer)}
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span>{new Date(customer.start_date || customer.created_at).toLocaleDateString('en-IN', {day:'2-digit', month:'short'})} → {new Date(customer.end_date).toLocaleDateString('en-IN', {day:'2-digit', month:'short', year:'2-digit'})}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                    <ActionButtons phone={customer.phone} whatsapp={customer.whatsapp} message={generateWhatsAppMessage({ name: customer.name, daysLeft, dueAmount: customer.due_amount })} />
                    <Button variant="outline" size="sm" onClick={(e) => handleDelete(e, customer)} className="h-8 px-3 border-red-500/20 text-red-400 hover:bg-red-500/10 text-xs">
                      <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                    </Button>
                  </div>
                </Link>
              )
            } else {
              // COUPLE SPLIT CARD
              const p1 = group.primary
              const p2 = group.partner
              
              const d1 = calculateDaysRemaining(p1.end_date)
              const d2 = calculateDaysRemaining(p2.end_date)
              
              return (
                <div key={`${p1.id}-${p2.id}`} className="block bg-card border border-purple-500/40 bg-purple-500/5 rounded-xl transition-all overflow-hidden">
                  {/* Shared Header */}
                  <div className="flex justify-between items-center px-4 py-2 border-b border-purple-500/20 bg-purple-500/10">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-[10px] uppercase font-bold">COUPLE PLAN</Badge>
                      <span className="text-xs text-muted-foreground font-medium">{p1.plan_name?.replace(' (Partner)', '')}</span>
                    </div>
                  </div>

                  {/* Split Body */}
                  <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-purple-500/20">
                    
                    {/* Primary Half */}
                    <Link to={`/admin/customers/${p1.id}`} className="flex-1 p-4 hover:bg-purple-500/10 transition-colors active:bg-purple-500/15">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border ${d1 < 0 ? 'bg-red-500/15 text-red-400 border-red-500/30' : 'bg-purple-500/20 text-purple-400 border-purple-500/40'}`}>
                          {getInitials(p1.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground text-[14px] truncate flex items-center gap-1">{p1.name} <ChevronRight className="w-3 h-3 text-muted-foreground" /></h3>
                          <p className="text-xs text-muted-foreground">{p1.phone}</p>
                          <div className="flex flex-wrap items-center gap-1.5 mt-2">
                            <ExpiryBadge daysRemaining={d1} />
                            {getPaymentBadge(p1)}
                          </div>
                        </div>
                      </div>
                    </Link>

                    {/* Partner Half */}
                    <Link to={`/admin/customers/${p2.id}`} className="flex-1 p-4 hover:bg-purple-500/10 transition-colors active:bg-purple-500/15">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border ${d2 < 0 ? 'bg-red-500/15 text-red-400 border-red-500/30' : 'bg-purple-500/20 text-purple-400 border-purple-500/40'}`}>
                          {getInitials(p2.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground text-[14px] truncate flex items-center gap-1">{p2.name} <ChevronRight className="w-3 h-3 text-muted-foreground" /></h3>
                          <p className="text-xs text-muted-foreground">{p2.phone}</p>
                          <div className="flex flex-wrap items-center gap-1.5 mt-2">
                            <ExpiryBadge daysRemaining={d2} />
                            {getPaymentBadge(p2)}
                          </div>
                        </div>
                      </div>
                    </Link>
                    
                  </div>

                  {/* Shared Bottom Action Bar */}
                  <div className="flex items-center justify-end px-4 py-3 bg-purple-500/5 border-t border-purple-500/20">
                     <Button variant="outline" size="sm" onClick={(e) => handleDeleteCouple(e, p1, p2)} className="h-8 px-3 border-red-500/20 text-red-400 hover:bg-red-500/10 text-xs">
                        <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete Both
                     </Button>
                  </div>
                </div>
              )
            }
          })
        )}
      </div>

      {/* Footer count */}
      {!loading && filteredGroups.length > 0 && (
        <p className="text-center text-xs text-muted-foreground py-2">
          Showing {filteredGroups.reduce((acc, g) => acc + (g.type === 'couple' ? 2 : 1), 0)} of {customers.length} members
        </p>
      )}
    </div>
  )
}
