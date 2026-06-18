import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Plus, Eye, Phone, MessageCircle } from 'lucide-react'
import { useCustomers } from '@/hooks/useCustomers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ExpiryBadge } from '@/components/shared/ExpiryBadge'
import { ActionButtons } from '@/components/shared/ActionButtons'
import { calculateDaysRemaining, getInitials, formatCurrency } from '@/lib/utils'

export function CustomersPage() {
  const { customers, loading, fetchCustomers } = useCustomers()
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all') // all, active, expiring, expired

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  const filteredCustomers = customers.filter(c => {
    // Search filter
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.phone.includes(searchTerm)
    if (!matchesSearch) return false

    // Status filter
    const daysLeft = calculateDaysRemaining(c.end_date)
    if (filter === 'active') return daysLeft > 5
    if (filter === 'expiring') return daysLeft >= 0 && daysLeft <= 5
    if (filter === 'expired') return daysLeft < 0
    return true
  })

  const FilterBadge = ({ id, label }) => (
    <Badge 
      variant={filter === id ? 'default' : 'outline'}
      className={`cursor-pointer ${filter === id ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'hover:bg-secondary'}`}
      onClick={() => setFilter(id)}
    >
      {label}
    </Badge>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input 
            placeholder="Search by name or phone..." 
            className="pl-9 bg-card border-border"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shrink-0">
          <Link to="/admin/customers/add">
            <Plus className="w-4 h-4 mr-2" />
            Add Customer
          </Link>
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <FilterBadge id="all" label="All Members" />
        <FilterBadge id="active" label="Active" />
        <FilterBadge id="expiring" label="Expiring Soon" />
        <FilterBadge id="expired" label="Expired" />
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <LoadingSpinner />
        ) : filteredCustomers.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">No customers found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead>Member</TableHead>
                  <TableHead>Plan Details</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map(customer => (
                  <TableRow key={customer.id} className="border-border hover:bg-secondary/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold border border-primary/30 shrink-0">
                          {getInitials(customer.name)}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{customer.name}</p>
                          <p className="text-sm text-muted-foreground">{customer.phone}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-foreground">{customer.plan_name}</p>
                      <p className="text-sm text-muted-foreground">End: {new Date(customer.end_date).toLocaleDateString()}</p>
                    </TableCell>
                    <TableCell>
                      <ExpiryBadge daysRemaining={calculateDaysRemaining(customer.end_date)} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end items-center gap-2">
                        <ActionButtons phone={customer.phone} whatsapp={customer.whatsapp} />
                        <Button variant="outline" size="icon" asChild className="h-8 w-8 border-border hover:bg-secondary">
                          <Link to={`/admin/customers/${customer.id}`}>
                            <Eye className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}
