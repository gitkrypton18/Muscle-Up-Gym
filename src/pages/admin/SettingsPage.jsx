import React, { useState } from 'react'
import { Download, Save, Loader2, Key } from 'lucide-react'
import { toast } from 'sonner'
import Papa from 'papaparse'
import { saveAs } from 'file-saver'
import { supabase } from '@/lib/supabase'
import { GYM_DETAILS } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export function SettingsPage() {
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [passwords, setPasswords] = useState({
    new: '',
    confirm: ''
  })

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (!passwords.new || passwords.new !== passwords.confirm) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({
      password: passwords.new
    })
    setLoading(false)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Password updated successfully')
      setPasswords({ new: '', confirm: '' })
    }
  }

  const exportData = async () => {
    try {
      setExporting(true)
      
      const { data: customers } = await supabase.from('customers').select('*')
      const { data: memberships } = await supabase.from('memberships').select('*')
      const { data: payments } = await supabase.from('payments').select('*')

      const zipData = {
        'customers.csv': Papa.unparse(customers || []),
        'memberships.csv': Papa.unparse(memberships || []),
        'payments.csv': Papa.unparse(payments || [])
      }

      // Simplified export: Just export active members view for quick access
      const { data: activeMembers } = await supabase.from('active_members').select('*')
      const csv = Papa.unparse(activeMembers || [])
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
      saveAs(blob, `muscleup_members_${new Date().toISOString().split('T')[0]}.csv`)
      
      toast.success('Data exported successfully')
    } catch (error) {
      console.error('Export error', error)
      toast.error('Failed to export data')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-foreground mb-6">Settings</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Key className="w-5 h-5 mr-2 text-primary" /> Change Admin Password
            </CardTitle>
            <CardDescription>Update your login password</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input 
                  type="password" 
                  value={passwords.new} 
                  onChange={e => setPasswords(p => ({...p, new: e.target.value}))}
                  className="bg-background border-border"
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label>Confirm New Password</Label>
                <Input 
                  type="password" 
                  value={passwords.confirm} 
                  onChange={e => setPasswords(p => ({...p, confirm: e.target.value}))}
                  className="bg-background border-border"
                  minLength={6}
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Update Password
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Download className="w-5 h-5 mr-2 text-primary" /> Data Export
            </CardTitle>
            <CardDescription>Download member data as CSV</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-muted-foreground">
              Export a complete list of all active members, their plan details, and expiry status to a CSV file.
            </p>
            <Button onClick={exportData} disabled={exporting} variant="outline" className="w-full border-border hover:bg-secondary">
              {exporting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />} 
              Export Active Members CSV
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card border-border md:col-span-2">
          <CardHeader>
            <CardTitle>Gym Information</CardTitle>
            <CardDescription>Details used across the application</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Gym Name</p>
                <p className="font-semibold text-foreground">{GYM_DETAILS.name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Primary Contact</p>
                <p className="font-semibold text-foreground">{GYM_DETAILS.phone} (Pankaj)</p>
              </div>
              <div>
                <p className="text-muted-foreground">Secondary Contact</p>
                <p className="font-semibold text-foreground">{GYM_DETAILS.phone2} (Raju)</p>
              </div>
              <div>
                <p className="text-muted-foreground">Timings</p>
                <p className="font-semibold text-foreground">{GYM_DETAILS.timings}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-muted-foreground">Address</p>
                <p className="font-semibold text-foreground">{GYM_DETAILS.address}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
