import React, { useEffect, useState } from 'react'
import { Plus, Trash2, Loader2, MessageCircle, Phone, UserPlus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useLeads } from '@/hooks/useLeads'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { ActionButtons } from '@/components/shared/ActionButtons'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

export function LeadsPage() {
  const { leads, loading, fetchLeads, addLead, updateLeadStatus, deleteLead } = useLeads()
  const [openDialog, setOpenDialog] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({ name: '', phone: '', message: '' })
  const navigate = useNavigate()

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  const handleAddSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.phone) {
      toast.error('Name and Phone are required')
      return
    }
    
    setSubmitting(true)
    const { error } = await addLead(formData)
    setSubmitting(false)
    
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Lead added successfully')
      setOpenDialog(false)
      setFormData({ name: '', phone: '', message: '' })
      fetchLeads()
    }
  }

  const handleStatusChange = async (id, status) => {
    const { error } = await updateLeadStatus(id, status)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Status updated')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      const { error } = await deleteLead(id)
      if (error) {
        toast.error(error.message)
      } else {
        toast.success('Lead deleted')
      }
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'new': return <Badge className="bg-blue-500/20 text-blue-500 hover:bg-blue-500/30 border-blue-500/50">New</Badge>
      case 'called': return <Badge className="bg-amber-500/20 text-amber-500 hover:bg-amber-500/30 border-amber-500/50">Called</Badge>
      case 'converted': return <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30 border-green-500/50">Converted</Badge>
      case 'not_interested': return <Badge className="bg-gray-500/20 text-gray-500 hover:bg-gray-500/30 border-gray-500/50">Not Interested</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Lead Management</h2>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
              <Plus className="w-4 h-4 mr-2" />
              Add Lead
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-foreground">Add New Lead</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input value={formData.name} onChange={(e) => setFormData(p => ({...p, name: e.target.value}))} className="bg-background border-border" />
              </div>
              <div className="space-y-2">
                <Label>Phone *</Label>
                <Input value={formData.phone} onChange={(e) => setFormData(p => ({...p, phone: e.target.value}))} className="bg-background border-border" />
              </div>
              <div className="space-y-2">
                <Label>Message / Notes</Label>
                <Textarea value={formData.message} onChange={(e) => setFormData(p => ({...p, message: e.target.value}))} className="bg-background border-border resize-none" rows={3} />
              </div>
              <Button type="submit" disabled={submitting} className="w-full bg-primary hover:bg-primary/90 font-bold">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Save Lead
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <LoadingSpinner />
        ) : leads.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            No leads found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead>Date</TableHead>
                  <TableHead>Lead Info</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map(lead => (
                  <TableRow key={lead.id} className="border-border hover:bg-secondary/50">
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <p className="font-semibold text-foreground">{lead.name}</p>
                      <p className="text-sm text-muted-foreground">{lead.phone}</p>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-muted-foreground text-sm">
                      {lead.message || '-'}
                    </TableCell>
                    <TableCell>
                      <Select value={lead.status} onValueChange={(v) => handleStatusChange(lead.id, v)}>
                        <SelectTrigger className="w-[140px] h-8 bg-transparent border-border">
                          <SelectValue>{getStatusBadge(lead.status)}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="called">Called</SelectItem>
                          <SelectItem value="converted">Converted</SelectItem>
                          <SelectItem value="not_interested">Not Interested</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end items-center gap-2">
                        {lead.status !== 'converted' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="h-8 border-green-500/30 text-green-500 hover:bg-green-500/10"
                            onClick={() => {
                              handleStatusChange(lead.id, 'converted')
                              navigate(`/admin/customers/add?name=${encodeURIComponent(lead.name)}&phone=${encodeURIComponent(lead.phone)}`)
                            }}
                          >
                            <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                            Convert
                          </Button>
                        )}
                        <ActionButtons phone={lead.phone} whatsapp={lead.phone} />
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(lead.id)} className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10">
                          <Trash2 className="w-4 h-4" />
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
