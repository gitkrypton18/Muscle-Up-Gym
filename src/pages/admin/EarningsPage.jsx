import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Wallet, IndianRupee, TrendingDown, CreditCard, Trash2, Calendar, AlertTriangle } from 'lucide-react'
import { useEarnings } from '@/hooks/useEarnings'
import { StatCard } from '@/components/shared/StatCard'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { formatCurrency } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function EarningsPage() {
  const { earningsData, loading, deletePaymentRecord } = useEarnings()
  const [paymentToDelete, setPaymentToDelete] = useState(null)

  if (loading) return <LoadingSpinner />

  const { thisMonth, totalEarnings, lowestEarning, totalDue, payments } = earningsData

  const handleDelete = async () => {
    if (!paymentToDelete) return
    const { error } = await deletePaymentRecord(paymentToDelete.id)
    if (error) {
      toast.error(error.message || 'Failed to delete payment')
    } else {
      toast.success('Payment deleted successfully')
      setPaymentToDelete(null)
    }
  }

  return (
    <div className="space-y-5 pb-20 sm:pb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Earnings & Payments</h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Earnings This Month" value={formatCurrency(thisMonth)} icon={Calendar} color="emerald" />
        <StatCard title="Total Earnings" value={formatCurrency(totalEarnings)} icon={Wallet} color="blue" />
        <StatCard title="Lowest Earning" value={formatCurrency(lowestEarning)} icon={TrendingDown} color="purple" />
        <StatCard title="Total Due" value={formatCurrency(totalDue)} icon={CreditCard} color="red" />
      </div>

      {/* Payment History Table */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
          <CardTitle className="text-lg text-foreground flex items-center">
            <IndianRupee className="w-5 h-5 mr-2 text-primary" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
          {payments.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <p className="text-sm">No payment records found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="min-w-[600px] px-4 sm:px-0">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border/50 text-xs text-muted-foreground">
                      <th className="pb-3 font-medium">Date</th>
                      <th className="pb-3 font-medium">Customer</th>
                      <th className="pb-3 font-medium">Plan</th>
                      <th className="pb-3 font-medium text-right">Amount Paid</th>
                      <th className="pb-3 font-medium text-right">Due Amount</th>
                      <th className="pb-3 font-medium text-center">Method</th>
                      <th className="pb-3 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {payments.map((p) => (
                      <tr key={p.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                        <td className="py-3 pr-4">
                          <span className="text-foreground whitespace-nowrap">
                            {new Date(p.payment_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          {p.customer_id ? (
                            <Link to={`/admin/customers/${p.customer_id}`} className="font-medium text-foreground hover:text-primary transition-colors hover:underline">
                              {p.customer_name}
                            </Link>
                          ) : (
                            <span className="font-medium text-foreground">{p.customer_name}</span>
                          )}
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground">{p.plan_name}</td>
                        <td className="py-3 pr-4 text-right">
                          <span className="font-bold text-emerald-500">{formatCurrency(p.paid_amount)}</span>
                        </td>
                        <td className="py-3 pr-4 text-right">
                          {p.due_amount > 0 ? (
                            <span className="text-red-500 font-medium">₹{p.due_amount}</span>
                          ) : (
                            <span className="text-muted-foreground/50">-</span>
                          )}
                        </td>
                        <td className="py-3 pr-4 text-center">
                          <Badge variant="outline" className="text-[10px] bg-secondary border-border uppercase">
                            {p.payment_method}
                          </Badge>
                        </td>
                        <td className="py-3 text-right">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setPaymentToDelete(p)}
                            className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      {paymentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4 border border-red-500/30">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-center text-foreground mb-2">Delete Payment</h3>
            <p className="text-center text-sm text-muted-foreground mb-6">
              Are you sure you want to delete this payment of <strong className="text-foreground">₹{paymentToDelete.paid_amount}</strong> for {paymentToDelete.customer_name}? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setPaymentToDelete(null)}>
                Cancel
              </Button>
              <Button variant="destructive" className="flex-1 bg-red-500 hover:bg-red-600 text-white" onClick={handleDelete}>
                Delete Payment
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
