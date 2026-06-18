import React, { useState, useEffect } from 'react'
import { Download, Save, Loader2, Key, Star } from 'lucide-react'
import { toast } from 'sonner'
import Papa from 'papaparse'
import { saveAs } from 'file-saver'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useGymSettings } from '@/hooks/useGymSettings'
import { Badge } from '@/components/ui/badge'

export function SettingsPage() {
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [passwords, setPasswords] = useState({
    new: '',
    confirm: ''
  })

  const { gymDetails, saveGymDetails } = useGymSettings()
  const [gymForm, setGymForm] = useState(gymDetails)

  useEffect(() => {
    setGymForm(gymDetails)
  }, [gymDetails])

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

  const handleGymDetailsSave = (e) => {
    e.preventDefault()
    saveGymDetails(gymForm)
    toast.success('Gym details updated successfully')
  }

  const exportData = async () => {
    try {
      setExporting(true)
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
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
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
            <form onSubmit={handleGymDetailsSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Gym Name</Label>
                  <Input 
                    value={gymForm.name} 
                    onChange={e => setGymForm({...gymForm, name: e.target.value})}
                    className="bg-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input 
                    value={gymForm.address} 
                    onChange={e => setGymForm({...gymForm, address: e.target.value})}
                    className="bg-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    Primary Contact 
                    {gymForm.phone.includes('93520') && <Badge className="bg-amber-500/15 text-amber-500 border-amber-500/30 text-[10px] px-1.5"><Star className="w-3 h-3 mr-1 inline" /> Owner (Pankaj)</Badge>}
                  </Label>
                  <Input 
                    value={gymForm.phone} 
                    onChange={e => setGymForm({...gymForm, phone: e.target.value})}
                    className="bg-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    Secondary Contact
                    {gymForm.phone2.includes('9887') && <Badge className="bg-blue-500/15 text-blue-500 border-blue-500/30 text-[10px] px-1.5">Trainer (Raju)</Badge>}
                  </Label>
                  <Input 
                    value={gymForm.phone2} 
                    onChange={e => setGymForm({...gymForm, phone2: e.target.value})}
                    className="bg-background border-border"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Timings</Label>
                  <Input 
                    value={gymForm.timings} 
                    onChange={e => setGymForm({...gymForm, timings: e.target.value})}
                    className="bg-background border-border"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full sm:w-auto mt-4 bg-primary hover:bg-primary/90 text-primary-foreground">
                <Save className="w-4 h-4 mr-2" /> Save Details
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Developer Credit */}
      <div className="mt-12 text-center text-xs text-muted-foreground">
        <p>Developed by <span className="font-semibold text-foreground">Kalpit Nagar</span> © 2026</p>
        <div className="flex justify-center items-center gap-3 mt-2">
          <a href="https://github.com/gitkrypton18" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">GitHub</a>
          <span>•</span>
          <a href="https://linkedin.com/in/kalpitnagar312" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">LinkedIn</a>
          <span>•</span>
          <span>Contact: kalpitnagar312@gmail.com</span>
        </div>
      </div>
    </div>
  )
}
